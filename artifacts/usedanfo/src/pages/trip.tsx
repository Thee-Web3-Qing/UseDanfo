import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  useGetMe, getGetMeQueryKey,
  useStartTrip, useUpdateTrip, useAddTripEvent,
  useGeoAutocomplete, getGeoAutocompleteQueryKey,
  geoReverse,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Play, Square, MapPin, Navigation2, CheckCircle2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type GpsPoint = { lat: number; lng: number; ts: number };
type SelectedArea = { name: string; lat?: number; lng?: number };

function LocationSearchInput({
  value,
  onSelect,
  placeholder,
  disabled,
}: {
  value: string;
  onSelect: (area: SelectedArea) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const params = { q: query, limit: 7 };
  const { data, isFetching } = useGeoAutocomplete(params, {
    query: {
      queryKey: getGeoAutocompleteQueryKey(params),
      enabled: query.length >= 2,
      staleTime: 10_000,
    },
  });

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" size={18} />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-[#222222] border-2 border-[#333333] focus:border-[#FFC72C] text-white pl-12 pr-10 py-4 font-['Syne'] outline-none appearance-none disabled:opacity-50"
        />
        {query && !disabled && (
          <button
            onClick={() => { setQuery(""); onSelect({ name: "" }); setOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 bg-[#1a1a1a] border border-[#333333] border-t-0 z-50 max-h-56 overflow-y-auto shadow-xl">
          {isFetching && (
            <div className="px-4 py-3 text-[#888888] font-['Syne'] text-sm">Searching...</div>
          )}
          {!isFetching && data?.results?.length === 0 && (
            <div className="px-4 py-3 text-[#888888] font-['Syne'] text-sm">No results for "{query}"</div>
          )}
          {data?.results?.map((r) => (
            <button
              key={r.landmark_id ?? `${r.lat}-${r.lng}`}
              onClick={() => {
                setQuery(r.landmark_name);
                setOpen(false);
                onSelect({ name: r.landmark_name, lat: r.lat, lng: r.lng });
              }}
              className="w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors border-b border-[#333333] last:border-b-0"
            >
              <div className="font-['Syne'] text-white text-sm font-bold">{r.landmark_name}</div>
              <div className="font-['Syne'] text-[#888888] text-xs capitalize">{r.category} · {r.city}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripRecorder() {
  const [, setLocation] = useLocation();
  const { data: me, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });

  const startTripMutation = useStartTrip();
  const updateTripMutation = useUpdateTrip();
  const addEventMutation = useAddTripEvent();

  const [state, setState] = useState<"IDLE" | "RECORDING" | "REVIEW">("IDLE");
  const [fromArea, setFromArea] = useState<SelectedArea>({ name: "" });
  const [toArea, setToArea] = useState<SelectedArea>({ name: "" });
  const [tripId, setTripId] = useState<number | null>(null);

  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([]);
  const [currentGps, setCurrentGps] = useState<GpsPoint | null>(null);
  const [eventsLogged, setEventsLogged] = useState({ entered: 0, dropped: 0, paidCount: 0, totalPaid: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [eventStatus, setEventStatus] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [showPayInput, setShowPayInput] = useState(false);

  const pendingGpsRef = useRef<GpsPoint[]>([]);

  useEffect(() => {
    if (!isLoading && !me) setLocation("/login");
  }, [me, isLoading, setLocation]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state === "RECORDING") {
      interval = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (state !== "RECORDING" || !tripId) return;
    const interval = setInterval(() => {
      if (pendingGpsRef.current.length === 0) return;
      const batch = [...pendingGpsRef.current];
      pendingGpsRef.current = [];
      updateTripMutation.mutate({ id: tripId, data: { gps_points: batch } });
    }, 5000);
    return () => clearInterval(interval);
  }, [state, tripId]);

  const handleStartTrip = () => {
    if (!fromArea.name || !toArea.name) return;

    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const initial_gps: GpsPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() };
        setCurrentGps(initial_gps);
        setGpsPoints([initial_gps]);
        pendingGpsRef.current = [];

        startTripMutation.mutate(
          { data: { from_area: fromArea.name, to_area: toArea.name, initial_gps } },
          {
            onSuccess: (trip) => {
              setTripId(trip.id);
              setState("RECORDING");
              setElapsedTime(0);
              setEventsLogged({ entered: 0, dropped: 0, paidCount: 0, totalPaid: 0 });

              const id = navigator.geolocation.watchPosition(
                (p) => {
                  const pt: GpsPoint = { lat: p.coords.latitude, lng: p.coords.longitude, ts: Date.now() };
                  setCurrentGps(pt);
                  setGpsPoints((prev) => [...prev, pt]);
                  pendingGpsRef.current.push(pt);
                },
                (err) => console.error("GPS Error:", err),
                { enableHighAccuracy: true }
              );
              setWatchId(id);
            },
          }
        );
      },
      () => { alert("We need your location to record the trip!"); }
    );
  };

  const handleEndTrip = (abandon: boolean = false) => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    if (!tripId) return;

    const finalBatch = [...pendingGpsRef.current];
    pendingGpsRef.current = [];

    updateTripMutation.mutate(
      { id: tripId, data: { status: abandon ? "abandoned" : "completed", gps_points: finalBatch } },
      {
        onSuccess: () => {
          if (abandon) { setState("IDLE"); setTripId(null); setGpsPoints([]); }
          else setState("REVIEW");
        },
      }
    );
  };

  const autoDetectArea = useCallback(async (pt: GpsPoint): Promise<string> => {
    try {
      const result = await geoReverse({ lat: pt.lat, lng: pt.lng, radius_meters: 500 });
      return result.nearest_landmark || result.neighborhood || result.primary_address || "";
    } catch {
      return "";
    }
  }, []);

  const logEvent = async (type: "entered_bus" | "dropped" | "paid") => {
    if (!tripId) return;
    const lastPoint = currentGps || gpsPoints[gpsPoints.length - 1];

    if (type === "paid") {
      setShowPayInput(true);
      return;
    }

    setEventStatus("Detecting location...");
    const areaName = lastPoint ? await autoDetectArea(lastPoint) : "";
    setEventStatus(null);

    addEventMutation.mutate(
      { id: tripId, data: { event_type: type, area_name: areaName || undefined, gps_point: lastPoint } },
      {
        onSuccess: () => {
          const label = type === "entered_bus" ? "Entered bus" : "Dropped";
          setEventStatus(`${label}${areaName ? ` at ${areaName}` : ""}`);
          setTimeout(() => setEventStatus(null), 3000);
          if (type === "entered_bus") setEventsLogged((p) => ({ ...p, entered: p.entered + 1 }));
          if (type === "dropped") setEventsLogged((p) => ({ ...p, dropped: p.dropped + 1 }));
        },
      }
    );
  };

  const submitPay = () => {
    if (!tripId || !payAmount || isNaN(Number(payAmount))) return;
    const amount = Number(payAmount);
    const lastPoint = currentGps || gpsPoints[gpsPoints.length - 1];
    addEventMutation.mutate(
      { id: tripId, data: { event_type: "paid", amount, gps_point: lastPoint } },
      {
        onSuccess: () => {
          setEventsLogged((p) => ({ ...p, paidCount: p.paidCount + 1, totalPaid: p.totalPaid + amount }));
          setEventStatus(`Paid ₦${amount.toLocaleString()}`);
          setTimeout(() => setEventStatus(null), 3000);
        },
      }
    );
    setShowPayInput(false);
    setPayAmount("");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading || !me) return <LoadingScreen />;

  return (
    <div className="min-h-[100dvh] bg-[#111111] flex flex-col text-white">
      <Navbar />

      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {state === "IDLE" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1">
              <div className="mb-8">
                <h1 className="font-['Dela_Gothic_One'] text-4xl uppercase tracking-tight text-[#FFC72C]">Record a Trip</h1>
                <p className="font-['Syne'] text-[#888888] mt-1">Help Lagos by recording your danfo journey</p>
              </div>

              <div className="space-y-6 flex-1">
                <div>
                  <label className="font-['Syne'] uppercase font-bold text-sm tracking-wider text-[#888888] mb-2 block">Where are you starting from?</label>
                  <LocationSearchInput
                    value={fromArea.name}
                    onSelect={setFromArea}
                    placeholder="Search area or landmark..."
                  />
                </div>

                <div>
                  <label className="font-['Syne'] uppercase font-bold text-sm tracking-wider text-[#888888] mb-2 block">Where are you going?</label>
                  <LocationSearchInput
                    value={toArea.name}
                    onSelect={setToArea}
                    placeholder="Search area or landmark..."
                  />
                </div>
              </div>

              <Button
                onClick={handleStartTrip}
                disabled={!fromArea.name || !toArea.name || startTripMutation.isPending}
                className="w-full h-16 bg-[#FFC72C] text-[#111111] hover:bg-white text-xl uppercase font-bold tracking-wider rounded-none font-['Syne'] mt-8"
              >
                {startTripMutation.isPending ? "STARTING..." : "START TRIP"} <Play className="ml-2" />
              </Button>
            </motion.div>
          )}

          {state === "RECORDING" && (
            <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 relative">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#222222] rounded-full border border-[#FFC72C]/30 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFC72C] animate-pulse shadow-[0_0_8px_#FFC72C]" />
                  <span className="font-['Syne'] uppercase font-bold text-sm tracking-wider text-[#FFC72C]">Recording</span>
                </div>
                <h2 className="font-['Dela_Gothic_One'] text-2xl uppercase tracking-tight mb-2">
                  {fromArea.name} &rarr; {toArea.name}
                </h2>
                <div className="flex justify-center items-center gap-6 text-[#888888] font-['Syne'] text-sm">
                  <span className="flex items-center gap-1"><Navigation2 size={14} /> GPS Active</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {gpsPoints.length} pts</span>
                </div>
              </div>

              <div className="flex justify-center items-center py-6 flex-1">
                <div className="font-['Dela_Gothic_One'] text-7xl tracking-tight text-white">
                  {formatTime(elapsedTime)}
                </div>
              </div>

              <AnimatePresence>
                {eventStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-center mb-4 px-4 py-2 bg-[#222222] border border-[#FFC72C]/40 font-['Fredoka'] text-[#FFC72C] text-lg"
                  >
                    {eventStatus}
                  </motion.div>
                )}
              </AnimatePresence>

              {showPayInput ? (
                <div className="flex gap-3 mb-4">
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Amount paid (₦)"
                    className="flex-1 bg-[#222222] border-2 border-[#FFC72C] text-white px-4 py-4 font-['Syne'] text-xl outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && submitPay()}
                  />
                  <Button onClick={submitPay} className="bg-[#FFC72C] text-[#111111] hover:bg-white px-6 rounded-none font-bold">OK</Button>
                  <Button onClick={() => { setShowPayInput(false); setPayAmount(""); }} className="bg-[#333333] text-white hover:bg-[#444444] px-4 rounded-none">
                    <X size={20} />
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Button
                    onClick={() => logEvent("entered_bus")}
                    disabled={addEventMutation.isPending}
                    className="h-16 bg-[#FFC72C] text-[#111111] hover:bg-white font-bold rounded-none font-['Syne'] text-lg"
                  >
                    ENTERED BUS
                  </Button>
                  <Button
                    onClick={() => logEvent("dropped")}
                    disabled={addEventMutation.isPending}
                    className="h-16 bg-transparent border-2 border-white hover:border-[#FFC72C] hover:text-[#FFC72C] font-bold rounded-none font-['Syne'] text-lg"
                  >
                    DROPPED
                  </Button>
                  <Button
                    onClick={() => logEvent("paid")}
                    disabled={addEventMutation.isPending}
                    className="col-span-2 h-16 bg-transparent border-2 border-white hover:border-[#FFC72C] hover:text-[#FFC72C] font-bold rounded-none font-['Syne'] text-lg"
                  >
                    PAID FARE
                  </Button>
                </div>
              )}

              <Button
                onClick={() => handleEndTrip(false)}
                disabled={updateTripMutation.isPending}
                className="w-full h-16 bg-white text-[#111111] hover:bg-gray-200 uppercase font-bold tracking-wider rounded-none font-['Syne'] mb-4"
              >
                COMPLETE TRIP <Square className="ml-2 fill-current" size={16} />
              </Button>

              <button
                onClick={() => handleEndTrip(true)}
                className="text-[#888888] hover:text-white transition-colors text-sm font-['Syne'] uppercase tracking-widest text-center"
              >
                Abandon Trip
              </button>
            </motion.div>
          )}

          {state === "REVIEW" && (
            <motion.div key="review" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center flex-1 text-center">
              <CheckCircle2 size={80} className="text-[#FFC72C] mb-6" />
              <h2 className="font-['Dela_Gothic_One'] text-4xl uppercase tracking-tight mb-2">Trip Complete!</h2>
              <p className="font-['Fredoka'] text-xl text-[#888888] mb-8">Lagos thanks you for your contribution</p>

              <div className="w-full bg-[#222222] p-6 text-left space-y-4 mb-8">
                <div className="flex justify-between border-b border-[#333333] pb-4">
                  <span className="text-[#888888] font-['Syne'] uppercase font-bold tracking-wider text-sm">Route</span>
                  <span className="font-bold">{fromArea.name} &rarr; {toArea.name}</span>
                </div>
                <div className="flex justify-between border-b border-[#333333] pb-4">
                  <span className="text-[#888888] font-['Syne'] uppercase font-bold tracking-wider text-sm">Duration</span>
                  <span className="font-bold">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex justify-between border-b border-[#333333] pb-4">
                  <span className="text-[#888888] font-['Syne'] uppercase font-bold tracking-wider text-sm">GPS Points</span>
                  <span className="font-bold">{gpsPoints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888] font-['Syne'] uppercase font-bold tracking-wider text-sm">Events</span>
                  <span className="font-bold text-right text-sm">
                    {eventsLogged.entered} entered, {eventsLogged.dropped} dropped<br />
                    {eventsLogged.paidCount > 0 && `Paid ₦${eventsLogged.totalPaid.toLocaleString()} (${eventsLogged.paidCount}x)`}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => { setTripId(null); setFromArea({ name: "" }); setToArea({ name: "" }); setGpsPoints([]); setState("IDLE"); }}
                className="w-full h-16 bg-[#FFC72C] text-[#111111] hover:bg-white text-xl uppercase font-bold tracking-wider rounded-none font-['Syne'] mb-4"
              >
                RECORD ANOTHER
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                className="w-full h-16 bg-transparent border-2 border-white hover:border-white text-xl uppercase font-bold tracking-wider rounded-none font-['Syne']"
              >
                VIEW DASHBOARD
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

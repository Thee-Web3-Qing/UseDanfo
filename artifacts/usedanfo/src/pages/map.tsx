import { useEffect, useRef, useState } from "react";
import { useGetRoutesMap, getGetRoutesMapQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Search } from "lucide-react";
import L from "leaflet";
import polylineDecode from "polyline";

const AREA_COORDS: Record<string, [number, number]> = {
  "Yaba": [6.5095, 3.3711],
  "Sabo": [6.5054, 3.3787],
  "Surulere": [6.4969, 3.3515],
  "Mushin": [6.5350, 3.3538],
  "Oshodi": [6.5568, 3.3494],
  "Ikeja": [6.6018, 3.3515],
  "Maryland": [6.5672, 3.3609],
  "Ketu": [6.5966, 3.3913],
  "Ojota": [6.5824, 3.3968],
  "Berger": [6.6351, 3.3656],
  "Agege": [6.6177, 3.3123],
  "Iyana Ipaja": [6.6013, 3.2681],
  "Abule Egba": [6.6256, 3.2507],
  "Dopemu": [6.6089, 3.2937],
  "Ikotun": [6.5295, 3.2900],
  "Egbeda": [6.5531, 3.2854],
  "CMS": [6.4543, 3.3947],
  "Marina": [6.4530, 3.3958],
  "Obalende": [6.4534, 3.4139],
  "Victoria Island": [6.4281, 3.4219],
  "Ikoyi": [6.4432, 3.4333],
  "Lekki Phase 1": [6.4282, 3.4769],
  "Chevron": [6.4353, 3.5325],
  "Ajah": [6.4704, 3.5813],
  "Sangotedo": [6.4620, 3.6300],
  "Ikorodu": [6.6194, 3.5096],
  "Gbagada": [6.5534, 3.3838],
  "Onipanu": [6.5376, 3.3690],
  "Anthony": [6.5574, 3.3745],
  "Ogba": [6.6065, 3.3285],
  "Ojodu": [6.6390, 3.3484],
  "Festac": [6.4684, 3.2795],
  "Mile 2": [6.4833, 3.3117],
  "Apapa": [6.4487, 3.3609],
  "Ebute Metta": [6.4714, 3.3617],
  "Orile": [6.4752, 3.3318],
  "Badore": [6.4704, 3.5813],
  "Lekki Phase 2": [6.4350, 3.5600],
  "Balogun": [6.4541, 3.3951],
  "Fadeyi": [6.5258, 3.3712],
  "Unilag": [6.5168, 3.3983],
  "Satellite Town": [6.4485, 3.2817],
};

const CONFIDENCE_COLORS = {
  expert: "#22c55e",
  very_confident: "#FFC72C",
  somewhat_confident: "#f97316",
  not_sure: "#ef4444",
};

type RoutePolylineCache = Record<string, [number, number][] | null>;

export default function RouteMap() {
  const { data: routes, isLoading } = useGetRoutesMap({ query: { queryKey: getGetRoutesMapQueryKey() } });
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [polylineCache, setPolylineCache] = useState<RoutePolylineCache>({});
  const [routeCount, setRouteCount] = useState(0);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([6.5244, 3.3792], 12);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(leafletMapRef.current);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!routes || routes.length === 0) return;

    const BASE = import.meta.env.BASE_URL;

    routes.forEach(async (route) => {
      const cacheKey = `${route.start_area_name}-${route.end_area_name}`;
      if (polylineCache[cacheKey] !== undefined) return;

      try {
        const resp = await fetch(`${BASE}api/geo/route`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin_address: `${route.start_area_name}, Lagos`,
            dest_address: `${route.end_area_name}, Lagos`,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.polyline) {
            const decoded: [number, number][] = polylineDecode.decode(data.polyline).map(
              ([lat, lng]: [number, number]) => [lat, lng]
            );
            setPolylineCache((prev) => ({ ...prev, [cacheKey]: decoded }));
          } else {
            setPolylineCache((prev) => ({ ...prev, [cacheKey]: null }));
          }
        } else {
          setPolylineCache((prev) => ({ ...prev, [cacheKey]: null }));
        }
      } catch {
        setPolylineCache((prev) => ({ ...prev, [cacheKey]: null }));
      }
    });
  }, [routes]);

  useEffect(() => {
    if (!leafletMapRef.current || !routes) return;
    const map = leafletMapRef.current;

    polylinesRef.current.forEach((p) => map.removeLayer(p));
    polylinesRef.current = [];

    const lowerSearch = searchTerm.toLowerCase();
    let count = 0;

    routes.forEach((route) => {
      const matchSearch =
        !searchTerm ||
        route.start_area_name.toLowerCase().includes(lowerSearch) ||
        route.end_area_name.toLowerCase().includes(lowerSearch);

      if (!matchSearch) return;
      count++;

      const color = CONFIDENCE_COLORS[(route.confidence_level as keyof typeof CONFIDENCE_COLORS) ?? "somewhat_confident"];
      const cacheKey = `${route.start_area_name}-${route.end_area_name}`;
      const realPolyline = polylineCache[cacheKey];

      if (realPolyline && realPolyline.length > 1) {
        const pl = L.polyline(realPolyline, { color, weight: 4, opacity: 0.85, lineCap: "round" }).addTo(map);
        pl.bindPopup(popupHtml(route));
        polylinesRef.current.push(pl);
      } else {
        route.legs.forEach((leg) => {
          const start = AREA_COORDS[leg.start_area];
          const end = AREA_COORDS[leg.end_area];
          if (start && end) {
            const pl = L.polyline([start, end], {
              color,
              weight: 3,
              opacity: 0.6,
              lineCap: "round",
              dashArray: realPolyline === null ? "8 4" : undefined,
            }).addTo(map);
            pl.bindPopup(popupHtml(route, leg));
            polylinesRef.current.push(pl);
          }
        });
      }
    });

    setRouteCount(count);
  }, [routes, searchTerm, polylineCache]);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#111111] overflow-hidden text-white">
      <Navbar />

      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#111111]/80">
            <LoadingScreen />
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" size={20} />
            <input
              type="text"
              placeholder="Search areas (e.g. Yaba, Lekki)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#222222]/90 backdrop-blur border border-[#333333] text-white pl-12 pr-4 py-4 font-['Syne'] shadow-xl outline-none focus:border-[#FFC72C] transition-colors rounded-none"
            />
          </div>
          {routes && routes.length > 0 && (
            <div className="mt-2 text-xs font-['Syne'] text-[#888888] text-center">
              {routeCount} route{routeCount !== 1 ? "s" : ""} shown
              {Object.values(polylineCache).filter(Boolean).length > 0 &&
                ` · ${Object.values(polylineCache).filter(Boolean).length} with real road data`}
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-4 z-10 bg-[#111111]/90 backdrop-blur border border-[#333333] p-4 font-['Syne'] text-sm shadow-xl">
          <h3 className="uppercase font-bold tracking-wider mb-3 text-[#FFC72C] text-xs">Route Confidence</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-[#22c55e]"></div> <span className="text-xs">Expert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-[#FFC72C]"></div> <span className="text-xs">Very Confident</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-[#f97316]"></div> <span className="text-xs">Somewhat Confident</span>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#333333]">
              <div className="w-4 h-0.5 bg-[#888888] border-dashed border-t-2 border-[#888888]"></div>
              <span className="text-xs text-[#888888]">Straight line (no road data)</span>
            </div>
          </div>
        </div>

        {routes && routes.length === 0 && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-[#111111]/90 backdrop-blur p-8 text-center border border-[#333333]">
              <h2 className="font-['Dela_Gothic_One'] text-2xl uppercase tracking-tight text-[#FFC72C] mb-2">No routes mapped yet</h2>
              <p className="font-['Syne'] text-[#888888]">Be the first to contribute!</p>
            </div>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full" style={{ background: "#0a0a0a" }} />
      </div>
    </div>
  );
}

function popupHtml(
  route: { start_area_name: string; end_area_name: string; buses_required: string; confidence_level?: string },
  leg?: { start_area: string; end_area: string; fare_range: string; travel_time_range: string }
) {
  return `
    <div style="background:#111;color:white;padding:10px 12px;border-radius:4px;font-family:'Syne',sans-serif;min-width:160px">
      <strong style="color:#FFC72C;display:block;margin-bottom:6px;font-size:13px">${route.start_area_name} &rarr; ${route.end_area_name}</strong>
      ${leg ? `<div style="font-size:11px;color:#aaa;margin-bottom:2px">Leg: ${leg.start_area} &rarr; ${leg.end_area}</div>
      <div style="font-size:11px;color:#aaa">Fare: ${leg.fare_range}</div>` : ""}
      <div style="font-size:11px;color:#aaa;margin-top:2px">${route.buses_required} bus${route.buses_required !== "1" ? "es" : ""} required</div>
    </div>
  `;
}

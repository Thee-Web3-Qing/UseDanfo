import { useGetMe, getGetMeQueryKey, useGetAreas, getGetAreasQueryKey, useCreateRoute, RouteInputBusesRequired, RouteInputConfidenceLevel, RouteInputDifficultyLevel } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";

const FARE_RANGES = ["Under ₦500", "₦500–₦1000", "₦1000–₦1500", "₦1500–₦2500", "₦2500+"];
const TIME_RANGES = ["Under 15 mins", "15–30 mins", "30–60 mins", "1–2 hours", "2+ hours"];

export default function Contribute() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: me, isLoading: isLoadingMe } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const { data: areas, isLoading: isLoadingAreas } = useGetAreas({ query: { queryKey: getGetAreasQueryKey() } });
  const createRouteMutation = useCreateRoute();

  const [step, setStep] = React.useState(1);
  const [startAreaId, setStartAreaId] = React.useState<string>("");
  const [endAreaId, setEndAreaId] = React.useState<string>("");
  const [busesRequired, setBusesRequired] = React.useState<RouteInputBusesRequired | null>(null);
  const [landmark, setLandmark] = React.useState<string>("");
  const [confidenceLevel, setConfidenceLevel] = React.useState<RouteInputConfidenceLevel | null>(null);
  const [difficultyLevel, setDifficultyLevel] = React.useState<RouteInputDifficultyLevel | null>(null);
  const [commonMistake, setCommonMistake] = React.useState<string>("");
  
  const [legs, setLegs] = React.useState([
    { leg_order: 1, start_area: "", end_area: "", fare_range: FARE_RANGES[0], travel_time_range: TIME_RANGES[0] }
  ]);

  React.useEffect(() => {
    if (!isLoadingMe && !me) setLocation("/login");
  }, [me, isLoadingMe, setLocation]);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleAddLeg = () => {
    setLegs([...legs, { 
      leg_order: legs.length + 1, 
      start_area: legs[legs.length - 1].end_area, 
      end_area: "", 
      fare_range: FARE_RANGES[0], 
      travel_time_range: TIME_RANGES[0] 
    }]);
  };

  const handleRemoveLeg = (index: number) => {
    if (legs.length === 1) return;
    const newLegs = [...legs];
    newLegs.splice(index, 1);
    newLegs.forEach((leg, i) => { leg.leg_order = i + 1; });
    setLegs(newLegs);
  };

  const handleLegChange = (index: number, field: string, value: string) => {
    const newLegs = [...legs];
    newLegs[index] = { ...newLegs[index], [field]: value };
    setLegs(newLegs);
  };

  const handleSaveRoute = () => {
    if (!startAreaId || !endAreaId || !busesRequired || !confidenceLevel || !difficultyLevel) return;

    createRouteMutation.mutate({
      data: {
        start_area_id: parseInt(startAreaId),
        end_area_id: parseInt(endAreaId),
        buses_required: busesRequired,
        landmark,
        confidence_level: confidenceLevel,
        difficulty_level: difficultyLevel,
        common_mistake: commonMistake,
        legs: legs
      }
    }, {
      onSuccess: () => {
        setStep(5); // Success screen
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.error || "Failed to save route", variant: "destructive" });
      }
    });
  };

  const resetWizard = () => {
    setStartAreaId("");
    setEndAreaId("");
    setBusesRequired(null);
    setLandmark("");
    setConfidenceLevel(null);
    setDifficultyLevel(null);
    setCommonMistake("");
    setLegs([{ leg_order: 1, start_area: "", end_area: "", fare_range: FARE_RANGES[0], travel_time_range: TIME_RANGES[0] }]);
    setStep(1);
  };

  if (isLoadingMe || isLoadingAreas || !areas) return <LoadingScreen />;

  return (
    <div className="min-h-[100dvh] bg-[#111111] flex flex-col text-white relative">
      <Navbar />
      
      {step < 5 && (
        <div className="w-full flex items-center justify-between p-6 bg-[#111111] sticky top-20 z-40 border-b border-[#222222]">
          {step > 1 ? (
            <button onClick={handleBack} className="text-white hover:text-[#FFC72C] transition-colors p-2">
              <ChevronLeft size={32} />
            </button>
          ) : <div className="w-[48px]" />}
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i <= step ? 'bg-[#FFC72C]' : 'bg-[#222222]'}`} />
              ))}
            </div>
            <span className="font-['Syne'] font-bold uppercase tracking-widest text-[#888888] text-xs">Step {step} of 4</span>
          </div>
          
          <div className="w-[48px]" />
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1: FROM / TO */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full space-y-12">
              <h2 className="font-['Dela_Gothic_One'] text-5xl md:text-7xl uppercase text-center">FROM WHERE TO WHERE?</h2>
              
              <div className="space-y-6 relative flex flex-col items-center">
                <div className="w-full">
                  <label className="font-['Syne'] text-[#FFC72C] uppercase font-bold tracking-widest text-sm mb-4 block">FROM</label>
                  <select 
                    value={startAreaId} 
                    onChange={e => setStartAreaId(e.target.value)}
                    className="w-full h-20 bg-[#222222] text-white border-2 border-[#333333] px-6 text-xl font-['Syne'] uppercase focus:border-[#FFC72C] outline-none appearance-none cursor-pointer rounded-none"
                  >
                    <option value="" disabled>SELECT START AREA</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                <div className="h-16 flex items-center justify-center">
                  <span className="text-3xl text-[#FFC72C]">↓</span>
                </div>

                <div className="w-full">
                  <label className="font-['Syne'] text-[#FFC72C] uppercase font-bold tracking-widest text-sm mb-4 block">TO</label>
                  <select 
                    value={endAreaId} 
                    onChange={e => setEndAreaId(e.target.value)}
                    className="w-full h-20 bg-[#222222] text-white border-2 border-[#333333] px-6 text-xl font-['Syne'] uppercase focus:border-[#FFC72C] outline-none appearance-none cursor-pointer rounded-none"
                  >
                    <option value="" disabled>SELECT DESTINATION</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <Button 
                onClick={handleNext} 
                disabled={!startAreaId || !endAreaId || startAreaId === endAreaId}
                className="w-full h-16 bg-[#FFC72C] text-[#111111] hover:bg-white text-xl uppercase font-bold tracking-wider rounded-none font-['Syne'] mt-12 disabled:opacity-50"
              >
                CONTINUE
              </Button>
            </motion.div>
          )}

          {/* STEP 2: HOW MANY BUSES */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full space-y-12">
              <h2 className="font-['Dela_Gothic_One'] text-5xl md:text-7xl uppercase text-center">HOW MANY BUS?</h2>
              
              <div className="grid gap-6">
                {[
                  { id: "one", title: "ONE BUS", desc: "Direct journey, no change" },
                  { id: "two", title: "TWO BUS", desc: "One connection point" },
                  { id: "three_or_more", title: "THREE+", desc: "Multiple connections" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setBusesRequired(opt.id as RouteInputBusesRequired);
                      // Update legs array length based on selection
                      const count = opt.id === "one" ? 1 : opt.id === "two" ? 2 : 3;
                      const newLegs = Array(count).fill(0).map((_, i) => ({
                        leg_order: i + 1,
                        start_area: i === 0 ? areas.find(a=>a.id.toString()===startAreaId)?.name || "" : "",
                        end_area: i === count - 1 ? areas.find(a=>a.id.toString()===endAreaId)?.name || "" : "",
                        fare_range: FARE_RANGES[0], travel_time_range: TIME_RANGES[0]
                      }));
                      setLegs(newLegs);
                      setTimeout(handleNext, 300);
                    }}
                    className={`p-8 text-left border-2 rounded-none transition-all active:scale-95 flex flex-col gap-2 ${
                      busesRequired === opt.id ? 'border-[#FFC72C] bg-[#FFC72C] text-[#111111]' : 'border-[#222222] bg-[#111111] text-white hover:border-[#FFC72C]'
                    }`}
                  >
                    <span className="font-['Dela_Gothic_One'] text-3xl uppercase">{opt.title}</span>
                    <span className={`font-['Fredoka'] text-lg ${busesRequired === opt.id ? 'text-[#111111]' : 'text-[#888888]'}`}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: BUILD THE JOURNEY */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full space-y-12 pb-12">
              <h2 className="font-['Dela_Gothic_One'] text-5xl md:text-7xl uppercase text-center">BUILD THE JOURNEY</h2>
              
              <div className="space-y-8">
                {legs.map((leg, index) => (
                  <div key={index} className="bg-[#222222] border border-[#333333] p-6 md:p-8 space-y-8">
                    <div className="flex justify-between items-center border-b border-[#333333] pb-4">
                      <h4 className="font-['Syne'] text-[#FFC72C] uppercase font-bold tracking-widest text-lg">LEG {index + 1}</h4>
                      {legs.length > 1 && (
                        <button onClick={() => handleRemoveLeg(index)} className="font-['Syne'] uppercase text-xs font-bold text-[#FF4444] tracking-widest hover:text-white">REMOVE</button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="font-['Syne'] uppercase text-xs font-bold tracking-widest text-[#888888]">FROM</label>
                        <input 
                          value={leg.start_area} onChange={e => handleLegChange(index, "start_area", e.target.value)} 
                          placeholder="e.g. Oshodi" 
                          className="w-full h-14 bg-[#111111] border border-[#333333] text-white px-4 font-['Syne'] focus:border-[#FFC72C] outline-none rounded-none uppercase" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="font-['Syne'] uppercase text-xs font-bold tracking-widest text-[#888888]">TO</label>
                        <input 
                          value={leg.end_area} onChange={e => handleLegChange(index, "end_area", e.target.value)} 
                          placeholder="e.g. CMS" 
                          className="w-full h-14 bg-[#111111] border border-[#333333] text-white px-4 font-['Syne'] focus:border-[#FFC72C] outline-none rounded-none uppercase" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="font-['Syne'] uppercase text-xs font-bold tracking-widest text-[#888888]">FARE RANGE</label>
                      <div className="flex flex-wrap gap-2">
                        {FARE_RANGES.map(f => (
                          <button key={f} onClick={() => handleLegChange(index, "fare_range", f)} type="button"
                            className={`px-4 py-2 border font-['Syne'] text-sm uppercase font-bold tracking-wider rounded-none transition-colors ${leg.fare_range === f ? 'bg-[#FFC72C] border-[#FFC72C] text-[#111111]' : 'bg-[#111111] border-[#333333] text-white hover:border-[#FFC72C]'}`}
                          >{f}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="font-['Syne'] uppercase text-xs font-bold tracking-widest text-[#888888]">ESTIMATED TIME</label>
                      <div className="flex flex-wrap gap-2">
                        {TIME_RANGES.map(t => (
                          <button key={t} onClick={() => handleLegChange(index, "travel_time_range", t)} type="button"
                            className={`px-4 py-2 border font-['Syne'] text-sm uppercase font-bold tracking-wider rounded-none transition-colors ${leg.travel_time_range === t ? 'bg-[#FFC72C] border-[#FFC72C] text-[#111111]' : 'bg-[#111111] border-[#333333] text-white hover:border-[#FFC72C]'}`}
                          >{t}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button onClick={handleAddLeg} className="w-full py-6 border-2 border-dashed border-[#333333] text-[#888888] font-['Syne'] uppercase font-bold tracking-widest hover:border-[#FFC72C] hover:text-[#FFC72C] transition-colors rounded-none">
                  + ADD NEXT LEG
                </button>
              </div>

              <Button 
                onClick={handleNext} 
                disabled={legs.some(l => !l.start_area || !l.end_area)}
                className="w-full h-16 bg-[#FFC72C] text-[#111111] hover:bg-white text-xl uppercase font-bold tracking-wider rounded-none font-['Syne'] mt-12 disabled:opacity-50"
              >
                CONTINUE
              </Button>
            </motion.div>
          )}

          {/* STEP 4: THE INSIDER INFO */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full space-y-12">
              <h2 className="font-['Dela_Gothic_One'] text-5xl md:text-7xl uppercase text-center">THE INSIDER INFO</h2>
              
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="font-['Syne'] uppercase font-bold tracking-widest text-[#FFC72C] block">LANDMARK</label>
                  <input 
                    value={landmark} onChange={e => setLandmark(e.target.value)} 
                    placeholder="e.g. Drop at under bridge, enter near GTBank" 
                    className="w-full h-16 bg-[#222222] border border-[#333333] text-white px-6 font-['Fredoka'] text-lg focus:border-[#FFC72C] outline-none rounded-none" 
                  />
                </div>

                <div className="space-y-4">
                  <label className="font-['Syne'] uppercase font-bold tracking-widest text-[#FFC72C] block">HOW CONFIDENT ARE YOU?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "expert", label: "Expert" },
                      { id: "very_confident", label: "Very Confident" },
                      { id: "somewhat_confident", label: "Somewhat Confident" },
                      { id: "not_sure", label: "Not Sure" }
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setConfidenceLevel(opt.id as RouteInputConfidenceLevel)}
                        className={`p-4 border font-['Syne'] uppercase font-bold tracking-wider rounded-none transition-colors ${confidenceLevel === opt.id ? 'bg-[#FFC72C] border-[#FFC72C] text-[#111111]' : 'bg-[#222222] border-[#333333] text-white hover:border-[#FFC72C]'}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="font-['Syne'] uppercase font-bold tracking-widest text-[#FFC72C] block">HOW DIFFICULT IS IT?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "easy", label: "Easy" },
                      { id: "moderate", label: "Moderate" },
                      { id: "difficult", label: "Difficult" },
                      { id: "very_difficult", label: "Very Difficult" }
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setDifficultyLevel(opt.id as RouteInputDifficultyLevel)}
                        className={`p-4 border font-['Syne'] uppercase font-bold tracking-wider rounded-none transition-colors ${difficultyLevel === opt.id ? 'bg-[#FFC72C] border-[#FFC72C] text-[#111111]' : 'bg-[#222222] border-[#333333] text-white hover:border-[#FFC72C]'}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="font-['Syne'] uppercase font-bold tracking-widest text-[#FFC72C] block flex justify-between">
                    <span>COMMON MISTAKE</span>
                    <span className="text-[#888888]">OPTIONAL</span>
                  </label>
                  <textarea 
                    value={commonMistake} onChange={e => setCommonMistake(e.target.value)} 
                    placeholder="e.g. Don't follow buses that say CMS if they say they'll stop halfway" 
                    className="w-full h-32 bg-[#222222] border border-[#333333] text-white p-6 font-['Fredoka'] text-lg focus:border-[#FFC72C] outline-none resize-none rounded-none" 
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveRoute} 
                disabled={!confidenceLevel || !difficultyLevel || createRouteMutation.isPending}
                className="w-full h-16 bg-[#FFC72C] text-[#111111] hover:bg-white text-xl uppercase font-bold tracking-wider rounded-none font-['Syne'] mt-12 disabled:opacity-50"
              >
                {createRouteMutation.isPending ? "SAVING..." : "SAVE ROUTE"}
              </Button>
            </motion.div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-[#FFC72C] z-50 flex flex-col items-center justify-center p-6 text-center">
              <h2 className="font-['Dela_Gothic_One'] text-6xl md:text-8xl text-[#111111] uppercase leading-none mb-6">ROUTE SAVED!</h2>
              <h2 className="font-['Dela_Gothic_One'] text-6xl md:text-8xl text-white uppercase leading-none mb-12 drop-shadow-md">Ó WÀ!</h2>
              
              <div className="bg-[#111111] p-8 max-w-lg w-full mb-12 space-y-4 text-left border-4 border-white shadow-[8px_8px_0_0_#ffffff]">
                <div className="font-['Syne'] text-[#FFC72C] uppercase font-bold tracking-widest text-sm">ROUTE ADDED</div>
                <h3 className="font-['Dela_Gothic_One'] text-3xl uppercase text-white tracking-tight leading-tight">
                  {areas.find(a=>a.id.toString()===startAreaId)?.name} → {areas.find(a=>a.id.toString()===endAreaId)?.name}
                </h3>
                <div className="flex gap-2 pt-2">
                  <span className="font-['Syne'] text-xs font-bold uppercase tracking-widest px-3 py-1 bg-[#222222] text-[#FFC72C]">{difficultyLevel?.replace(/_/g, ' ')}</span>
                  <span className="font-['Syne'] text-xs font-bold uppercase tracking-widest px-3 py-1 bg-[#222222] text-white">{confidenceLevel?.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
                <Button onClick={resetWizard} className="flex-1 h-16 bg-[#111111] text-white hover:bg-[#222222] text-lg uppercase font-bold tracking-wider rounded-none font-['Syne']">
                  ADD ANOTHER
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full h-16 bg-white text-[#111111] hover:bg-[#111111] hover:text-white border-2 border-transparent hover:border-[#111111] text-lg uppercase font-bold tracking-wider rounded-none font-['Syne'] transition-colors">
                    DASHBOARD
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

import { useGetMe, getGetMeQueryKey, useSubmitOnboarding, OnboardingInputTransportFrequency, OnboardingInputKnownRouteCount } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ChevronLeft } from "lucide-react";

const LAGOS_AREAS = [
  // Mainland — central
  "Yaba", "Sabo", "Unilag", "Surulere", "Mushin", "Oshodi",
  "Ikeja", "Maryland", "Onipanu", "Anthony", "Fadeyi",
  "Gbagada", "Ketu", "Ojota", "Berger", "Ojodu", "Ogba",
  // Mainland — Agege / Abule Egba side
  "Agege", "Iyana Ipaja", "Abule Egba", "Dopemu", "Ile Epo",
  "Ikotun", "Egbeda", "Akowonjo",
  // Mainland — Festac / Mile 2 / Apapa corridor
  "Festac", "Mile 2", "Orile", "Apapa", "Satellite Town", "Ebute Metta",
  // Island
  "CMS", "Marina", "Obalende", "Balogun",
  "Victoria Island", "Ikoyi", "Lekki Phase 1", "Lekki Phase 2",
  "Chevron", "Ajah", "Badore", "Sangotedo",
  // Outskirts
  "Ikorodu",
  "Other",
];

const TRANSPORT_FREQUENCIES: { value: OnboardingInputTransportFrequency, label: string }[] = [
  { value: "daily", label: "Every single day, no excuse" },
  { value: "3-5x_weekly", label: "Almost every day sha" },
  { value: "weekly", label: "Once a week at least" },
  { value: "monthly", label: "When I have no choice" },
  { value: "rarely", label: "Only when e don do" },
];

const ROUTE_COUNTS: { value: OnboardingInputKnownRouteCount, label: string }[] = [
  { value: "1-3", label: "1–3" },
  { value: "4-7", label: "4–7" },
  { value: "8-15", label: "8–15" },
  { value: "15+", label: "15+" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: me, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const submitMutation = useSubmitOnboarding();
  
  const [step, setStep] = React.useState(1);
  const [knownAreas, setKnownAreas] = React.useState<string[]>([]);
  const [frequency, setFrequency] = React.useState<OnboardingInputTransportFrequency | null>(null);
  const [routeCount, setRouteCount] = React.useState<OnboardingInputKnownRouteCount | null>(null);

  React.useEffect(() => {
    if (!isLoading && !me) {
      setLocation("/login");
    } else if (me?.onboarding_completed) {
      setLocation("/dashboard");
    }
  }, [me, isLoading, setLocation]);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => Math.max(1, s - 1));
  const handleSkip = () => setLocation("/dashboard");

  const handleSubmit = () => {
    if (!frequency || !routeCount || knownAreas.length === 0) return;
    
    submitMutation.mutate({
      data: {
        known_areas: knownAreas,
        transport_frequency: frequency,
        known_route_count: routeCount
      }
    }, {
      onSuccess: () => {
        setLocation("/contribute");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save details", variant: "destructive" });
      }
    });
  };

  if (isLoading || !me) return <LoadingScreen />;

  return (
    <div className="min-h-[100dvh] bg-[#111111] flex flex-col relative text-white">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between p-6">
        {step > 1 ? (
          <button onClick={handleBack} className="text-white hover:text-[#FFC72C] transition-colors p-2">
            <ChevronLeft size={32} />
          </button>
        ) : <div className="w-[48px]" />}
        
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i <= step ? 'bg-[#FFC72C]' : 'bg-[#222222]'}`} />
            ))}
          </div>
          <span className="font-['Syne'] font-bold uppercase tracking-widest text-[#888888] text-xs">Step {step} of 3</span>
        </div>
        
        <button onClick={handleSkip} className="font-['Syne'] text-[#888888] hover:text-white text-xs uppercase font-bold tracking-widest transition-colors">
          SKIP
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-12 flex flex-col items-center"
            >
              <div className="text-center space-y-4">
                <h2 className="font-['Dela_Gothic_One'] text-4xl md:text-6xl uppercase tracking-tight leading-none">WHICH AREAS YOU SABI?</h2>
                <p className="font-['Fredoka'] text-xl text-[#FFC72C]">Pick all the areas you know well</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {LAGOS_AREAS.map((area) => {
                  const isSelected = knownAreas.includes(area);
                  return (
                    <button
                      key={area}
                      onClick={() => setKnownAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])}
                      className={`font-['Syne'] uppercase font-bold text-sm tracking-wider p-6 rounded-none border-2 transition-all active:scale-95 ${
                        isSelected 
                          ? 'border-[#FFC72C] bg-[#FFC72C] text-[#111111]' 
                          : 'border-[#222222] bg-transparent text-white hover:border-[#FFC72C]/50'
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
              
              <Button 
                onClick={handleNext} 
                disabled={knownAreas.length === 0}
                className="w-full h-16 bg-[#FFC72C] text-[#111111] hover:bg-white text-xl uppercase font-bold tracking-wider rounded-none font-['Syne'] mt-8 disabled:opacity-50 disabled:bg-[#222222] disabled:text-[#888888]"
              >
                CONTINUE
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-12 flex flex-col items-center"
            >
              <h2 className="font-['Dela_Gothic_One'] text-4xl md:text-6xl uppercase tracking-tight text-center leading-none">HOW OFTEN DO YOU ENTER DANFO?</h2>
              
              <div className="grid grid-cols-1 gap-4 w-full max-w-xl">
                {TRANSPORT_FREQUENCIES.map((freq) => {
                  const isSelected = frequency === freq.value;
                  return (
                    <button
                      key={freq.value}
                      onClick={() => {
                        setFrequency(freq.value);
                        setTimeout(handleNext, 400);
                      }}
                      className={`w-full text-left font-['Fredoka'] text-xl p-8 rounded-none border-2 transition-all active:scale-95 ${
                        isSelected 
                          ? 'border-[#FFC72C] bg-[#FFC72C] text-[#111111]' 
                          : 'border-[#222222] bg-[#111111] text-white hover:border-[#FFC72C]'
                      }`}
                    >
                      {freq.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-12 flex flex-col items-center text-center"
            >
              <h2 className="font-['Dela_Gothic_One'] text-4xl md:text-6xl uppercase tracking-tight leading-none">HOW MANY ROUTES YOU SABI?</h2>
              
              <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                {ROUTE_COUNTS.map((rc) => {
                  const isSelected = routeCount === rc.value;
                  return (
                    <button
                      key={rc.value}
                      onClick={() => setRouteCount(rc.value)}
                      className={`font-['Dela_Gothic_One'] text-4xl py-12 rounded-none border-2 transition-all active:scale-95 ${
                        isSelected 
                          ? 'border-[#FFC72C] bg-[#FFC72C] text-[#111111]' 
                          : 'border-[#222222] bg-transparent text-white hover:border-[#FFC72C]/50'
                      }`}
                    >
                      {rc.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {routeCount && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-['Fredoka'] text-2xl text-[#FFC72C]"
                  >
                    Lagos go thank you 🚌
                  </motion.p>
                )}
              </AnimatePresence>
              
              <Button 
                onClick={handleSubmit}
                disabled={!routeCount || submitMutation.isPending}
                className="w-full max-w-lg h-16 bg-[#FFC72C] text-[#111111] hover:bg-white text-xl uppercase font-bold tracking-wider rounded-none font-['Syne'] mt-8 disabled:opacity-50 disabled:bg-[#222222] disabled:text-[#888888]"
              >
                {submitMutation.isPending ? "SAVING..." : "FINISH"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useGetWrapped, getGetWrappedQueryKey, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function Wrapped() {
  const [, setLocation] = useLocation();
  const { data: me, isLoading: isLoadingMe } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const { data: wrapped, isLoading: isLoadingWrapped } = useGetWrapped({ 
    query: { 
      queryKey: getGetWrappedQueryKey(),
      enabled: !!me
    } 
  });

  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!isLoadingMe && !me) {
      setLocation("/login");
    }
  }, [me, isLoadingMe, setLocation]);

  if (isLoadingMe || isLoadingWrapped) return <LoadingScreen />;
  if (!wrapped) return null;

  const steps = [
    (
      <motion.div key="intro" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -50 }} className="text-center space-y-8 w-full">
        <h1 className="font-['Dela_Gothic_One'] text-[clamp(4rem,15vw,10rem)] leading-[0.85] text-white uppercase text-center w-full">
          YOUR<br/><span className="text-[#FFC72C]">LAGOS</span><br/>STORY.
        </h1>
        <p className="font-['Fredoka'] text-2xl text-[#888888]">Ready to see how you helped map the city?</p>
        <Button className="mt-8 h-16 px-12 bg-[#FFC72C] text-[#111111] hover:bg-white text-xl uppercase font-bold tracking-wider rounded-none font-['Syne']" onClick={() => setStep(1)}>LET'S GO</Button>
      </motion.div>
    ),
    (
      <motion.div key="routes" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="text-center space-y-4 w-full">
        <p className="font-['Syne'] uppercase font-bold tracking-widest text-2xl text-[#888888]">THIS YEAR, YOU CONTRIBUTED</p>
        <h2 className="font-['Dela_Gothic_One'] text-[clamp(8rem,25vw,15rem)] leading-none text-[#FFC72C]">{wrapped.routes_contributed}</h2>
        <p className="font-['Syne'] uppercase font-bold tracking-widest text-3xl text-white">ROUTES TO THE MAP.</p>
        <div className="pt-12">
          <Button variant="outline" className="h-14 px-10 border-white text-white hover:bg-white hover:text-[#111111] uppercase font-bold tracking-wider rounded-none font-['Syne']" onClick={() => setStep(2)}>NEXT →</Button>
        </div>
      </motion.div>
    ),
    (
      <motion.div key="areas" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="text-center space-y-4 w-full">
        <p className="font-['Syne'] uppercase font-bold tracking-widest text-2xl text-[#888888]">YOUR KNOWLEDGE SPANNED ACROSS</p>
        <h2 className="font-['Dela_Gothic_One'] text-[clamp(6rem,20vw,12rem)] leading-none text-white">{wrapped.areas_covered} <span className="text-[clamp(3rem,10vw,6rem)] text-[#FFC72C]">AREAS</span></h2>
        {wrapped.most_familiar_area && (
          <p className="font-['Fredoka'] text-3xl text-[#888888] pt-4">but you really know <span className="text-white font-bold block text-5xl mt-2">{wrapped.most_familiar_area}</span></p>
        )}
        <div className="pt-12">
          <Button variant="outline" className="h-14 px-10 border-white text-white hover:bg-white hover:text-[#111111] uppercase font-bold tracking-wider rounded-none font-['Syne']" onClick={() => setStep(3)}>NEXT →</Button>
        </div>
      </motion.div>
    ),
    (
      <motion.div key="level" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="text-center space-y-8 w-full max-w-4xl mx-auto">
        <p className="font-['Syne'] uppercase font-bold tracking-widest text-2xl text-[#888888]">YOUR OFFICIAL USEDANFO RANK</p>
        <div className="bg-[#FFC72C] py-16 px-6 border-8 border-white shadow-[16px_16px_0_0_#ffffff] my-12 transform -rotate-2">
          <h2 className="font-['Dela_Gothic_One'] text-[clamp(3rem,10vw,7rem)] leading-none text-[#111111] uppercase">{wrapped.contributor_level}</h2>
        </div>
        
        {wrapped.badges.length > 0 && (
          <div className="flex justify-center gap-4 flex-wrap">
            {wrapped.badges.map(b => (
              <div key={b.id} className="bg-[#222222] px-6 py-3 border border-[#333333] flex items-center gap-3">
                <span className="text-3xl">{b.icon}</span>
                <span className="font-['Syne'] uppercase font-bold text-white tracking-widest text-sm">{b.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-8">
          <Button variant="outline" className="h-14 px-10 border-white text-white hover:bg-white hover:text-[#111111] uppercase font-bold tracking-wider rounded-none font-['Syne']" onClick={() => setStep(4)}>SEE SUMMARY</Button>
        </div>
      </motion.div>
    ),
    (
      <motion.div key="share" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-auto space-y-6">
        <div className="bg-[#111111] border-4 border-[#FFC72C] p-8 shadow-[12px_12px_0_0_#FFC72C] relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl pointer-events-none">🚌</div>
          
          <h3 className="font-['Dela_Gothic_One'] text-3xl text-white uppercase mb-8 border-b-2 border-[#222222] pb-6">USEDANFO WRAPPED</h3>
          
          <div className="space-y-8 mb-12 relative z-10">
            <div>
              <div className="font-['Syne'] text-[#FFC72C] text-sm font-bold uppercase tracking-widest mb-2">RANK</div>
              <div className="font-['Dela_Gothic_One'] text-white text-4xl uppercase">{wrapped.contributor_level}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 border-t border-[#222222] pt-8">
              <div>
                <div className="font-['Syne'] text-[#FFC72C] text-sm font-bold uppercase tracking-widest mb-2">ROUTES</div>
                <div className="font-['Dela_Gothic_One'] text-white text-4xl">{wrapped.routes_contributed}</div>
              </div>
              <div>
                <div className="font-['Syne'] text-[#FFC72C] text-sm font-bold uppercase tracking-widest mb-2">AREAS</div>
                <div className="font-['Dela_Gothic_One'] text-white text-4xl">{wrapped.areas_covered}</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-end border-t border-[#222222] pt-6 relative z-10">
            <div className="font-['Syne'] font-bold text-white uppercase tracking-widest">{me?.full_name}</div>
            <div className="font-['Dela_Gothic_One'] text-[#FFC72C] text-2xl">Ó wà!</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 pt-8">
          <Button className="w-full h-16 bg-white text-[#111111] hover:bg-[#FFC72C] text-lg uppercase font-bold tracking-wider rounded-none font-['Syne'] transition-colors">
            SHARE TO X / TWITTER
          </Button>
          <Link href="/dashboard" className="w-full block">
            <Button variant="ghost" className="w-full h-16 text-[#888888] hover:text-white hover:bg-[#222222] uppercase font-bold tracking-wider rounded-none font-['Syne'] transition-colors">
              BACK TO DASHBOARD
            </Button>
          </Link>
        </div>
      </motion.div>
    )
  ];

  return (
    <div className="min-h-[100dvh] bg-[#111111] flex items-center justify-center p-6 overflow-hidden relative selection:bg-[#FFC72C] selection:text-[#111111]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#222222_1px,transparent_1px),linear-gradient(to_bottom,#222222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      <div className="w-full relative z-10 flex justify-center">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        {steps.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setStep(i)}
            disabled={i > step}
            className={`h-2 transition-all duration-300 rounded-none ${i === step ? "bg-[#FFC72C] w-12" : i < step ? "bg-white w-4 cursor-pointer" : "bg-[#333333] w-4 cursor-not-allowed"}`} 
          />
        ))}
      </div>
    </div>
  );
}

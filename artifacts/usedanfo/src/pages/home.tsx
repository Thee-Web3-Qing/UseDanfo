import { useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import danfoImg from "@assets/IMG_4877_1781221514107.png";

export default function Home() {
  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#111111]">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-24 pb-32 overflow-hidden border-b border-[#222222]">
          <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="flex-1 space-y-8 text-center md:text-left">
              <div className="inline-block border border-[#FFC72C] rounded-full px-4 py-1.5 bg-[#FFC72C]/10 text-[#FFC72C] font-['Syne'] text-sm uppercase font-bold tracking-widest">
                ⚡ COMMUNITY-POWERED
              </div>
              
              <h1 className="font-['Dela_Gothic_One'] text-[clamp(3.5rem,8vw,8rem)] leading-[0.85] tracking-tight uppercase">
                <span className="text-white block">HELP MAP</span>
                <span className="text-[#FFC72C] block">LAGOS.</span>
              </h1>
              
              <p className="font-['Fredoka'] text-xl md:text-2xl text-[#888888] max-w-xl mx-auto md:mx-0">
                Share the routes you know. Build the city's transport brain.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start pt-4 font-['Syne']">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-16 px-10 bg-[#FFC72C] text-[#111111] hover:bg-white text-lg uppercase font-bold tracking-wider rounded-none">
                    START MAPPING
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 border-white text-white hover:bg-white hover:text-[#111111] text-lg uppercase font-bold tracking-wider rounded-none">
                    LOG IN →
                  </Button>
                </Link>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -4 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 w-full max-w-lg relative"
            >
              <div className="absolute inset-0 bg-[#FFC72C] blur-[100px] opacity-20 rounded-full" />
              <img 
                src={danfoImg} 
                alt="Lagos Danfo Bus" 
                className="w-full relative z-10 drop-shadow-2xl object-contain border-4 border-[#FFC72C] grayscale-[20%] contrast-125" 
              />
            </motion.div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="bg-[#FFC72C] border-b border-[#111111]">
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-[#111111]/20">
              <div className="pt-8 md:pt-0 space-y-2">
                <div className="font-['Dela_Gothic_One'] text-6xl text-[#111111]">{stats?.total_routes || "0"}</div>
                <div className="font-['Syne'] font-black uppercase tracking-widest text-[#111111]/80">ROUTES MAPPED</div>
              </div>
              <div className="pt-8 md:pt-0 space-y-2">
                <div className="font-['Dela_Gothic_One'] text-6xl text-[#111111]">{stats?.total_contributors || "0"}</div>
                <div className="font-['Syne'] font-black uppercase tracking-widest text-[#111111]/80">CONTRIBUTORS</div>
              </div>
              <div className="pt-8 md:pt-0 space-y-2">
                <div className="font-['Dela_Gothic_One'] text-6xl text-[#111111]">{stats?.total_areas_covered || "0"}</div>
                <div className="font-['Syne'] font-black uppercase tracking-widest text-[#111111]/80">AREAS COVERED</div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-white py-32 text-[#111111] border-b border-[#222222]">
          <div className="container mx-auto px-6">
            <h2 className="font-['Dela_Gothic_One'] text-5xl md:text-7xl text-center mb-24 uppercase">HOW IT WORKS.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-6 flex flex-col items-center text-center">
                <div className="font-['Dela_Gothic_One'] text-[#111111] text-7xl mb-4 border-b-8 border-[#FFC72C] pb-2 px-4 inline-block">01</div>
                <h3 className="font-['Syne'] font-black text-2xl uppercase tracking-wider">SIGN UP</h3>
                <p className="font-['Syne'] text-lg text-[#555555] max-w-xs">Create an account and tell us the areas of Lagos you navigate daily.</p>
              </div>
              <div className="space-y-6 flex flex-col items-center text-center">
                <div className="font-['Dela_Gothic_One'] text-[#111111] text-7xl mb-4 border-b-8 border-[#FFC72C] pb-2 px-4 inline-block">02</div>
                <h3 className="font-['Syne'] font-black text-2xl uppercase tracking-wider">SHARE ROUTES</h3>
                <p className="font-['Syne'] text-lg text-[#555555] max-w-xs">Add step-by-step connections, bus stops, and estimated fares.</p>
              </div>
              <div className="space-y-6 flex flex-col items-center text-center">
                <div className="font-['Dela_Gothic_One'] text-[#111111] text-7xl mb-4 border-b-8 border-[#FFC72C] pb-2 px-4 inline-block">03</div>
                <h3 className="font-['Syne'] font-black text-2xl uppercase tracking-wider">GET YOUR WRAPPED</h3>
                <p className="font-['Syne'] text-lg text-[#555555] max-w-xs">Earn ranks, get your personalized stats, and share your impact.</p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY IT MATTERS */}
        <section className="bg-[#111111] py-32 text-white">
          <div className="container mx-auto px-6">
            <h2 className="font-['Fredoka'] italic text-3xl md:text-5xl text-center max-w-4xl mx-auto leading-tight mb-24 text-[#FFC72C]">
              "Millions of Lagosians navigate by instinct. Let's write it down."
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-[#222222] p-10 bg-[#111111] hover:border-[#FFC72C] transition-colors">
                <h4 className="font-['Syne'] font-black text-xl uppercase mb-4 tracking-wider">NO MAPS EXIST</h4>
                <p className="font-['Syne'] text-[#888888] leading-relaxed">Google Maps doesn't know about Danfo routes. We are building the missing layer.</p>
              </div>
              <div className="border border-[#222222] p-10 bg-[#111111] hover:border-[#FFC72C] transition-colors">
                <h4 className="font-['Syne'] font-black text-xl uppercase mb-4 tracking-wider">NO FARE DATA</h4>
                <p className="font-['Syne'] text-[#888888] leading-relaxed">Fares change. Help others know what to budget before leaving their house.</p>
              </div>
              <div className="border border-[#222222] p-10 bg-[#111111] hover:border-[#FFC72C] transition-colors">
                <h4 className="font-['Syne'] font-black text-xl uppercase mb-4 tracking-wider">NO DROP-OFF GUIDES</h4>
                <p className="font-['Syne'] text-[#888888] leading-relaxed">Knowing exactly where to alight is half the journey. Share your insider tips.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL STRIP */}
        <section className="bg-[#FFC72C] py-16 overflow-hidden flex items-center whitespace-nowrap">
          <div className="animate-[marquee_20s_linear_infinite] flex gap-16 font-['Fredoka'] text-3xl text-[#111111] font-bold">
            <span>"Finally. I don't need to ask anyone at the bus stop."</span>
            <span className="text-white">✦</span>
            <span>"My area don enter database. Ó wà!"</span>
            <span className="text-white">✦</span>
            <span>"This go save a lot of first-timers."</span>
            <span className="text-white">✦</span>
            <span>"Finally. I don't need to ask anyone at the bus stop."</span>
            <span className="text-white">✦</span>
            <span>"My area don enter database. Ó wà!"</span>
            <span className="text-white">✦</span>
            <span>"This go save a lot of first-timers."</span>
            <span className="text-white">✦</span>
          </div>
        </section>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}

import { useGetDashboard, getGetDashboardQueryKey, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import * as React from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: me, isLoading: isLoadingMe } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const { data: dashboard, isLoading: isLoadingDashboard } = useGetDashboard({ 
    query: { 
      queryKey: getGetDashboardQueryKey(),
      enabled: !!me
    } 
  });

  React.useEffect(() => {
    if (!isLoadingMe && !me) {
      setLocation("/login");
    }
  }, [me, isLoadingMe, setLocation]);

  if (isLoadingMe || isLoadingDashboard) return <LoadingScreen />;
  if (!me || !dashboard) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#111111] text-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="font-['Dela_Gothic_One'] text-5xl md:text-6xl text-white uppercase tracking-tight">YOUR IMPACT</h1>
            <p className="font-['Fredoka'] text-xl text-[#888888] mt-2">Welcome back, {me.full_name}.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto font-['Syne'] uppercase font-bold tracking-wider">
            <Link href="/wrapped" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full h-14 px-8 border-[#FFC72C] text-[#FFC72C] hover:bg-[#FFC72C] hover:text-[#111111] rounded-none text-base">
                VIEW WRAPPED
              </Button>
            </Link>
            <Link href="/contribute" className="w-full sm:w-auto">
              <Button className="w-full h-14 px-8 bg-[#FFC72C] text-[#111111] hover:bg-white rounded-none text-base">
                ADD ROUTE
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#222222] p-8 border border-[#333333]">
            <div className="font-['Syne'] text-[#888888] uppercase font-bold tracking-widest text-sm mb-4">ROUTES</div>
            <div className="font-['Dela_Gothic_One'] text-5xl text-[#FFC72C]">{dashboard.routes_count}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#222222] p-8 border border-[#333333]">
            <div className="font-['Syne'] text-[#888888] uppercase font-bold tracking-widest text-sm mb-4">SCORE</div>
            <div className="font-['Dela_Gothic_One'] text-5xl text-[#FFC72C]">{dashboard.contribution_score}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#222222] p-8 border border-[#333333]">
            <div className="font-['Syne'] text-[#888888] uppercase font-bold tracking-widest text-sm mb-4">BADGES</div>
            <div className="font-['Dela_Gothic_One'] text-5xl text-[#FFC72C]">{dashboard.badges_count}</div>
          </motion.div>
        </div>

        {/* Routes */}
        <div className="space-y-8">
          <h2 className="font-['Dela_Gothic_One'] text-4xl uppercase">YOUR ROUTES</h2>
          
          {dashboard.recent_routes.length === 0 ? (
            <div className="bg-[#111111] border-2 border-dashed border-[#222222] p-16 flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-6">🚌</div>
              <h3 className="font-['Dela_Gothic_One'] text-2xl uppercase mb-2">NO ROUTES YET</h3>
              <p className="font-['Fredoka'] text-[#888888] text-lg max-w-sm mb-8">
                Be the first to map your area. Share your knowledge and start building the city's transport brain.
              </p>
              <Link href="/contribute">
                <Button className="h-14 px-8 bg-[#FFC72C] text-[#111111] hover:bg-white font-['Syne'] uppercase font-bold tracking-wider rounded-none text-base">
                  ADD FIRST ROUTE
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {dashboard.recent_routes.map(route => (
                <div key={route.id} className="bg-[#111111] border border-[#222222] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-[#FFC72C] transition-colors">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-['Syne'] text-xs font-bold uppercase tracking-widest px-3 py-1 bg-[#222222] text-[#FFC72C]">
                        {route.difficulty_level.replace(/_/g, ' ')}
                      </span>
                      <span className="font-['Syne'] text-xs font-bold uppercase tracking-widest px-3 py-1 bg-[#222222] text-white">
                        {route.confidence_level.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <h3 className="font-['Dela_Gothic_One'] text-2xl md:text-3xl uppercase tracking-tight flex items-center gap-3 flex-wrap">
                      <span>{route.start_area_name}</span>
                      <span className="text-[#FFC72C] text-xl">→</span>
                      <span>{route.end_area_name}</span>
                    </h3>
                    
                    <div className="font-['Syne'] text-sm font-bold uppercase tracking-widest text-[#888888]">
                      {route.legs.length} LEG{route.legs.length !== 1 ? 'S' : ''} • {route.buses_required.replace(/_/g, ' ')} BUS{route.buses_required !== 'one' ? 'ES' : ''} • {new Date(route.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 md:flex-none h-12 px-6 border-[#222222] text-white hover:bg-[#222222] rounded-none font-['Syne'] uppercase font-bold tracking-wider">
                      EDIT
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none h-12 px-6 border-[#222222] text-[#FF4444] hover:bg-[#FF4444] hover:text-white rounded-none font-['Syne'] uppercase font-bold tracking-wider">
                      DELETE
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { Navbar } from "@/components/layout/Navbar";
import { useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Map, Users, Route as RouteIcon } from "lucide-react";

export function Home() {
  const { data: stats } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() }
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background gradient decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl w-full text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium border border-border">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Lagos routing intelligence, powered by locals
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display leading-[1.1] text-foreground">
            Know every <span className="text-primary">Danfo</span> route in Lagos.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Stop guessing. Type where you are and where you're going, and we'll tell you the exact bus to board, where to drop, and what to pay.
          </p>

          <div className="pt-8">
            <Link href="/ask">
              <Button size="lg" className="h-16 px-10 text-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full group">
                Ask DanfoGPT
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-border/50 pt-12">
            <div className="p-6 bg-card rounded-2xl border border-card-border shadow-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <RouteIcon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-display mb-2">{stats?.total_routes || "3,204+"}</div>
              <div className="text-muted-foreground">Mapped Routes</div>
            </div>
            
            <div className="p-6 bg-card rounded-2xl border border-card-border shadow-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <Map className="w-6 h-6" />
              </div>
              <div className="text-3xl font-display mb-2">{stats?.total_areas_covered || "120+"}</div>
              <div className="text-muted-foreground">Areas Covered</div>
            </div>

            <div className="p-6 bg-card rounded-2xl border border-card-border shadow-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl font-display mb-2">{stats?.total_contributors || "1,400+"}</div>
              <div className="text-muted-foreground">Local Contributors</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

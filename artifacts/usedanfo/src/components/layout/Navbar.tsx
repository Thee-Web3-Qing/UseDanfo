import { Link, useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setIsOpen(false);
        setLocation("/");
      }
    });
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-[#111111] border-b border-[#222222] sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-['Dela_Gothic_One'] text-2xl md:text-3xl tracking-tight text-[#FFC72C] uppercase" onClick={closeMenu}>
          UseDanfo
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-['Syne'] uppercase font-bold text-sm tracking-wider">
          <Link href="/ask" className="text-white hover:text-[#FFC72C] transition-colors">DANFOGPT</Link>
          <Link href="/trip" className="text-white hover:text-[#FFC72C] transition-colors">RECORD TRIP</Link>
          <Link href="/map" className="text-white hover:text-[#FFC72C] transition-colors">MAP</Link>
          {me ? (
            <>
              <Link href="/dashboard" className="text-white hover:text-[#FFC72C] transition-colors">DASHBOARD</Link>
              <Link href="/contribute">
                <Button className="bg-[#FFC72C] text-[#111111] hover:bg-white uppercase font-bold rounded-none px-6">ADD ROUTE</Button>
              </Link>
              <button onClick={handleLogout} className="text-[#888888] hover:text-white transition-colors">LOGOUT</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:text-[#FFC72C] transition-colors">LOG IN</Link>
              <Link href="/signup">
                <Button className="bg-[#FFC72C] text-[#111111] hover:bg-white uppercase font-bold rounded-none px-6">SIGN UP</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-[#111111] border-b border-[#222222] flex flex-col p-6 gap-6 font-['Syne'] uppercase font-bold tracking-wider z-40"
          >
            {me ? (
              <>
                <Link href="/ask" onClick={closeMenu} className="text-white text-xl py-2">DANFOGPT</Link>
                <Link href="/trip" onClick={closeMenu} className="text-white text-xl py-2">RECORD TRIP</Link>
                <Link href="/map" onClick={closeMenu} className="text-white text-xl py-2">MAP</Link>
                <Link href="/dashboard" onClick={closeMenu} className="text-white text-xl py-2">DASHBOARD</Link>
                <Link href="/contribute" onClick={closeMenu}>
                  <Button className="bg-[#FFC72C] text-[#111111] hover:bg-white uppercase font-bold rounded-none w-full py-6 text-lg">ADD ROUTE</Button>
                </Link>
                <button onClick={handleLogout} className="text-[#888888] text-xl py-2 text-left">LOGOUT</button>
              </>
            ) : (
              <>
                <Link href="/ask" onClick={closeMenu} className="text-white text-xl py-2">DANFOGPT</Link>
                <Link href="/trip" onClick={closeMenu} className="text-white text-xl py-2">RECORD TRIP</Link>
                <Link href="/map" onClick={closeMenu} className="text-white text-xl py-2">MAP</Link>
                <Link href="/login" onClick={closeMenu} className="text-white text-xl py-2">LOG IN</Link>
                <Link href="/signup" onClick={closeMenu}>
                  <Button className="bg-[#FFC72C] text-[#111111] hover:bg-white uppercase font-bold rounded-none w-full py-6 text-lg">SIGN UP</Button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

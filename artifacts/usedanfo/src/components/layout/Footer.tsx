import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-[#222222] py-16 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="font-['Dela_Gothic_One'] text-3xl tracking-tight text-[#FFC72C] uppercase block">
              UseDanfo
            </Link>
            <p className="font-['Fredoka'] text-white text-lg max-w-sm">
              Helping Lagos move smarter, one route at a time.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="font-['Syne'] text-[#888888] uppercase tracking-widest text-sm font-bold">Product</h4>
            <div className="flex flex-col space-y-4 font-['Syne'] font-bold text-white uppercase text-sm tracking-wider">
              <Link href="/" className="hover:text-[#FFC72C] transition-colors">HOME</Link>
              <Link href="/contribute" className="hover:text-[#FFC72C] transition-colors">ADD ROUTE</Link>
              <Link href="/dashboard" className="hover:text-[#FFC72C] transition-colors">DASHBOARD</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-['Syne'] text-[#888888] uppercase tracking-widest text-sm font-bold">Company</h4>
            <div className="flex flex-col space-y-4 font-['Syne'] font-bold text-white uppercase text-sm tracking-wider">
              <a href="#" className="hover:text-[#FFC72C] transition-colors">ABOUT</a>
              <a href="#" className="hover:text-[#FFC72C] transition-colors">TWITTER</a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#222222] flex flex-col md:flex-row items-center justify-between gap-4 font-['Syne'] text-[#888888] text-sm uppercase tracking-wider font-bold">
          <p>© {new Date().getFullYear()} UseDanfo. Built by the community.</p>
          <p className="text-[#FFC72C]">Ó WÀ — LAGOS</p>
        </div>
      </div>
    </footer>
  );
}

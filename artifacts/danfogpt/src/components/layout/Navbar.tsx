import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-display text-lg leading-none">
            D
          </div>
          <span className="font-display text-xl tracking-tight">DanfoGPT</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/ask">
            <Button variant={location === "/ask" ? "default" : "ghost"} className={location === "/ask" ? "font-bold" : ""}>
              Ask Danfo
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant={location === "/admin" ? "default" : "ghost"} className={location === "/admin" ? "font-bold" : ""}>
              Data Engine
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

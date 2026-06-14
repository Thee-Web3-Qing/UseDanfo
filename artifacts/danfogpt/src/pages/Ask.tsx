import { Navbar } from "@/components/layout/Navbar";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MapPin, Bus, Clock, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  routeData?: {
    legs: Array<{
      start: string;
      end: string;
      fare: string;
      time: string;
      action: string;
    }>;
    totalFare: string;
    totalTime: string;
    tips: string;
  }
};

const PRE_BAKED_RESPONSES = [
  {
    trigger: "yaba to lekki",
    text: "Here is the most reliable way to get from Yaba to Lekki Phase 1 based on recent commuter data.",
    routeData: {
      totalFare: "₦1,500 - ₦2,000",
      totalTime: "1hr 15mins (depends on Third Mainland traffic)",
      legs: [
        { start: "Yaba (Ozone Cinema)", end: "Obalende", fare: "₦500", time: "25 mins", action: "Board a direct danfo heading to Obalende/CMS." },
        { start: "Obalende Underbridge", end: "Lekki Phase 1", fare: "₦1,000", time: "40 mins", action: "Cross to the Island park and board a bus calling 'Lekki/Ajah'. Drop at Lekki Phase 1 gate." }
      ],
      tips: "Be careful at Obalende at night. The buses to Lekki are usually the white ones, not the yellow ones."
    }
  },
  {
    trigger: "ikeja to oshodi",
    text: "Getting from Ikeja to Oshodi is straightforward. Here's the route.",
    routeData: {
      totalFare: "₦300 - ₦500",
      totalTime: "20 mins",
      legs: [
        { start: "Ikeja Along", end: "Oshodi", fare: "₦400", time: "20 mins", action: "Board any bus calling 'Oshodi' from Ikeja Along bus stop. It's a straight drop." }
      ],
      tips: "Watch out for pickpockets when dropping at Oshodi Underbridge."
    }
  }
];

export function Ask() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    role: "assistant",
    content: "Where are you heading today? Tell me your start and end point (e.g., 'Yaba to Lekki')."
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const lowercaseInput = input.toLowerCase();
    const responseTemplate = PRE_BAKED_RESPONSES.find(r => lowercaseInput.includes(r.trigger)) || {
      text: "Based on community data, here is how you can make that trip.",
      routeData: {
        totalFare: "₦1,200",
        totalTime: "45 mins",
        legs: [
          { start: "Current Location", end: "Major Hub", fare: "₦400", time: "15 mins", action: "Board a danfo heading towards the nearest major hub." },
          { start: "Major Hub", end: "Destination", fare: "₦800", time: "30 mins", action: "Connect from the hub directly to your destination." }
        ],
        tips: "Always have exact change ready before boarding."
      }
    };

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseTemplate.text,
        routeData: responseTemplate.routeData
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl p-5",
                msg.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-card border border-border shadow-sm"
              )}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 font-display text-sm text-primary">
                    <Bus className="w-4 h-4" />
                    DanfoGPT
                  </div>
                )}
                <div className="text-base leading-relaxed">{msg.content}</div>
                
                {msg.routeData && (
                  <div className="mt-6 space-y-4">
                    <div className="flex gap-4 p-3 bg-secondary/50 rounded-lg text-sm">
                      <div className="flex items-center gap-1.5"><Wallet className="w-4 h-4 text-primary"/> <span className="font-semibold">{msg.routeData.totalFare}</span></div>
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary"/> <span>{msg.routeData.totalTime}</span></div>
                    </div>

                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {msg.routeData.legs.map((leg, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
                            {i + 1}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-background shadow-sm space-y-2">
                            <div className="font-bold flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {leg.start} <ArrowRight className="w-3 h-3 text-muted-foreground mx-1" /> {leg.end}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{leg.action}</p>
                            <div className="flex gap-3 text-xs font-medium text-secondary-foreground pt-2 border-t border-border/50">
                              <span>{leg.fare}</span>
                              <span>•</span>
                              <span>{leg.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {msg.routeData.tips && (
                      <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm">
                        <span className="font-bold text-primary mr-2">Pro Tip:</span>
                        {msg.routeData.tips}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl p-5 bg-card border border-border shadow-sm flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{animationDelay: "0ms"}}/>
                <span className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{animationDelay: "150ms"}}/>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: "300ms"}}/>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <Input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. Ogba to Victoria Island..." 
              className="h-14 rounded-full pl-6 pr-14 text-lg bg-card border-border shadow-lg focus-visible:ring-primary"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 top-2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
}

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, useAskDanfoGpt } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Send, MapPin, Bus, Clock, Wallet } from "lucide-react";

export default function DanfoGpt() {
  const [, setLocation] = useLocation();
  const { data: me, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user', content: string, route?: any, suggestions?: string[] }[]>([]);
  const [input, setInput] = useState("");
  const askMutation = useAskDanfoGpt();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !me) {
      setLocation("/login");
    }
  }, [me, isLoading, setLocation]);

  useEffect(() => {
    setMessages([
      { role: 'assistant', content: "E kaabo! Where you dey go? Tell me your start and your destination - I go direct you." }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, askMutation.isPending]);

  const handleSend = () => {
    if (!input.trim() || askMutation.isPending) return;

    const userMessage = input;
    setInput("");
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    askMutation.mutate({
      data: {
        message: userMessage,
        conversation_history: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      }
    }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply,
          route: data.route_found ? data.route : undefined,
          suggestions: data.suggestions
        }]);
      }
    });
  };

  if (isLoading || !me) return <LoadingScreen />;

  return (
    <div className="min-h-[100dvh] bg-[#111111] flex flex-col relative text-white">
      <Navbar />
      
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 md:px-8 py-6 pb-32">
        <div className="text-center mb-8">
          <h1 className="font-['Dela_Gothic_One'] text-4xl md:text-6xl text-white uppercase tracking-tight">DANFOGPT</h1>
          <p className="font-['Fredoka'] text-xl text-[#FFC72C]">Your Lagos danfo guide</p>
        </div>
        
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-5 ${msg.role === 'user' ? 'bg-[#FFC72C] text-[#111111] rounded-br-sm' : 'bg-[#222222] text-white rounded-bl-sm border border-[#333333]'}`}>
                <div className="font-['Syne'] text-base md:text-lg whitespace-pre-wrap">{msg.content}</div>
                
                {msg.route && (
                  <div className="mt-4 border-t border-[#444444] pt-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[#FFC72C] font-bold">
                      <Bus size={18} />
                      <span className="uppercase tracking-wider">Suggested Route</span>
                    </div>
                    {msg.route.legs?.map((leg: any, idx: number) => (
                      <div key={idx} className="bg-[#111111] p-3 border border-[#333333]">
                        <div className="flex items-center gap-2 mb-2 font-bold">
                          <MapPin size={16} className="text-[#FFC72C] shrink-0" />
                          <span>{leg.start_area} &rarr; {leg.end_area}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-[#888888] pl-6">
                          <div className="flex items-center gap-1"><Wallet size={14} /> {leg.fare_range}</div>
                          <div className="flex items-center gap-1"><Clock size={14} /> {leg.travel_time_range}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#444444]">
                    {msg.suggestions.map((sug, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setInput(sug)}
                        className="bg-[#111111] hover:bg-[#333333] transition-colors px-3 py-1.5 rounded-full text-xs font-['Fredoka'] text-[#FFC72C] border border-[#333333]"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {askMutation.isPending && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-[#222222] text-[#888888] rounded-lg rounded-bl-sm border border-[#333333] p-5 font-['Syne']">
                <span className="flex items-center gap-2">
                  Thinking
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </span>
              </div>
            </div>
          )}
          
          {messages.length === 1 && (
            <div className="flex flex-col gap-2 mt-8 items-center max-w-md mx-auto w-full">
              <p className="text-[#888888] text-sm uppercase font-bold tracking-widest font-['Syne'] mb-2">Try asking</p>
              {["Yaba to Victoria Island", "Ikeja to Lekki", "Surulere to CMS"].map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(sug)}
                  className="w-full text-left px-4 py-3 bg-[#222222] hover:bg-[#333333] hover:border-[#FFC72C] border border-[#222222] transition-colors rounded text-white font-['Syne']"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 w-full bg-[#111111] border-t border-[#222222] p-4 pb-8 z-10">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-[#222222] text-white border border-[#333333] focus:border-[#FFC72C] outline-none px-6 py-4 rounded font-['Syne'] text-lg"
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || askMutation.isPending}
            className="h-auto bg-[#FFC72C] hover:bg-white text-[#111111] px-6 rounded font-bold transition-colors disabled:opacity-50"
          >
            <Send size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}

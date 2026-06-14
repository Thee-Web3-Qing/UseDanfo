import { useSignup } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const signupMutation = useSignup();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate(
      { data: { full_name: fullName, email, password } },
      {
        onSuccess: () => {
          setLocation("/onboarding");
        },
        onError: (err: any) => {
          const message = err?.data?.error || err?.message || "Failed to sign up";
          const is409 = err?.status === 409;
          toast({
            title: is409 ? "Email already registered" : "Sign up failed",
            description: is409
              ? "This email is already in use. Try logging in instead."
              : message,
            variant: "destructive",
          });
          if (is409) {
            setTimeout(() => setLocation("/login"), 1500);
          }
        }
      }
    );
  };

  const handleGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#111111]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 py-12">
        <Card className="w-full max-w-md bg-[#111111] border border-[#222222] rounded-none p-4 md:p-8">
          <CardHeader className="space-y-4 text-center px-0 pb-8">
            <h1 className="font-['Dela_Gothic_One'] text-4xl text-white uppercase">JOIN THE MAP</h1>
            <p className="font-['Fredoka'] text-[#FFC72C] text-lg">Lagos is waiting for your routes.</p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-0">
              <div className="space-y-3 font-['Syne']">
                <Label htmlFor="full_name" className="text-white font-bold uppercase tracking-wider text-xs">Full Name</Label>
                <Input 
                  id="full_name" 
                  type="text" 
                  className="bg-[#222222] border-none text-white h-14 rounded-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] text-lg"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-3 font-['Syne']">
                <Label htmlFor="email" className="text-white font-bold uppercase tracking-wider text-xs">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="bg-[#222222] border-none text-white h-14 rounded-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-3 font-['Syne']">
                <Label htmlFor="password" className="text-white font-bold uppercase tracking-wider text-xs">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-[#222222] border-none text-white h-14 rounded-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 px-0 pt-8">
              <Button type="submit" className="w-full h-14 bg-[#FFC72C] text-[#111111] hover:bg-white font-['Syne'] uppercase font-bold tracking-widest text-lg rounded-none" disabled={signupMutation.isPending}>
                {signupMutation.isPending ? "CREATING..." : "SIGN UP"}
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#222222]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-['Syne'] font-bold">
                  <span className="bg-[#111111] px-2 text-[#888888]">OR</span>
                </div>
              </div>

              <Button type="button" onClick={handleGoogle} variant="outline" className="w-full h-14 bg-transparent border-[#222222] text-white hover:bg-[#222222] hover:text-white font-['Syne'] uppercase font-bold tracking-widest rounded-none flex items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                CONTINUE WITH GOOGLE
              </Button>

              <div className="text-center font-['Syne'] text-sm font-bold text-[#888888] uppercase tracking-wider pt-4">
                Already mapped?{" "}
                <Link href="/login" className="text-[#FFC72C] hover:text-white transition-colors">
                  LOG IN →
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

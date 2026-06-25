import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (data: any) => {
          const profile = data?.profile;
          if (profile) {
            queryClient.setQueryData(getGetMeQueryKey(), profile);
          }
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          const message = err?.data?.error || err?.message || "Failed to log in";
          toast({
            title: "Login failed",
            description: message,
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#111111]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-[#111111] border border-[#222222] rounded-none p-4 md:p-8">
          <CardHeader className="space-y-4 text-center px-0 pb-8">
            <h1 className="font-['Dela_Gothic_One'] text-4xl text-white uppercase">WELCOME BACK</h1>
            <p className="font-['Fredoka'] text-[#FFC72C] text-lg">The routes don't map themselves.</p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-0">
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
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 px-0 pt-8">
              <Button type="submit" className="w-full h-14 bg-[#FFC72C] text-[#111111] hover:bg-white font-['Syne'] uppercase font-bold tracking-widest text-lg rounded-none" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "LOGGING IN..." : "LOG IN"}
              </Button>

              <div className="text-center font-['Syne'] text-sm font-bold text-[#888888] uppercase tracking-wider pt-4">
                Don't have an account?{" "}
                <Link href="/signup" className="text-[#FFC72C] hover:text-white transition-colors">
                  SIGN UP
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

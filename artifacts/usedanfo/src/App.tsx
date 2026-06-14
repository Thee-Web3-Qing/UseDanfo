import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import Contribute from "@/pages/contribute";
import Wrapped from "@/pages/wrapped";
import DanfoGpt from "@/pages/danfogpt";
import TripRecorder from "@/pages/trip";
import RouteMap from "@/pages/map";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/contribute" component={Contribute} />
      <Route path="/wrapped" component={Wrapped} />
      <Route path="/ask" component={DanfoGpt} />
      <Route path="/trip" component={TripRecorder} />
      <Route path="/map" component={RouteMap} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

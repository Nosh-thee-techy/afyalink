import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import { MobileContainer } from "@/components/layout/mobile-container";

import Splash from "@/pages/splash";
import Login from "@/pages/login";
import Queue from "@/pages/queue";
import Triage from "@/pages/triage";
import Referrals from "@/pages/referrals";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoaded } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoaded, isAuthenticated, setLocation]);

  if (!isLoaded) return null;
  if (!isAuthenticated) return null;

  return <Component />;
}

function Router() {
  return (
    <MobileContainer>
      <Switch>
        <Route path="/" component={Splash} />
        <Route path="/splash" component={Splash} />
        <Route path="/login" component={Login} />
        <Route path="/queue" component={() => <ProtectedRoute component={Queue} />} />
        <Route path="/triage/:id" component={() => <ProtectedRoute component={Triage} />} />
        <Route path="/referrals" component={() => <ProtectedRoute component={Referrals} />} />
        <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
        <Route component={NotFound} />
      </Switch>
    </MobileContainer>
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

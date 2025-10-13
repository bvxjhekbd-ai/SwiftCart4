import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Deposit from "@/pages/Deposit";
import PurchaseHistory from "@/pages/PurchaseHistory";
import TransactionHistory from "@/pages/TransactionHistory";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProducts from "@/pages/AdminProducts";
import AdminUsers from "@/pages/AdminUsers";
import AdminDeposits from "@/pages/AdminDeposits";
import AdminPurchases from "@/pages/AdminPurchases";
import ApiDiagnostic from "@/pages/ApiDiagnostic";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Diagnostic page accessible anytime */}
      <Route path="/api-diagnostic" component={ApiDiagnostic} />
      
      {isLoading ? (
        <Route path="/" component={() => <div className="flex h-screen items-center justify-center">Loading...</div>} />
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={Auth} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/deposit" component={Deposit} />
          <Route path="/purchases" component={PurchaseHistory} />
          <Route path="/transactions" component={TransactionHistory} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/deposits" component={AdminDeposits} />
          <Route path="/admin/purchases" component={AdminPurchases} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Home from "@/pages/Home";
import UserProfile from "@/pages/UserProfile";
import Deposit from "@/pages/Deposit";
import PurchaseHistory from "@/pages/PurchaseHistory";
import TransactionHistory from "@/pages/TransactionHistory";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProducts from "@/pages/AdminProducts";
import AdminUsers from "@/pages/AdminUsers";
import AdminDeposits from "@/pages/AdminDeposits";
import AdminPurchases from "@/pages/AdminPurchases";
import AdminCategories from "@/pages/AdminCategories";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import GetStarted from "@/pages/GetStarted";
import Support from "@/pages/Support";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/about" component={About} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/get-started" component={GetStarted} />
        <Route path="/support" component={Support} />
        <Route path="/:rest*">
          {() => {
            window.location.href = "/";
            return null;
          }}
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/deposit" component={Deposit} />
      <Route path="/purchases" component={PurchaseHistory} />
      <Route path="/transactions" component={TransactionHistory} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/deposits" component={AdminDeposits} />
      <Route path="/admin/purchases" component={AdminPurchases} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/get-started" component={GetStarted} />
      <Route path="/support" component={Support} />
      <Route path="/:rest*">
        {() => {
          window.location.href = "/";
          return null;
        }}
      </Route>
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

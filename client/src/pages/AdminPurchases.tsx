import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Calendar, User } from "lucide-react";
import type { Purchase, Product, User as UserType } from "@shared/schema";

type PurchaseWithDetails = Purchase & { product: Product; user: UserType };

export default function AdminPurchases() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: purchases, isLoading } = useQuery<PurchaseWithDetails[]>({
    queryKey: ["/api/admin?action=all-purchases"],
    enabled: isAuthenticated && user?.isAdmin === true,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      setLocation("/");
    }
  }, [isAuthenticated, authLoading, user, setLocation]);

  if (authLoading || isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b p-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">All Purchases</h1>
              <p className="text-muted-foreground">
                View all user purchases and account details
              </p>
            </div>

            <div className="space-y-4">
              {purchases && purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <span className="text-lg font-semibold text-primary">
                              {purchase.user.email || purchase.user.firstName || 'Unknown User'}
                            </span>
                          </div>
                          <CardTitle className="mb-2">{purchase.product.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span className="font-mono">ID: {purchase.id}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <Badge variant="secondary">{purchase.product.category}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">₦{purchase.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 rounded-lg bg-muted p-4">
                        <h4 className="font-semibold">Account Credentials:</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground">Username:</span>{" "}
                            <span className="font-mono">{purchase.product.accountUsername}</span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">Password:</span>{" "}
                            <span className="font-mono">{purchase.product.accountPassword}</span>
                          </p>
                          {purchase.product.accountEmail && (
                            <p>
                              <span className="text-muted-foreground">Email:</span>{" "}
                              <span className="font-mono">{purchase.product.accountEmail}</span>
                            </p>
                          )}
                          {purchase.product.additionalInfo && (
                            <p className="mt-2">
                              <span className="text-muted-foreground">Additional Info:</span>{" "}
                              {purchase.product.additionalInfo}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex h-32 items-center justify-center">
                    <p className="text-muted-foreground">No purchases found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

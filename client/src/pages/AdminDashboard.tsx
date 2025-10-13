import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProductUploadForm } from "@/components/ProductUploadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: stats } = useQuery<{ total: number; available: number; sold: number }>({
    queryKey: ["/api/admin?action=stats"],
    enabled: isAuthenticated && user?.isAdmin === true,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      window.location.href = "/";
    }
  }, [isAuthenticated, authLoading, user]);

  if (authLoading) {
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
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your products and track performance
              </p>
            </div>

            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Accounts
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-accounts">
                    {stats?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All accounts added
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Available
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-available">
                    {stats?.available || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ready for sale
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sold
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-sold">
                    {stats?.sold || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully sold
                  </p>
                </CardContent>
              </Card>
            </div>

            <ProductUploadForm />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

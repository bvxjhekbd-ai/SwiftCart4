import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Edit } from "lucide-react";
import type { Product } from "@shared/schema";

export default function AdminProducts() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/all-products"],
    enabled: isAuthenticated && user?.isAdmin === true,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      window.location.href = "/";
    }
  }, [isAuthenticated, authLoading, user]);

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
              <h1 className="text-3xl font-bold">Manage Products</h1>
              <p className="text-muted-foreground">
                View and edit all accounts
              </p>
            </div>

            <div className="grid gap-4">
              {products && products.length > 0 ? (
                products.map((product: any) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-2">{product.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mb-4">
                            {product.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">₦{product.price.toLocaleString()}</Badge>
                            <Badge variant="outline">{product.category}</Badge>
                            <Badge variant={product.status === "available" ? "default" : "secondary"}>
                              {product.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold">Username:</span> {product.accountUsername}
                        </div>
                        <div>
                          <span className="font-semibold">Password:</span> {product.accountPassword}
                        </div>
                        {product.accountEmail && (
                          <div>
                            <span className="font-semibold">Email:</span> {product.accountEmail}
                          </div>
                        )}
                        {product.additionalInfo && (
                          <div>
                            <span className="font-semibold">Additional Info:</span> {product.additionalInfo}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex h-32 items-center justify-center">
                    <p className="text-muted-foreground">No products added yet</p>
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

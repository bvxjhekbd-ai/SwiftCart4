import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar } from "lucide-react";
import { Link } from "wouter";
import type { Purchase, Product } from "@shared/schema";

type PurchaseWithProduct = Purchase & { product: Product };

export default function PurchaseHistory() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: purchases, isLoading } = useQuery<PurchaseWithProduct[]>({
    queryKey: ["/api/purchases"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Purchase History</h1>
        <p className="text-muted-foreground">View all your purchased accounts</p>
      </div>

      {!purchases || purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No purchases yet</p>
            <Button asChild className="mt-4" data-testid="button-browse-products">
              <Link href="/">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id} data-testid={`purchase-${purchase.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{purchase.product.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <Badge variant="secondary">{purchase.product.category}</Badge>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-2">
                      Purchase ID: {purchase.id}
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
                      <span className="font-mono" data-testid={`username-${purchase.id}`}>
                        {purchase.product.accountUsername}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Password:</span>{" "}
                      <span className="font-mono" data-testid={`password-${purchase.id}`}>
                        {purchase.product.accountPassword}
                      </span>
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
          ))}
        </div>
      )}
    </div>
  );
}

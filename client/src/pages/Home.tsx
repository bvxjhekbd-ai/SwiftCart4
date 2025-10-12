import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard } from "@/components/ProductCard";
import { TrustSection } from "@/components/TrustSection";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest("POST", "/api/purchases", { productId });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Successful!",
        description: `Account purchased. New balance: ₦${data.newBalance.toLocaleString()}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Login",
          description: "You need to login to make a purchase",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Purchase Failed",
        description: error.message.includes("Insufficient")
          ? "Insufficient wallet balance. Please deposit funds."
          : "Failed to complete purchase",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (productId: string, price: number) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Please Login",
        description: "You need to login to make a purchase",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    const walletBalance = user.walletBalance || 0;
    if (walletBalance < price) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit funds to your wallet",
        variant: "destructive",
      });
      return;
    }

    purchaseMutation.mutate(productId);
  };

  return (
    <div className="min-h-screen">
      <Header onPurchase={handlePurchase} />
      <Hero />
      <CategoryFilter />

      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="mt-1 text-muted-foreground">
              Discover premium social media accounts
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : !products || (products as any[]).length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">No products available</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(products as any[]).map((product: any) => (
              <ProductCard
                key={product.id}
                {...product}
                onPurchase={() => handlePurchase(product.id, product.price)}
                isPurchasing={purchaseMutation.isPending}
              />
            ))}
          </div>
        )}
      </main>

      <TrustSection />

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; 2024 Digital Market. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

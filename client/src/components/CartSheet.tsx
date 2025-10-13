import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShoppingCart, X, Package } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

export function CartSheet() {
  const { cartItems, removeFromCart, clearCart, totalPrice, itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const checkoutMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      const response = await apiRequest("POST", "/api/purchases?action=bulk", { productIds });
      return await response.json();
    },
    onSuccess: (data) => {
      const message = data.failedProducts && data.failedProducts.length > 0
        ? `${data.successCount} accounts purchased successfully. ${data.failedProducts.length} were no longer available.`
        : `All ${data.successCount} accounts purchased successfully!`;
      
      toast({
        title: "Checkout Complete",
        description: `${message} New balance: ₦${data.newBalance.toLocaleString()}`,
      });
      
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth?action=user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Login",
          description: "You need to login to checkout",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Checkout Failed",
        description: error.message || "Failed to complete checkout",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Please Login",
        description: "You need to login to checkout",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
      return;
    }

    const walletBalance = user.walletBalance || 0;
    if (walletBalance < totalPrice) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₦${totalPrice.toLocaleString()} but have ₦${walletBalance.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    checkoutMutation.mutate(cartItems.map((item) => item.productId));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative" data-testid="button-cart">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              data-testid="badge-cart-count"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col h-[calc(100vh-180px)]">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add items to get started</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto space-y-3">
                {cartItems.map((item) => (
                  <Card key={item.productId} className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{item.title}</h4>
                        <Badge variant="secondary" className="mt-1">
                          {item.category}
                        </Badge>
                        <p className="mt-2 font-bold">₦{item.price.toLocaleString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.productId)}
                        data-testid={`button-remove-${item.productId}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="border-t pt-4 mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold" data-testid="text-cart-total">
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>
                
                <div className="grid gap-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={checkoutMutation.isPending}
                    data-testid="button-checkout"
                  >
                    {checkoutMutation.isPending ? "Processing..." : `Checkout (${itemCount} items)`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    disabled={checkoutMutation.isPending}
                    data-testid="button-clear-cart"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

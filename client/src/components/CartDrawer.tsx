import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
}

export function CartDrawer() {
  // todo: remove mock functionality
  const [cartItems] = useState<CartItem[]>([
    {
      id: "1",
      title: "Instagram Account - 50k Followers",
      price: 25000,
      image: "https://images.unsplash.com/photo--611605632017?w=200&h=200&fit=crop",
    },
    {
      id: "2",
      title: "Twitter Account - Verified Badge",
      price: 150000,
      image: "https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=200&h=200&fit=crop",
    },
  ]);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-open-cart">
          <ShoppingCart className="h-5 w-5" />
          {cartItems.length > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs">
              {cartItems.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-muted-foreground">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <h4 className="line-clamp-2 text-sm font-medium">
                        {item.title}
                      </h4>
                      <p className="mt-1 font-semibold">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      data-testid={`button-remove-${item.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Subtotal</span>
                  <span data-testid="text-cart-total">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" data-testid="button-checkout">
                Proceed to Checkout
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

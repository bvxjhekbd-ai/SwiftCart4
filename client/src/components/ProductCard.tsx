import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  status?: string;
  onPurchase?: () => void;
  isPurchasing?: boolean;
}

export function ProductCard({
  title,
  price,
  images,
  category,
  status = "available",
  onPurchase,
  isPurchasing = false,
}: ProductCardProps) {
  const image = images && images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1611605632017-0f486d02b8b4?w=400&h=300&fit=crop";

  return (
    <Card className="group overflow-hidden hover-elevate active-elevate-2">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-2 top-2">
          <Badge variant="secondary" data-testid="badge-category">
            {category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="line-clamp-2 font-semibold" data-testid="text-product-title">
          {title}
        </h3>
        <div className="mt-2">
          <span className="text-2xl font-bold tabular-nums" data-testid="text-price">
            ₦{price.toLocaleString()}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          data-testid="button-quick-view"
          disabled={status !== "available"}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          className="flex-1"
          data-testid="button-buy-now"
          onClick={onPurchase}
          disabled={status !== "available" || isPurchasing}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {status !== "available" ? "Sold" : isPurchasing ? "Processing..." : "Buy Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}

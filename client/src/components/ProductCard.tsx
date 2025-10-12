import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  verified?: boolean;
}

export function ProductCard({
  title,
  price,
  image,
  category,
  verified = false,
}: ProductCardProps) {
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
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums" data-testid="text-price">
            ₦{price.toLocaleString()}
          </span>
          {verified && (
            <Badge variant="outline" className="text-xs" data-testid="badge-verified">
              Verified
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          data-testid="button-quick-view"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button className="flex-1" data-testid="button-add-to-cart">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

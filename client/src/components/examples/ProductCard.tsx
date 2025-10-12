import { ThemeProvider } from "../ThemeProvider";
import { ProductCard } from "../ProductCard";

export default function ProductCardExample() {
  return (
    <ThemeProvider>
      <div className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          id="1"
          title="Premium Instagram Account with 50k Real Followers"
          price={25000}
          images={["https://images.unsplash.com/photo-1611605632017-0f486d02b8b4?w=400&h=300&fit=crop"]}
          category="Instagram"
        />
        <ProductCard
          id="2"
          title="Twitter Account - Verified Blue Checkmark"
          price={150000}
          images={["https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop"]}
          category="Twitter"
        />
        <ProductCard
          id="3"
          title="TikTok Account with 100k Followers"
          price={45000}
          images={["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop"]}
          category="TikTok"
        />
      </div>
    </ThemeProvider>
  );
}

import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard } from "@/components/ProductCard";
import { TrustSection } from "@/components/TrustSection";

// todo: remove mock functionality
const mockProducts = [
  {
    id: "1",
    title: "Premium Instagram Account with 50k Real Followers",
    price: 25000,
    image: "https://images.unsplash.com/photo-1611605632017-0f486d02b8b4?w=400&h=300&fit=crop",
    category: "Instagram",
    verified: true,
  },
  {
    id: "2",
    title: "Twitter Account - Verified Blue Checkmark Included",
    price: 150000,
    image: "https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop",
    category: "Twitter",
    verified: true,
  },
  {
    id: "3",
    title: "TikTok Account with 100k Followers - Active Engagement",
    price: 45000,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
    category: "TikTok",
    verified: false,
  },
  {
    id: "4",
    title: "YouTube Channel 20k Subscribers - Gaming Niche",
    price: 85000,
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop",
    category: "YouTube",
    verified: true,
  },
  {
    id: "5",
    title: "Facebook Business Page - 30k Likes",
    price: 35000,
    image: "https://images.unsplash.com/photo-1611162618479-ee3d24aaef0b?w=400&h=300&fit=crop",
    category: "Facebook",
    verified: true,
  },
  {
    id: "6",
    title: "LinkedIn Premium Account with 5k Connections",
    price: 55000,
    image: "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=400&h=300&fit=crop",
    category: "LinkedIn",
    verified: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
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

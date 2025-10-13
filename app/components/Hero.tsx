import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative h-[500px] overflow-hidden md:h-[600px]">
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background"
        style={{
          backgroundImage: `linear-gradient(to bottom right, 
            hsl(var(--primary) / 0.2), 
            hsl(var(--primary) / 0.1), 
            hsl(var(--background) / 1))`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      <div className="container relative mx-auto flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Your Digital Marketplace
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Buy and sell social media accounts securely. Verified sellers,
          instant delivery, and trusted payments.
        </p>

        <div className="w-full max-w-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for Instagram, Twitter, TikTok accounts..."
                className="h-12 pl-10 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-hero-search"
              />
            </div>
            <Button size="lg" className="h-12" data-testid="button-hero-search">
              Search
            </Button>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Button
            variant="outline"
            className="backdrop-blur-sm"
            data-testid="button-browse-instagram"
          >
            Instagram Accounts
          </Button>
          <Button
            variant="outline"
            className="backdrop-blur-sm"
            data-testid="button-browse-twitter"
          >
            Twitter Accounts
          </Button>
          <Button
            variant="outline"
            className="backdrop-blur-sm"
            data-testid="button-browse-tiktok"
          >
            TikTok Accounts
          </Button>
        </div>
      </div>
    </div>
  );
}

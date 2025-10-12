import { Button } from "@/components/ui/button";
import { Hero } from "@/components/Hero";
import { TrustSection } from "@/components/TrustSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Store } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold">Digital Market</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/auth">Login / Sign Up</a>
            </Button>
          </div>
        </div>
      </header>

      <Hero />
      <TrustSection />

      <section className="border-t py-16">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold">Get Started Today</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of users buying and selling social media accounts
          </p>
          <Button size="lg" asChild data-testid="button-get-started">
            <a href="/auth">Get Started</a>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; 2024 Digital Market. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

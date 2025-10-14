import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Store, Star, ArrowRight, CheckCircle, Users, TrendingUp, Shield } from "lucide-react";

export default function Landing() {
  const testimonials = [
    {
      name: "David Okafor",
      role: "Digital Marketer",
      content: "I bought an Instagram account with 50k followers and it transformed my business overnight. The process was seamless and secure. Highly recommend!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
    },
    {
      name: "Sarah Chen",
      role: "E-commerce Owner",
      content: "Best marketplace for social media accounts! I've purchased 3 accounts so far and all were exactly as described. Customer support is amazing!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
    },
    {
      name: "Michael Adeyemi",
      role: "Influencer",
      content: "The instant delivery and verified sellers make this platform stand out. I got my TikTok account in seconds and started posting immediately!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "50,000+", label: "Accounts Sold" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Verified Accounts",
      description: "Every account is thoroughly verified before listing to ensure authenticity and quality."
    },
    {
      icon: TrendingUp,
      title: "Instant Growth",
      description: "Skip the hard work of building followers from scratch. Get established accounts instantly."
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join thousands of satisfied buyers and sellers in our thriving marketplace."
    }
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold">slick logs marketplace</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/auth">Login / Sign Up</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
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
        
        <div className="container relative mx-auto px-4 py-20 sm:px-6 lg:px-8 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Buy & Sell Premium Social Media Accounts
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl lg:text-2xl">
              Your trusted marketplace for Instagram, Twitter, TikTok, and more. 
              Verified sellers, instant delivery, and secure payments guaranteed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild data-testid="button-hero-cta">
                <a href="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-browse">
                <a href="/auth">Browse Accounts</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose slick logs marketplace</h2>
            <p className="text-lg text-muted-foreground">
              The most trusted platform for buying and selling social media accounts
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate active-elevate-2">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <TrustSection />

      {/* Testimonials Section */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of satisfied customers who trust us
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-elevate active-elevate-2">
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mb-6 text-muted-foreground">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="mb-2 text-xl font-bold">Create Account</h3>
              <p className="text-muted-foreground">
                Sign up for free in less than a minute
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="mb-2 text-xl font-bold">Browse & Select</h3>
              <p className="text-muted-foreground">
                Find the perfect account for your needs
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="mb-2 text-xl font-bold">Instant Access</h3>
              <p className="text-muted-foreground">
                Get credentials instantly after purchase
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="border-t bg-primary/5 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Popular Categories</h2>
            <p className="text-lg text-muted-foreground">
              Premium accounts across all major platforms
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {['Instagram', 'Twitter', 'TikTok', 'Facebook'].map((platform, index) => (
              <Card key={index} className="hover-elevate active-elevate-2">
                <CardContent className="p-6 text-center">
                  <div className="mb-3">
                    <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{platform[0]}</span>
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{platform} Accounts</h3>
                  <p className="text-sm text-muted-foreground">Verified & ready to use</p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/auth">View Accounts</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-t py-20">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of users buying and selling social media accounts securely
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/auth">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/support">Contact Support</a>
              </Button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Instant account access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

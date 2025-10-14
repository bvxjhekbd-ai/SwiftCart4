import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Users, Lock, TrendingUp, Globe } from "lucide-react";
import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    document.title = "About Us - slick logs marketplace | Trusted Digital Marketplace";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Learn about slick logs marketplace - your trusted platform for buying and selling premium social media accounts. Discover our mission, values, and commitment to secure digital transactions.");
    }
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Every account is verified and every transaction is secured with industry-leading encryption to protect your investments."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant access to your purchased accounts. No waiting, no delays - just immediate delivery of premium digital assets."
    },
    {
      icon: Users,
      title: "Verified Sellers",
      description: "All our sellers undergo rigorous verification to ensure you're getting authentic, high-quality social media accounts."
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "Your financial information is protected with state-of-the-art payment processing and encryption technology."
    },
    {
      icon: TrendingUp,
      title: "Growth Focused",
      description: "We help businesses and influencers accelerate their online presence with established accounts that deliver results."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Serving customers worldwide with 24/7 support and a diverse marketplace of social media accounts across all platforms."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <div className="relative h-[400px] overflow-hidden">
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
            About slick logs marketplace
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Your trusted partner in the digital marketplace revolution
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <section className="mb-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Our Mission</h2>
            <p className="mb-4 text-lg text-muted-foreground">
              At slick logs marketplace, we're revolutionizing the way people buy and sell social media accounts. 
              We believe in creating a secure, transparent, and efficient marketplace where businesses and 
              individuals can access premium digital assets to accelerate their online growth.
            </p>
            <p className="text-lg text-muted-foreground">
              Our platform bridges the gap between those looking to monetize their social media presence and 
              those seeking to establish an instant online footprint. With cutting-edge security measures and 
              a commitment to excellence, we ensure every transaction is smooth, safe, and satisfactory.
            </p>
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose Us</h2>
            <p className="text-lg text-muted-foreground">
              We're more than just a marketplace - we're your partner in digital success
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="hover-elevate active-elevate-2">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">Our Story</h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                Founded by digital marketing professionals and tech enthusiasts, slick logs marketplace 
                emerged from a simple observation: the social media account marketplace was fragmented, 
                insecure, and lacked transparency.
              </p>
              <p>
                We set out to change that. By combining advanced verification systems, secure payment 
                infrastructure, and a user-first approach, we've created a platform that serves thousands 
                of satisfied customers worldwide.
              </p>
              <p>
                Today, slick logs marketplace stands as the premier destination for anyone looking to buy 
                or sell social media accounts across Instagram, Twitter, TikTok, and more. Our commitment 
                to innovation, security, and customer satisfaction drives everything we do.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-primary/5 p-8 text-center md:p-12">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Join Our Community</h2>
          <p className="mb-6 text-lg text-muted-foreground">
            Thousands of users trust slick logs marketplace for their digital asset needs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Successful Transactions</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">5K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; 2025 slick logs marketplace</p>
        </div>
      </footer>
    </div>
  );
}

import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, CreditCard, CheckCircle, Wallet, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

export default function GetStarted() {
  useEffect(() => {
    document.title = "How to Get Started - slick logs marketplace | Step-by-Step Guide";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Learn how to get started with slick logs marketplace. Follow our simple step-by-step guide to buy premium social media accounts safely and securely.");
    }
  }, []);

  const steps = [
    {
      icon: UserPlus,
      title: "Create Your Account",
      description: "Sign up for free in less than a minute. Provide your email, create a secure password, and verify your account to get started on your digital marketplace journey.",
      tips: [
        "Use a strong, unique password",
        "Verify your email address immediately",
        "Complete your profile for better security"
      ]
    },
    {
      icon: Wallet,
      title: "Fund Your Wallet",
      description: "Add funds to your slick logs marketplace wallet using secure payment methods. We support multiple payment options including cards and bank transfers for your convenience.",
      tips: [
        "Start with the amount you need for your first purchase",
        "All transactions are encrypted and secure",
        "Funds are instantly available after deposit"
      ]
    },
    {
      icon: Search,
      title: "Browse & Select",
      description: "Explore our extensive collection of verified social media accounts across Instagram, Twitter, TikTok, and more. Use filters to find accounts that match your specific needs.",
      tips: [
        "Check account details carefully",
        "Review seller ratings and reviews",
        "Compare similar accounts for the best value"
      ]
    },
    {
      icon: ShoppingCart,
      title: "Make Your Purchase",
      description: "Add items to your cart and proceed to checkout. Review your order details and complete the purchase with funds from your wallet - it's that simple!",
      tips: [
        "Double-check account details before purchasing",
        "Ensure you have sufficient wallet balance",
        "Save the transaction receipt for your records"
      ]
    },
    {
      icon: CheckCircle,
      title: "Receive & Verify",
      description: "Get instant access to your purchased account credentials. Change the password immediately and verify all account details match the listing description.",
      tips: [
        "Change passwords immediately after purchase",
        "Enable two-factor authentication",
        "Report any issues within 24 hours for full refund"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <div className="relative h-[350px] overflow-hidden">
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
            How to Get Started
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Your journey to owning premium social media accounts starts here
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <section className="mb-16">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold">Simple Steps to Success</h2>
            <p className="text-lg text-muted-foreground">
              Follow these easy steps to start buying and selling on slick logs marketplace. 
              Our platform is designed to be intuitive and user-friendly.
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <Card key={step.title} className="overflow-hidden hover-elevate active-elevate-2">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex items-center justify-center bg-primary/5 p-8 md:w-1/3">
                      <div className="text-center">
                        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                          <step.icon className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-5xl font-bold text-primary">{index + 1}</div>
                      </div>
                    </div>
                    <div className="p-8 md:w-2/3">
                      <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
                      <p className="mb-4 text-lg text-muted-foreground">{step.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Pro Tips:</p>
                        <ul className="space-y-1">
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start text-sm text-muted-foreground">
                              <CheckCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-primary/5 p-8 text-center md:p-12">
          <h2 className="mb-4 text-3xl font-bold">Ready to Begin?</h2>
          <p className="mb-6 text-lg text-muted-foreground">
            Join thousands of satisfied customers and start your journey today
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild data-testid="button-get-started-cta">
              <Link href="/auth">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-browse-products">
              <Link href="/">Browse Products</Link>
            </Button>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="mx-auto max-w-3xl space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold">How long does it take to receive my account?</h3>
                <p className="text-muted-foreground">
                  Account credentials are delivered instantly to your dashboard after successful payment. 
                  You can access them immediately and start using your new account right away.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept various secure payment methods including credit/debit cards and bank transfers. 
                  All payments are processed through encrypted, industry-standard payment gateways.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold">Is there a money-back guarantee?</h3>
                <p className="text-muted-foreground">
                  Yes! If you're not satisfied with your purchase or if the account doesn't match the 
                  description, you can request a full refund within 24 hours of purchase.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold">How do I contact support?</h3>
                <p className="text-muted-foreground">
                  Our support team is available 24/7 via WhatsApp, Telegram, and email. Visit our support 
                  page for all contact details and get help whenever you need it.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; 2025 slick logs marketplace</p>
        </div>
      </footer>
    </div>
  );
}

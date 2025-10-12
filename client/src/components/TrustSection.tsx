import { Shield, Zap, CheckCircle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Verified Sellers",
    description: "All sellers are verified to ensure quality and reliability",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Your payments are protected with industry-leading encryption",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Get your account details immediately after purchase",
  },
  {
    icon: CheckCircle,
    title: "Money-Back Guarantee",
    description: "Not satisfied? Get a full refund within 24 hours",
  },
];

export function TrustSection() {
  return (
    <section className="border-t py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose Us</h2>
          <p className="text-lg text-muted-foreground">
            Your trusted marketplace for digital products
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

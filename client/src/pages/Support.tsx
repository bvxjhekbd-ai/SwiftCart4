import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Send, Phone } from "lucide-react";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import { useEffect } from "react";

export default function Support() {
  useEffect(() => {
    document.title = "Support - slick logs marketplace | 24/7 Customer Help";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Get 24/7 support from slick logs marketplace. Contact us via WhatsApp, Telegram, or email for instant help with your orders and questions.");
    }
  }, []);

  const whatsappNumbers = [
    { number: "+2349165926869", display: "+234 916 592 6869" },
    { number: "+2347040987894", display: "+234 704 098 7894" },
    { number: "+2349034474764", display: "+234 903 447 4764" }
  ];

  const telegramHandles = [
    { handle: "@SLICK_LOGS_SUPPORT", link: "https://t.me/SLICK_LOGS_SUPPORT" },
    { handle: "@SLICK_LOGS_SUPPORT2", link: "https://t.me/SLICK_LOGS_SUPPORT2" },
    { handle: "@SLICK_LOGS_SUPPORT3", link: "https://t.me/SLICK_LOGS_SUPPORT3" },
    { handle: "@SLICK_LOGS_SUPPORT4", link: "https://t.me/SLICK_LOGS_SUPPORT4" }
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
          <MessageCircle className="mb-6 h-16 w-16 text-primary" />
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            We're Here to Help
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            24/7 support team ready to assist you with any questions or concerns
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <section className="mb-16">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold">Contact Our Support Team</h2>
            <p className="text-lg text-muted-foreground">
              Choose your preferred method to reach us. Our dedicated support team is available around 
              the clock to ensure you have the best experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="hover-elevate active-elevate-2">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <SiWhatsapp className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">WhatsApp Support</h3>
                <p className="mb-6 text-muted-foreground">
                  Get instant responses via WhatsApp. Click any number below to start chatting with our support team.
                </p>
                <div className="space-y-3">
                  {whatsappNumbers.map((contact, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start gap-3"
                      asChild
                      data-testid={`button-whatsapp-${index + 1}`}
                    >
                      <a
                        href={`https://wa.me/${contact.number.replace(/\+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Phone className="h-4 w-4" />
                        {contact.display}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate active-elevate-2">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                  <SiTelegram className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">Telegram Support</h3>
                <p className="mb-6 text-muted-foreground">
                  Prefer Telegram? Connect with our support agents for fast and efficient assistance.
                </p>
                <div className="space-y-3">
                  {telegramHandles.map((contact, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start gap-3"
                      asChild
                      data-testid={`button-telegram-${index + 1}`}
                    >
                      <a
                        href={contact.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Send className="h-4 w-4" />
                        {contact.handle}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <Card className="hover-elevate active-elevate-2">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                <div className="mb-6 md:mb-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-2xl font-bold">Email Support</h3>
                  <p className="mb-4 text-muted-foreground">
                    For detailed inquiries or documentation, send us an email and we'll respond within 24 hours.
                  </p>
                  <Button variant="outline" asChild data-testid="button-email-support">
                    <a href="mailto:slickexchange1@gmail.com">
                      <Mail className="mr-2 h-4 w-4" />
                      slickexchange1@gmail.com
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <Card className="bg-primary/5 hover-elevate active-elevate-2">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                <div className="mb-6 md:mb-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <SiTelegram className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-2xl font-bold">Join Our Channel</h3>
                  <p className="mb-4 text-muted-foreground">
                    Stay updated with the latest products, announcements, and exclusive deals on our Telegram channel.
                  </p>
                  <Button asChild data-testid="button-telegram-channel">
                    <a
                      href="https://t.me/trillsx"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Join @trillsx Channel
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-8 text-center text-3xl font-bold">Common Support Topics</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-lg font-semibold">Order Issues</h3>
                <p className="text-sm text-muted-foreground">
                  Problems with your order, account access, or delivery? Contact us immediately for assistance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-lg font-semibold">Payment & Refunds</h3>
                <p className="text-sm text-muted-foreground">
                  Questions about payments, wallet deposits, or refund requests? We're here to help.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-lg font-semibold">Account Security</h3>
                <p className="text-sm text-muted-foreground">
                  Need help securing your account or changing credentials? Our team will guide you through it.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-16 rounded-lg bg-primary/5 p-8 text-center md:p-12">
          <h2 className="mb-4 text-3xl font-bold">Response Time</h2>
          <p className="mb-2 text-lg text-muted-foreground">
            Average response time: <span className="font-bold text-primary">Under 5 minutes</span>
          </p>
          <p className="text-muted-foreground">
            Our support team is committed to providing fast, friendly, and effective assistance whenever you need it.
          </p>
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

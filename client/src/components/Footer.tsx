import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4 mb-8">
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors" data-testid="footer-link-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-primary transition-colors" data-testid="footer-link-support">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/get-started" className="hover:text-primary transition-colors" data-testid="footer-link-get-started">
                  How to Get Started
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors" data-testid="footer-link-privacy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="mailto:slickexchange1@gmail.com" 
                  className="hover:text-primary transition-colors"
                  data-testid="footer-link-email"
                >
                  slickexchange1@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/trillsx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  data-testid="footer-link-telegram"
                >
                  Telegram Channel
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Follow Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="https://wa.me/2349165926869" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  data-testid="footer-link-whatsapp"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 slick logs marketplace</p>
        </div>
      </div>
    </footer>
  );
}

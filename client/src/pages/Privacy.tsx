import { Header } from "@/components/Header";
import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy - slick logs marketplace | Your Privacy Matters";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Read slick logs marketplace's privacy policy to understand how we collect, use, and protect your personal information. Your privacy and security are our top priorities.");
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-muted-foreground">Last updated: January 2025</p>

        <div className="space-y-8 text-lg">
          <section>
            <h2 className="mb-4 text-2xl font-semibold">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to slick logs marketplace. We respect your privacy and are committed to protecting 
              your personal data. This privacy policy will inform you about how we look after your personal 
              data when you visit our platform and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">2. Information We Collect</h2>
            <p className="mb-3 text-muted-foreground">
              We collect and process the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier</li>
              <li><strong>Contact Data:</strong> includes email address and telephone numbers</li>
              <li><strong>Financial Data:</strong> includes payment card details and transaction history</li>
              <li><strong>Transaction Data:</strong> includes details about payments to and from you and details of products you have purchased</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website and services</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">3. How We Use Your Information</h2>
            <p className="mb-3 text-muted-foreground">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To register you as a new customer and manage your account</li>
              <li>To process and deliver your orders including managing payments and collecting money owed</li>
              <li>To manage our relationship with you including notifying you about changes to our terms or privacy policy</li>
              <li>To improve our website, products/services, marketing or customer relationships</li>
              <li>To make recommendations to you about goods or services that may be of interest to you</li>
              <li>To comply with legal and regulatory requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">4. Data Security</h2>
            <p className="text-muted-foreground">
              We have implemented appropriate security measures to prevent your personal data from being 
              accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We limit 
              access to your personal data to those employees, agents, contractors and other third parties 
              who have a business need to know. They will only process your personal data on our instructions 
              and are subject to a duty of confidentiality.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">5. Data Retention</h2>
            <p className="text-muted-foreground">
              We will only retain your personal data for as long as necessary to fulfill the purposes we 
              collected it for, including for the purposes of satisfying any legal, accounting, or reporting 
              requirements. To determine the appropriate retention period, we consider the amount, nature, 
              and sensitivity of the personal data, the potential risk of harm from unauthorized use or 
              disclosure, and whether we can achieve our purposes through other means.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">6. Your Legal Rights</h2>
            <p className="mb-3 text-muted-foreground">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Request access to your personal data</li>
              <li>Request correction of your personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing your personal data</li>
              <li>Request transfer of your personal data</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">7. Third-Party Links</h2>
            <p className="text-muted-foreground">
              Our website may include links to third-party websites, plug-ins and applications. Clicking 
              on those links or enabling those connections may allow third parties to collect or share data 
              about you. We do not control these third-party websites and are not responsible for their 
              privacy statements.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">8. Cookies</h2>
            <p className="text-muted-foreground">
              Our website uses cookies to distinguish you from other users. This helps us to provide you 
              with a good experience when you browse our website and also allows us to improve our site. 
              You can set your browser to refuse all or some browser cookies, or to alert you when websites 
              set or access cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">9. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any changes by 
              posting the new privacy policy on this page and updating the "Last updated" date at the top 
              of this privacy policy.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">10. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p className="mt-3 text-muted-foreground">
              Email: <a href="mailto:slickexchange1@gmail.com" className="text-primary hover:underline">slickexchange1@gmail.com</a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; 2025 slick logs marketplace</p>
        </div>
      </footer>
    </div>
  );
}

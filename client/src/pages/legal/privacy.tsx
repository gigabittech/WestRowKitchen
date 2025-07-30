import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationHeader from "@/components/navigation-header";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <title>Privacy Policy - West Row Kitchen</title>
      <meta name="description" content="Learn how West Row Kitchen collects, uses, and protects your personal information. Read our comprehensive privacy policy." />
      
      <NavigationHeader 
        isCartOpen={false}
        setIsCartOpen={() => {}}
        cartItemCount={0}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-gray-600">Last updated: January 29, 2024</p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <h2>1. Introduction</h2>
            <p>
              West Row Kitchen ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our food delivery service.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>Personal Information</h3>
            <p>We collect the following types of personal information:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
              <li><strong>Delivery Information:</strong> Delivery addresses, special instructions</li>
              <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely through third-party providers)</li>
              <li><strong>Order History:</strong> Past orders, preferences, ratings and reviews</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
              <li><strong>Usage Data:</strong> How you interact with our service, pages visited, time spent</li>
              <li><strong>Location Data:</strong> GPS coordinates for delivery purposes (with your consent)</li>
              <li><strong>Cookies:</strong> Small data files stored on your device</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your personal information for the following purposes:</p>
            <ul>
              <li><strong>Service Provision:</strong> Processing orders, coordinating deliveries, customer support</li>
              <li><strong>Communication:</strong> Order confirmations, delivery updates, promotional offers</li>
              <li><strong>Improvement:</strong> Analyzing usage patterns to enhance our service</li>
              <li><strong>Security:</strong> Fraud prevention and account security</li>
              <li><strong>Legal Compliance:</strong> Meeting legal obligations and enforcing our terms</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>We may share your information with:</p>
            
            <h3>Restaurant Partners</h3>
            <p>We share order details and delivery information with restaurants to fulfill your orders.</p>
            
            <h3>Delivery Partners</h3>
            <p>Delivery information is shared with our delivery partners to ensure successful delivery.</p>
            
            <h3>Service Providers</h3>
            <p>Third-party companies that help us operate our service:</p>
            <ul>
              <li>Payment processors (Stripe, PayPal)</li>
              <li>Email service providers</li>
              <li>Analytics providers</li>
              <li>Customer support platforms</li>
            </ul>

            <h3>Legal Requirements</h3>
            <p>We may disclose information when required by law or to protect our rights and safety.</p>

            <h2>5. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information:</p>
            <ul>
              <li>SSL encryption for data transmission</li>
              <li>Secure servers and databases</li>
              <li>Regular security audits</li>
              <li>Employee access controls</li>
              <li>PCI DSS compliance for payment processing</li>
            </ul>

            <h2>6. Your Rights and Choices</h2>
            
            <h3>Access and Correction</h3>
            <p>You can access and update your personal information through your account settings.</p>
            
            <h3>Data Deletion</h3>
            <p>You can request deletion of your account and personal data by contacting us.</p>
            
            <h3>Marketing Communications</h3>
            <p>You can opt out of promotional emails by clicking the unsubscribe link or updating your preferences.</p>
            
            <h3>Location Services</h3>
            <p>You can disable location services through your device settings.</p>

            <h2>7. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences and login information</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Provide personalized content and advertisements</li>
              <li>Improve website functionality</li>
            </ul>
            <p>You can control cookies through your browser settings.</p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we discover we have collected such information, we will delete it immediately.
            </p>

            <h2>9. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Order history may be retained for accounting and legal purposes.
            </p>

            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2>11. California Privacy Rights (CCPA)</h2>
            <p>If you are a California resident, you have the right to:</p>
            <ul>
              <li>Know what personal information we collect about you</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of the sale of your personal information</li>
              <li>Non-discrimination for exercising your privacy rights</li>
            </ul>

            <h2>12. European Privacy Rights (GDPR)</h2>
            <p>If you are in the European Union, you have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Erase your personal data</li>
              <li>Restrict processing of your data</li>
              <li>Data portability</li>
              <li>Object to processing</li>
            </ul>

            <h2>13. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of significant changes by email or through our service. Your continued use of our service after changes indicates your acceptance of the updated policy.
            </p>

            <h2>14. Contact Us</h2>
            <p>
              If you have questions about this privacy policy or our data practices, please contact us:
            </p>
            <ul>
              <li>Email: privacy@westrowkitchen.com</li>
              <li>Phone: +1 (555) WEST-ROW</li>
              <li>Address: 123 West Row Street, Los Angeles, CA 90210</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

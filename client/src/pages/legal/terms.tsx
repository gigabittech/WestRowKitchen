import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationHeader from "@/components/navigation-header";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <title>Terms of Service - West Row Kitchen</title>
      <meta name="description" content="Read West Row Kitchen's terms of service, including user responsibilities, service usage, and legal agreements." />
      
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
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            <p className="text-gray-600">Last updated: January 29, 2024</p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using West Row Kitchen ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              West Row Kitchen is an online food delivery platform that connects customers with local restaurants. We facilitate the ordering and delivery of food from participating restaurants to customers' specified locations.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To use certain features of our Service, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>
            <ul>
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining the security of your password</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h2>4. Ordering and Payment</h2>
            <p>
              When you place an order through our Service:
            </p>
            <ul>
              <li>All orders are subject to acceptance by the restaurant</li>
              <li>Prices and availability are subject to change without notice</li>
              <li>Payment is processed at the time of order placement</li>
              <li>You agree to pay all charges incurred by your account</li>
            </ul>

            <h2>5. Delivery</h2>
            <p>
              Delivery times are estimates and may vary based on restaurant preparation time, delivery distance, weather conditions, and other factors. We are not responsible for delays caused by circumstances beyond our control.
            </p>

            <h2>6. Cancellations and Refunds</h2>
            <p>
              Order cancellations may be requested but are subject to restaurant approval. Refunds will be processed according to our refund policy. We reserve the right to cancel orders in cases of suspected fraud or other violations of these terms.
            </p>

            <h2>7. User Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Transmit any harmful or disruptive content</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Create false accounts or impersonate others</li>
            </ul>

            <h2>8. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by West Row Kitchen and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2>9. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>

            <h2>10. Disclaimers</h2>
            <p>
              The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, West Row Kitchen disclaims all warranties, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              West Row Kitchen shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>

            <h2>12. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless West Row Kitchen from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service.
            </p>

            <h2>13. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including breach of these Terms.
            </p>

            <h2>14. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h2>15. Governing Law</h2>
            <p>
              These Terms shall be interpreted and governed by the laws of the State of California, without regard to its conflict of law provisions.
            </p>

            <h2>16. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <ul>
              <li>Email: legal@westrowkitchen.com</li>
              <li>Phone: +1 (555) WEST-ROW</li>
              <li>Address: 123 West Row Street, Los Angeles, CA 90210</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

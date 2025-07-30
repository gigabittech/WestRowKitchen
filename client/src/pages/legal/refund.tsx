import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationHeader from "@/components/navigation-header";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Refund() {
  return (
    <div className="min-h-screen bg-background">
      <title>Refund Policy - West Row Kitchen</title>
      <meta name="description" content="Learn about West Row Kitchen's refund and cancellation policy for food delivery orders." />
      
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
            <CardTitle className="text-3xl font-bold">Refund Policy</CardTitle>
            <p className="text-gray-600">Last updated: January 29, 2024</p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <h2>1. Overview</h2>
            <p>
              At West Row Kitchen, we want you to be completely satisfied with your food delivery experience. This refund policy outlines the circumstances under which refunds may be issued and the process for requesting them.
            </p>

            <h2>2. Eligible Refund Scenarios</h2>
            <p>Refunds may be issued in the following situations:</p>
            
            <h3>Order Issues</h3>
            <ul>
              <li><strong>Wrong Order:</strong> You received an order that was not yours</li>
              <li><strong>Missing Items:</strong> Significant items were missing from your order</li>
              <li><strong>Quality Issues:</strong> Food was significantly different from description or inedible</li>
              <li><strong>Temperature Issues:</strong> Hot food arrived cold or cold items arrived warm</li>
            </ul>

            <h3>Delivery Issues</h3>
            <ul>
              <li><strong>Failed Delivery:</strong> Order was not delivered to the specified address</li>
              <li><strong>Excessive Delay:</strong> Delivery was significantly delayed beyond the estimated time</li>
              <li><strong>Delivery Error:</strong> Order was delivered to the wrong address through our error</li>
            </ul>

            <h3>Restaurant Issues</h3>
            <ul>
              <li><strong>Restaurant Closure:</strong> Restaurant closed after order was placed and confirmed</li>
              <li><strong>Item Unavailability:</strong> Significant portion of order unavailable after confirmation</li>
            </ul>

            <h2>3. Order Cancellations</h2>
            
            <h3>Customer-Initiated Cancellations</h3>
            <ul>
              <li><strong>Before Restaurant Confirmation:</strong> Full refund available within 5 minutes of placing order</li>
              <li><strong>After Restaurant Confirmation:</strong> Cancellation subject to restaurant approval; partial refund may apply</li>
              <li><strong>After Food Preparation Begins:</strong> Cancellation generally not available; exceptions at restaurant discretion</li>
            </ul>

            <h3>Automatic Cancellations</h3>
            <p>Orders may be automatically cancelled and fully refunded if:</p>
            <ul>
              <li>Restaurant fails to confirm order within 15 minutes</li>
              <li>Payment processing fails</li>
              <li>System errors prevent order fulfillment</li>
            </ul>

            <h2>4. Refund Process</h2>
            
            <h3>How to Request a Refund</h3>
            <ol>
              <li><strong>Contact Customer Support:</strong> Report issues within 2 hours of delivery</li>
              <li><strong>Provide Details:</strong> Include order number, specific issues, and photos if applicable</li>
              <li><strong>Investigation:</strong> We will review your request and may contact the restaurant</li>
              <li><strong>Resolution:</strong> Refund decision will be communicated within 24-48 hours</li>
            </ol>

            <h3>Required Information</h3>
            <p>When requesting a refund, please provide:</p>
            <ul>
              <li>Order number</li>
              <li>Date and time of order</li>
              <li>Detailed description of the issue</li>
              <li>Photos of the order (if applicable)</li>
              <li>Contact information</li>
            </ul>

            <h2>5. Refund Methods and Timing</h2>
            
            <h3>Refund Methods</h3>
            <ul>
              <li><strong>Original Payment Method:</strong> Refunds will be processed to the original payment method</li>
              <li><strong>Store Credit:</strong> May be offered as an alternative for faster resolution</li>
              <li><strong>Promotional Credits:</strong> Account credits for future orders</li>
            </ul>

            <h3>Processing Time</h3>
            <ul>
              <li><strong>Credit/Debit Cards:</strong> 3-5 business days</li>
              <li><strong>Digital Wallets:</strong> 1-3 business days</li>
              <li><strong>Store Credit:</strong> Immediate</li>
            </ul>

            <h2>6. Partial Refunds</h2>
            <p>Partial refunds may be issued for:</p>
            <ul>
              <li>Minor missing items or substitutions</li>
              <li>Quality issues affecting only part of the order</li>
              <li>Moderate delivery delays</li>
              <li>Packaging or presentation issues</li>
            </ul>

            <h2>7. Non-Refundable Situations</h2>
            <p>Refunds will generally not be issued for:</p>
            <ul>
              <li>Changes of mind or ordering errors by the customer</li>
              <li>Taste preferences or subjective quality opinions</li>
              <li>Delivery delays due to weather or traffic conditions</li>
              <li>Unavailability of specific delivery time slots</li>
              <li>Issues reported more than 2 hours after delivery</li>
              <li>Failure to receive delivery due to incorrect customer information</li>
            </ul>

            <h2>8. Delivery Fees and Service Charges</h2>
            <ul>
              <li><strong>Delivery Fees:</strong> Refunded for failed deliveries or significant delays</li>
              <li><strong>Service Fees:</strong> Refunded proportionally with order refunds</li>
              <li><strong>Tips:</strong> Tips to delivery drivers are non-refundable once delivery is completed</li>
            </ul>

            <h2>9. Promotional Offers and Discounts</h2>
            <ul>
              <li>Promotional codes and discounts are typically one-time use and non-transferable</li>
              <li>Refunded orders may result in forfeiture of promotional benefits</li>
              <li>Promotional credits may be reissued at our discretion</li>
            </ul>

            <h2>10. Dispute Resolution</h2>
            <p>If you are unsatisfied with our refund decision:</p>
            <ol>
              <li>Contact our customer service manager for review</li>
              <li>Provide additional documentation if available</li>
              <li>Allow 3-5 business days for escalated review</li>
              <li>Final decisions will be communicated in writing</li>
            </ol>

            <h2>11. Fraud Prevention</h2>
            <p>
              We monitor refund requests for patterns of abuse. Accounts with excessive refund requests may be subject to review, limitations, or suspension. We reserve the right to investigate suspicious activity.
            </p>

            <h2>12. Restaurant Partner Responsibilities</h2>
            <p>
              While we facilitate refunds, restaurant partners are responsible for food quality and order accuracy. We work with restaurants to resolve issues and may adjust partner relationships based on performance.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              For refund requests or questions about this policy, please contact us:
            </p>
            <ul>
              <li><strong>Customer Support:</strong> support@westrowkitchen.com</li>
              <li><strong>Phone:</strong> +1 (555) WEST-ROW</li>
              <li><strong>Hours:</strong> Monday-Sunday, 7:00 AM - 11:00 PM PST</li>
              <li><strong>Live Chat:</strong> Available through our website and mobile app</li>
            </ul>

            <h2>14. Policy Updates</h2>
            <p>
              This refund policy may be updated periodically. Significant changes will be communicated through email or in-app notifications. Continued use of our service constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

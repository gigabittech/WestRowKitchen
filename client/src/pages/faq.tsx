import { useState } from "react";
import { Link } from "wouter";
import NavigationHeader from "@/components/navigation-header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      category: "Getting Started",
      color: "bg-blue-100 text-blue-800",
      questions: [
        {
          q: "How do I create an account?",
          a: "Creating an account is easy! Click the 'Sign In' button in the top right corner, then select 'Create Account'. You'll need to provide your email address, create a password, and verify your email. Once verified, you can start ordering right away."
        },
        {
          q: "Is West Row Kitchen available in my area?",
          a: "We're constantly expanding! Enter your address on our homepage or in the location selector to see if we deliver to your area. If we don't deliver to you yet, you can join our waitlist to be notified when we arrive in your neighborhood."
        },
        {
          q: "Do I need to download an app?",
          a: "No app required! Our website works perfectly on all devices - desktop, tablet, and mobile. Simply visit our website to browse restaurants and place orders from any device."
        }
      ]
    },
    {
      category: "Ordering",
      color: "bg-green-100 text-green-800",
      questions: [
        {
          q: "How do I place an order?",
          a: "Browse available restaurants, select items you want, add them to your cart, then proceed to checkout. You'll need to provide a delivery address and payment method. Once confirmed, you'll receive order tracking information."
        },
        {
          q: "What are the minimum order requirements?",
          a: "Minimum orders vary by restaurant, typically ranging from $10-15. The minimum order amount is displayed on each restaurant's page before you start ordering."
        },
        {
          q: "Can I modify my order after placing it?",
          a: "You can modify or cancel orders within 5 minutes of placing them, provided the restaurant hasn't started preparing your food. After this window, contact our support team for assistance."
        },
        {
          q: "Can I schedule orders for later?",
          a: "Yes! During checkout, you can choose 'Schedule for later' and select your preferred delivery time up to 7 days in advance. This feature is available for most restaurants."
        }
      ]
    },
    {
      category: "Delivery & Pickup",
      color: "bg-orange-100 text-orange-800",
      questions: [
        {
          q: "How long does delivery take?",
          a: "Delivery times typically range from 25-45 minutes, depending on the restaurant's preparation time, distance, and current demand. You'll see estimated delivery times before placing your order."
        },
        {
          q: "How can I track my order?",
          a: "After placing an order, you'll receive real-time updates via email and SMS. You can also track your order status by visiting the 'My Orders' section in your account."
        },
        {
          q: "What if my delivery is late?",
          a: "If your order is significantly delayed, you'll automatically receive updates. For orders more than 15 minutes late, contact our support team for assistance and possible compensation."
        },
        {
          q: "Do you offer pickup options?",
          a: "Yes! Many restaurants offer pickup options. You'll see pickup availability and estimated ready times when browsing restaurants. Pickup orders often have shorter wait times."
        }
      ]
    },
    {
      category: "Payment & Billing",
      color: "bg-purple-100 text-purple-800",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and other digital wallets. Payment is processed securely at checkout."
        },
        {
          q: "Are there any additional fees?",
          a: "Orders include a delivery fee (typically $1.49-$2.99), service fee, and applicable taxes. All fees are clearly displayed before you complete your order. No hidden charges!"
        },
        {
          q: "How do tips work?",
          a: "You can add a tip for your delivery driver during checkout or after delivery. Tips go 100% to the driver. Suggested tip amounts are 15%, 18%, or 20% of your order total."
        },
        {
          q: "How do refunds work?",
          a: "Refunds are processed to your original payment method within 3-5 business days. For order issues, contact support immediately for faster resolution and possible credit to your account."
        }
      ]
    },
    {
      category: "Account & Security",
      color: "bg-red-100 text-red-800",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click 'Sign In', then 'Forgot Password?' Enter your email address and we'll send you a password reset link. Follow the instructions in the email to create a new password."
        },
        {
          q: "How do I update my delivery address?",
          a: "You can add, edit, or remove delivery addresses in your account settings. You can also enter a new address during checkout for one-time deliveries."
        },
        {
          q: "Is my payment information secure?",
          a: "Absolutely! We use industry-standard encryption and never store your full payment details. All transactions are processed through secure, PCI-compliant payment processors."
        },
        {
          q: "Can I delete my account?",
          a: "Yes, you can delete your account by contacting our support team. Please note that this action is permanent and will remove all order history and saved information."
        }
      ]
    }
  ];

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      searchQuery === "" ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <title>Frequently Asked Questions - West Row Kitchen</title>
      <meta name="description" content="Find answers to common questions about West Row Kitchen orders, delivery, payments, and account management. Get quick help with our comprehensive FAQ." />
      
      <NavigationHeader 
        isCartOpen={false}
        setIsCartOpen={() => {}}
        cartItemCount={0}
      />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl mb-8 opacity-90">Quick answers to common questions</p>
            
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-black"
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Back Button */}
          <Link href="/help">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredFAQs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-3 mb-6">
                  <Badge className={category.color} variant="secondary">
                    {category.category}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {category.questions.length} question{category.questions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex;
                    const isExpanded = expandedItems.includes(globalIndex);
                    
                    return (
                      <Card key={faqIndex} className="border-l-4 border-l-primary">
                        <CardHeader 
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleExpanded(globalIndex)}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-medium">{faq.q}</CardTitle>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </CardHeader>
                        {isExpanded && (
                          <CardContent className="pt-0">
                            <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or browse our help categories.
              </p>
              <Button asChild>
                <Link href="/help">Browse Help Center</Link>
              </Button>
            </div>
          )}

          {/* Still Need Help */}
          <div className="mt-12 text-center">
            <Card className="bg-gray-50">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Our support team is ready to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/help">Help Center</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
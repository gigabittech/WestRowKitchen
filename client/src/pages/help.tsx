import { useState } from "react";
import { Link } from "wouter";
import NavigationHeader from "@/components/navigation-header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, MessageCircle, Phone, Mail, Clock } from "lucide-react";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      questions: [
        { q: "How do I create an account?", a: "Click 'Sign In' and follow the registration process with your email address." },
        { q: "How do I place my first order?", a: "Browse restaurants, add items to cart, and proceed to checkout with your delivery address." },
        { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and digital wallets like Apple Pay and Google Pay." }
      ]
    },
    {
      title: "Orders & Delivery",
      questions: [
        { q: "How long does delivery take?", a: "Delivery times vary by restaurant but typically range from 25-45 minutes." },
        { q: "Can I track my order?", a: "Yes, you can track your order status in real-time from your Orders page." },
        { q: "What if my order is late?", a: "If your order is significantly delayed, contact our support team for assistance and possible compensation." }
      ]
    },
    {
      title: "Account & Billing",
      questions: [
        { q: "How do I update my payment information?", a: "Go to your account settings and update your payment methods in the billing section." },
        { q: "Can I cancel my order?", a: "Orders can be cancelled within 5 minutes of placement if the restaurant hasn't started preparing it." },
        { q: "How do refunds work?", a: "Refunds are processed within 3-5 business days to your original payment method." }
      ]
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      availability: "24/7",
      action: "Start Chat"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for immediate help",
      availability: "Mon-Sun 8AM-10PM",
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Response within 24 hours",
      action: "Send Email"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <title>Help Center - West Row Kitchen</title>
      <meta name="description" content="Get help with your West Row Kitchen orders, account, and delivery questions. Find answers to common questions or contact our support team." />
      
      <NavigationHeader 
        isCartOpen={false}
        setIsCartOpen={() => {}}
        cartItemCount={0}
      />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-primary text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-xl mb-8 opacity-90">Find answers to common questions or get in touch with our support team</p>
            
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-black"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          {/* Contact Options */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {contactOptions.map((option, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <option.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-2">{option.description}</p>
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                      <Clock className="w-4 h-4 mr-1" />
                      {option.availability}
                    </div>
                    <Button className="w-full">{option.action}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-8">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-xl font-semibold mb-4 text-primary">{category.title}</h3>
                  <div className="space-y-4">
                    {category.questions.map((faq, faqIndex) => (
                      <Card key={faqIndex}>
                        <CardHeader>
                          <CardTitle className="text-lg">{faq.q}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">{faq.a}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Still Need Help */}
          <section className="mt-12 text-center">
            <Card className="bg-gray-50">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Still need help?</h3>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Our support team is here to help you 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg">Contact Support</Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/contact">Send Message</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
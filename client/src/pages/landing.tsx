import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/navigation-header";
import RestaurantCard from "@/components/restaurant-card";

import CartSidebar from "@/components/ui/cart-sidebar";
import Footer from "@/components/footer";
import {
  MapPin,
  Search,
  Clock,
  Star,
  Utensils,
  Smartphone,
  CheckCircle,
  Gift,
  ChevronDown
} from "lucide-react";
import type { Restaurant, Promotion } from "@shared/schema";

export default function Landing() {
  const [selectedCuisine, setSelectedCuisine] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Fetch restaurants
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  // Fetch promotions
  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
  });

  const featuredRestaurants = restaurants.slice(0, 6);



  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* SEO Meta Tags */}
      <title>West Row Kitchen - Food Delivery from Local Restaurants</title>
      <meta name="description" content="Order food delivery from the best local restaurants in your area. Fast delivery, fresh food, and amazing flavors at West Row Kitchen." />

      <NavigationHeader
        cartItemCount={cartItems.length}
      />

      {/* Hero Section */}
      <section className="relative h-[950px] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <img src="/assets/Home.jpg" alt="Hero Background" className="w-full h-full object-cover " />
          <div className="absolute inset-0" style={{ background: 'conic-gradient(from -88.67deg at 50.7% 60.73%, #00231F -88.54deg, rgba(0, 217, 146, 0.05) 95.6deg, #00231F 271.46deg, rgba(0, 217, 146, 0.05) 455.6deg)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <h1 className="w-full max-w-[1216px] pt-16 font-['Helixa'] font-black text-[60px] md:text-[80px] leading-[100%] md:leading-[82px] text-center text-[#F8F8F8] mb-6">
                Craving Something<br />
                Delicious?
              </h1>
            </div>
            <p className="text-xl  mb-8 max-w-2xl mx-auto h-[60px] w-[598px] text-[#FCFCFC]">


              From local favorites to hidden gems, get the food you love delivered hot and fresh to your door
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/restaurants">
                <Button
                  size="lg"
                  className="btn-primary w-[288px] h-[56px] rounded-[100px] bg-[#00BB7DD1] text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  data-testid="button-browse-restaurants"
                >
                  <span className="block pt-[3px] w-[196px] h-[20px] font-['Inter'] font-medium text-[16.5px] leading-[100%] tracking-[0] uppercase text-[#F1F1F1]">
                    Browse Restaurants
                  </span>
                  <img src="/BrowseIcon.png" alt="" className="ml-0 pt-[2px] w-5 h-5 object-contain" />

                </Button>
              </Link>
              <Button
                // variant="outline"
                size="lg"
                className="text-lg w-[215px] h-[56px] rounded-[100px] pt-[18px] pr-[32px] pl-[32px] pb-[18px] bg-[#CDCDCD4D] hover:scale-105 border-[#CDCDCD4D] hover:text-white transition-all duration-300"
                onClick={() => document.getElementById('featured-restaurants')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-see-featured"
              >
                <span className="block pt-[3px] w-[121px] h-[20px] font-['Inter'] font-medium text-[16.5px] leading-[100%] tracking-[0] uppercase text-[#F1F1F1]">
                  See Featured
                </span>
                <img src="assets/FeatureIcon.png" alt="" className="ml-0 pt-[2px] w-5 h-5 object-contain" />
              </Button>
            </div>

            {/* Delivery Options */}
            <div className="flex justify-center items-center space-x-8 mb-12">
              {/* <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="pt-6 pb-6 px-10">
                  <div className="text-sm text-primary font-semibold mb-1">🚚 Delivery</div>
                  <div className="font-bold text-black text-lg">ASAP (25-40 min)</div>
                </CardContent>
              </Card>
              <div className="w-4 h-4 bg-primary rounded-full opacity-30"></div>
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="pt-6 pb-6 px-10">
                  <div className="text-sm text-secondary font-semibold mb-1">🏃 Pickup</div>
                  <div className="font-bold text-black text-lg">ASAP (15-20 min)</div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Promotions */}
      {promotions.length > 0 && (
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white mb-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center">
                    <Gift className="mr-2" />
                    Special Offers
                  </h3>
                  <p className="text-red-100">Limited time deals from your favorite restaurants</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {promotions.slice(0, 3).map((promo: Promotion) => (
                <Card key={promo.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-r from-orange-400 to-red-500 rounded-t-xl flex items-center justify-center">
                    <div className="text-white text-6xl">🎉</div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="destructive">{promo.discountType.toUpperCase()}</Badge>
                      <span className="text-primary font-bold">
                        {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue}`}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{promo.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{promo.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Restaurants */}
      <section id="featured-restaurants" className="py-12 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl pt-[30px] font-bold mb-4">Featured Restaurants</h2>
            <p className="text-gray-600 mb-6">Discover amazing local flavors</p>
            {/* <Link href="/restaurants">
              <Button
                variant="outline"
                className="hover:bg-primary hover:text-white transition-all mb-8"
                data-testid="button-browse-all-featured"
              >
                Browse All Restaurants
              </Button>
            </Link> */}
          </div>

          {/* Waiter Image */}
          <div className="flex justify-center mb-8 ">
            <img 
              src="/assets/Waiter.png" 
              alt="Waiter" 
              className="object-contain ml-[-1450px] mt-[-190px]"
              style={{
                width: '674px',
                height: '486.7386779785156px',
                opacity: 1,
                // border: '2px solid #00231F1A',
                transform: 'rotate(0deg)'
              }}
            />
          </div>

          <div className="flex justify-center mb-8 ">
            <img
              src="/assets/glasses.png"
              alt="Glass"
              className="object-contain ml-[-1000px] mt-[-155px] ml-[1240px]"
              style={{
                width: '747px',
                height: '567px',
                opacity: 1,
                transform: 'rotate(0deg)'
              }}
            />
          </div>

          {restaurantsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-80"></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 ml-[50px] mt-[-695px]">
              
              {featuredRestaurants.map((restaurant: Restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onAddToCart={(item) => setCartItems(prev => [...prev, item])}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12 ml-[500px]">
            <Link href="/restaurants">
              <Button
                size="lg"
                className="w-[275px] h-[56px] bg-[#00231F] uppercase rounded-[100px] pt-[18px] pr-[28px] pl-[28px] pb-[18px] hover:bg-primary/90 text-[16.5px] text-white  shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-between"
                data-testid="button-view-all-bottom"
              >
                <span>View All Restaurants</span>
                <img src="/assets/Icon.png" alt="Arrow Right" className="w-[20px] h-[20px]  object-contain -mt-[2px]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section 
        className="w-[1150px] h-[355px] rounded-[24px] ml-[398px] py-16 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #00D08C 48.31%, #005237 170.56%)' }}
      >
        <img 
          src="/assets/ReadyToOrder.png" 
          alt="Ready to Order" 
          className="absolute left-0 top-0 h-full object-contain"
        />
        <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-[60px] font-['Helixa'] font-black text-[#F8F8F8] mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl mb-8 opacity-90"> 
            Join thousands of satisfied customers. Get your favorite food delivered in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/restaurants">
              <Button
                size="lg"
                variant="secondary"
                className="bg-[#00231FD1] w-[233px] h-[56px]  uppercase rounded-[100px] pt-[18px] pr-[32px] pl-[28px] pb-[18px] gap-10 text-[#00D992] hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold shadow-xl"
                data-testid="button-start-ordering"

              >
                <span className="text-[16.5px] ml-[8px]  text-[#00D992]">Start Ordering</span>
                <img src="/assets/StartOrderingIcon.png" alt="Arrow Right" className="w-[20px] h-[20px] -ml-[30px]  object-contain -mt-[2px]" />
              </Button>
            </Link>
            <Button
              size="lg"
              className="w-[215px] h-[55px] rounded-[100px] border-[1.03px] border-[#FFFFFF] bg-transparent text-white hover:scale-105 uppercase px-8 py-4 text-lg font-semibold transition-all duration-200"
              onClick={() => document.getElementById('featured-restaurants')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-browse-featured"
            >
                See Featured
                <img src="/assets/FeatureIcon.png" alt="Arrow Right" className="w-[20px] h-[20px] ml-[2px]  object-contain -mt-[2px]" />

            </Button>

          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="w-[1905px] h-[636px] py-16 bg-gray-900 text-white mt-[70px]  bg-[#014538]">
      {/* <img src="/assets/AppMap.png" alt="Arrow Right" className="" /> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="grid md:grid-cols-2 gap-12 pl-11 items-center ">
            <div>
              <h2 className="text-4xl font-bold mb-4">Get the West Row Kitchen App</h2>
              <p className="text-xl mb-6 text-white/90">Order faster, track your delivery, and get exclusive app-only deals</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="mr-3" />
                  <span>Real-time order tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3" />
                  <span>Exclusive app promotions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3" />
                  <span>Faster checkout with saved preferences</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3" />
                  <span>Push notifications for order updates</span>
                </li>
              </ul>





              <h1 className="text-3xl font-bold pb-6" >Download App From</h1>

              <div className="flex space-x-4 ">

              <Button className="w-[227px] h-[78px] rounded-[11.31px] bg-black bg-[#00D9921A] border-[1px] border-[#FFFFFF] text-white px-6 py-3  hover:scale-105 transition-colors">
              <div className="flex items-center space-x-2">
                    <Smartphone />
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="font-semibold">Google Play</div>
                    </div>
                  </div>
                </Button>




                <Button className="w-[227px] h-[78px] rounded-[11.31px] bg-black bg-[#00D9921A] border-[1px] border-[#FFFFFF] text-white px-6 py-3  hover:scale-105 transition-colors">
                  <div className="flex items-center space-x-2 ">
                    <Smartphone />
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="font-semibold">App Store</div>
                    </div>
                  </div>
                </Button>
             
              </div>
            </div>
            <div className="text-center">
              <div className="max-w-sm mx-auto bg-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <Smartphone className="w-32 h-32 mx-auto text-white/80" />
                <p className="text-white/80 mt-4">Mobile App Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => {
          setCartItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
          ));
        }}
        onRemoveItem={(id) => {
          setCartItems(prev => prev.filter(item => item.id !== id));
        }}
      />
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, DollarSign } from "lucide-react";
import { Link } from "wouter";
import type { Restaurant } from "@shared/schema";
import { createSlug } from "@/utils/slug";
import { useRestaurantStatus } from "@/hooks/useRestaurantStatus";
import {
  isRestaurantOpen,
  getNextOpeningTime,
  type OperatingHours,
} from "@/utils/restaurant-hours";

// Import restaurant logos
import MyLaiLogo from "@assets/My Lai Kitchen Logo_1755170145363.png";
import PappisPizzaLogo from "@assets/Pappi's Pizza Logo_1755170145362.png";
import CheekysBurgersLogo from "@assets/Cheeky's Burgers Logo_1755170145363.png";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onAddToCart?: (item: any) => void;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  // Restaurant logo mapping
  const logoMap: Record<string, string> = {
    "My Lai Kitchen": MyLaiLogo,
    "Pappi's Pizza": PappisPizzaLogo,
    "Cheeky's Burgers": CheekysBurgersLogo,
  };

  const getDefaultImage = () => {
    // Use logoMap first, then fallback to external image
    return (
      logoMap[restaurant.name] ||
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
    );
  };

  // Use real-time restaurant status hook - handle cases where restaurant data might be incomplete
  const restaurantStatus = useRestaurantStatus(restaurant);
  const isCurrentlyOpen = restaurantStatus.isOpen;

  return (
    <Link href={`/restaurant/${createSlug(restaurant.name)}`}>
      <Card className="restaurant-card  w-[354px] h-[370px] rounded-[20px] p-[14px]  overflow-hidden border-0 cursor-pointer hover:shadow-xl hover:scale-[1.0.8] transition-all duration-300">
        <div className="relative bg-white">
          <div className="w-full h-48 flex items-center justify-center bg-[#F7F7F7] ">
            <img
              src={
                restaurant.image
                  ? restaurant.image.startsWith("/assets/") ||
                    restaurant.image.startsWith("http")
                    ? restaurant.image
                    : `/assets/${restaurant.image}`
                  : getDefaultImage()
              }
              alt={restaurant.name}
              className="w-full h-full rounded-[15px] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultImage();
              }}
            />
          </div>
          {/* <div className="absolute top-4 right-4">
            <Badge
              variant={isCurrentlyOpen ? "default" : "destructive"}
              className={
                isCurrentlyOpen
                  ? "bg-primary hover:bg-primary/90 text-white shadow-md"
                  : ""
              }
            >
              {isCurrentlyOpen ? "OPEN" : "CLOSED"}
            </Badge>
          </div> */}
        </div>

        <CardContent className="p-6 -ml-[25px] -mr-[25px] flex flex-col justify-between">
          {/* Top Section */}
          <div className="flex flex-col flex-grow overflow-hidden">
            {/* Title + Rating */}
            <div className="flex items-center justify-between mb-2 gap-2">
              <h3 className="text-[24px] font-bold text-black truncate flex-shrink">
                {restaurant.name}
              </h3>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold">{restaurant.rating}</span>
                <span className="text-gray-500 text-sm">
                  ({restaurant.reviewCount}+)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-gray-500">
              {/* Cuisine (left) */}
              <p className="text-sm truncate max-w-[50%] font-bold text-black">
                {restaurant.cuisine}
              </p>

              {/* Description (right) */}
              {restaurant.description && (
                <p className="text-xs truncate max-w-[70%] text-right w-[215px] h-[20px]">
                  {restaurant.description}
                </p>
              )}
            </div>


            {/* Info Row */}
            <div className="flex items-center justify-between text-sm text-gray-500 mt-[10px]">
              <div className="flex items-center space-x-4">
                {/* <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{restaurant.deliveryTime || "25-35 min"}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>${restaurant.deliveryFee || "2.99"}</span>
                </div> */}
              </div>
            </div>

            {/* Minimum Order */}
     
          </div>

          {/* CTA Button (Bottom Fixed) */}
          <div className="mt-[10px]">
            <Button
              className="w-[326px] h-[47px] bg-[#E8E8E8] rounded-[40px]  text-white font-medium pt-[8px] pb-[8px] pl-[12px] pr-[12px] opacity-1 flex items-center justify-between" 
              size="sm"
              data-testid={`button-order-now-${restaurant.name
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              <span className="text-black text-sm font-bold">Order Now</span>
              <img src="/assets/ResBag.png" alt="Bag Icon" className="w-[32px] h-[31px] object-contain " />
            </Button>
          </div>  
        </CardContent>
      </Card>
    </Link>
  );
}

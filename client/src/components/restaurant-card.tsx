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
      <Card className="restaurant-card bg-white rounded-2xl shadow-lg overflow-hidden border-0 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
        <div className="relative bg-white">
          <div className="w-full h-48 flex items-center  justify-center bg-gray-50">
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
              className="w-full h-full object-contain "
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultImage();
              }}
            />
          </div>
          <div className="absolute top-4 right-4">
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
          </div>
        </div>

        <CardContent className="p-6 flex flex-col h-72 justify-between">
          {/* Top Section */}
          <div className="flex flex-col flex-grow overflow-hidden">
            {/* Title + Rating */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold font-playfair text-black">
                {restaurant.name}
              </h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold">{restaurant.rating}</span>
                <span className="text-gray-500 text-sm">
                  ({restaurant.reviewCount}+)
                </span>
              </div>
            </div>

            {/* Cuisine */}
            <p className="text-gray-500 text-sm mb-1 truncate">
              {restaurant.cuisine}
            </p>

            {/* Description */}
            {restaurant.description && (
              <p className="text-gray-500 text-xs mb-3 line-clamp-2 overflow-hidden">
                {restaurant.description}
              </p>
            )}

            {/* Info Row */}
            <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{restaurant.deliveryTime || "25-35 min"}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>${restaurant.deliveryFee || "2.99"}</span>
                </div>
              </div>
            </div>

            {/* Minimum Order */}
            {restaurant.minimumOrder && (
              <div className="mt-2 text-xs text-gray-500">
                Min. order: ${restaurant.minimumOrder}
              </div>
            )}
          </div>

          {/* CTA Button (Bottom Fixed) */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
              size="sm"
              data-testid={`button-order-now-${restaurant.name
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              Order Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

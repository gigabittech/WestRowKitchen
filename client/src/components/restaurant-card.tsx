import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, DollarSign } from "lucide-react";
import { Link } from "wouter";
import type { Restaurant } from "@shared/schema";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onAddToCart?: (item: any) => void;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const getRandomImage = () => {
    const restaurantImages = [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
    ];
    return restaurantImages[Math.floor(Math.random() * restaurantImages.length)];
  };

  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="restaurant-card bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-300">
        <div className="relative">
          <img 
            src={restaurant.image || getRandomImage()} 
            alt={restaurant.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getRandomImage();
            }}
          />
          <div className="absolute top-4 right-4">
            <Badge 
              variant={restaurant.isOpen ? "default" : "destructive"}
              className={restaurant.isOpen ? "bg-accent text-white" : ""}
            >
              {restaurant.isOpen ? "OPEN" : "CLOSED"}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold font-playfair text-secondary">{restaurant.name}</h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-semibold">{restaurant.rating}</span>
              <span className="text-gray-500 text-sm">({restaurant.reviewCount}+)</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{restaurant.cuisine}</p>
          
          {restaurant.description && (
            <p className="text-gray-500 text-xs mb-3 line-clamp-2">{restaurant.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
          
          {restaurant.minimumOrder && (
            <div className="mt-2 text-xs text-gray-500">
              Min. order: ${restaurant.minimumOrder}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

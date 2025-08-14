import { useState } from "react";
import { MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface LocationPickerProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
}

const popularLocations = [
  "123 West Row St, Los Angeles, CA",
  "456 Downtown Ave, Los Angeles, CA", 
  "789 Beverly Hills Blvd, Beverly Hills, CA",
  "101 Santa Monica Pier, Santa Monica, CA",
  "202 Hollywood Blvd, Hollywood, CA",
  "303 Venice Beach Rd, Venice, CA"
];

export default function LocationPicker({ currentLocation, onLocationChange }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customLocation, setCustomLocation] = useState("");

  const handleLocationSelect = (location: string) => {
    onLocationChange(location);
    setIsOpen(false);
  };

  const handleCustomLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLocation.trim()) {
      onLocationChange(customLocation.trim());
      setCustomLocation("");
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="hidden md:flex items-center bg-neutral rounded-lg px-4 py-2 border border-gray-200 hover:bg-gray-50 max-w-xs"
        >
          <MapPin className="text-primary mr-2 w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{currentLocation}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <h4 className="font-semibold mb-3">Choose delivery location</h4>
          
          {/* Custom location input */}
          <form onSubmit={handleCustomLocationSubmit} className="mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter your address..."
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Set
              </Button>
            </div>
          </form>
          
          {/* Popular locations */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Popular locations:</p>
            <div className="space-y-1">
              {popularLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center justify-between text-sm"
                >
                  <span className="truncate">{location}</span>
                  {location === currentLocation && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
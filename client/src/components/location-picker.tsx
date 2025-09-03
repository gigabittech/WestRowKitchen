import { useState, useEffect } from "react";
import { MapPin, Check, Crosshair, Clock } from "lucide-react";
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
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);

  // Load recent locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wrk_recent_locations');
    if (saved) {
      try {
        setRecentLocations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent locations:', e);
      }
    }
  }, []);

  const handleLocationSelect = (location: string) => {
    onLocationChange(location);
    saveToRecentLocations(location);
    setIsOpen(false);
  };

  const saveToRecentLocations = (location: string) => {
    const updated = [location, ...recentLocations.filter(l => l !== location)].slice(0, 3);
    setRecentLocations(updated);
    localStorage.setItem('wrk_recent_locations', JSON.stringify(updated));
  };

  const detectCurrentLocation = () => {
    setIsDetectingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // In a real app, you'd use a geocoding service here
          // For now, we'll use a simulated address
          const detectedLocation = `Detected: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          handleLocationSelect(detectedLocation);
        } catch (error) {
          console.error('Geocoding failed:', error);
          alert('Failed to get address for your location');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to detect your location. Please enter manually.');
        setIsDetectingLocation(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 300000 
      }
    );
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
          className="hidden md:flex items-center bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors max-w-xs group"
        >
          <MapPin className="text-green-600 mr-2 w-4 h-4 flex-shrink-0 group-hover:text-green-700" />
          <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">{currentLocation}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <h4 className="font-semibold mb-3">Choose delivery location</h4>
          
          {/* GPS Detection Button */}
          <Button
            onClick={detectCurrentLocation}
            disabled={isDetectingLocation}
            variant="outline"
            className="w-full mb-3 flex items-center justify-center"
            data-testid="button-detect-location"
          >
            <Crosshair className="w-4 h-4 mr-2" />
            {isDetectingLocation ? 'Detecting...' : 'Use current location'}
          </Button>
          
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
          
          {/* Recent locations */}
          {recentLocations.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Recent locations:
              </p>
              <div className="space-y-1">
                {recentLocations.map((location, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center justify-between text-sm"
                    data-testid={`button-recent-location-${index}`}
                  >
                    <span className="truncate">{location}</span>
                    {location === currentLocation && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Popular locations */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Popular locations:</p>
            <div className="space-y-1">
              {popularLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center justify-between text-sm"
                  data-testid={`button-popular-location-${location.split(',')[0].replace(/\s+/g, '-').toLowerCase()}`}
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
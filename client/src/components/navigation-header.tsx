import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LocationPicker from "@/components/location-picker";
import SearchDropdown from "@/components/search-dropdown";
import { 
  MapPin, 
  Search, 
  ShoppingCart, 
  User, 
  Menu,
  Utensils,
  LogOut,
  Settings,
  Package
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CartIcon from "@/components/cart-icon";

export default function NavigationHeader() {
  const { user, isAuthenticated } = useAuth();
  const { location, updateLocation } = useLocation();
  const { searchQuery, setSearchQuery, performSearch } = useSearch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="text-2xl font-bold text-black flex items-center">
                <Utensils className="mr-2" />
                <span className="hidden sm:inline">West Row Kitchen</span>
                <span className="sm:hidden">WRK</span>
              </div>
            </div>
          </Link>
          
          {/* Location Selector */}
          <LocationPicker 
            currentLocation={location}
            onLocationChange={updateLocation}
          />
          
          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input 
                type="text" 
                placeholder="Search restaurants, cuisines, or dishes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchDropdownOpen(true)}
                className="w-full pl-10 pr-4 py-2"
                data-testid="input-search-desktop"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              
              <SearchDropdown
                query={searchQuery}
                isVisible={isSearchDropdownOpen}
                onClose={() => setIsSearchDropdownOpen(false)}
                onItemClick={() => {
                  setIsSearchDropdownOpen(false);
                  setSearchQuery("");
                }}
              />
            </div>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <CartIcon />
            
            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline">{user?.firstName || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      fetch('/api/logout', { method: 'POST', credentials: 'include' })
                        .then(() => window.location.href = '/');
                    }}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="btn-primary"
              >
                Sign In
              </Button>
            )}
            
            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search restaurants..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchDropdownOpen(true)}
              className="w-full pl-10 pr-4"
              data-testid="input-search-mobile"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            
            <SearchDropdown
              query={searchQuery}
              isVisible={isSearchDropdownOpen}
              onClose={() => setIsSearchDropdownOpen(false)}
              onItemClick={() => {
                setIsSearchDropdownOpen(false);
                setSearchQuery("");
                setIsMobileMenuOpen(false);
              }}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <div className="flex items-center px-4 py-2 text-sm">
                <MapPin className="text-primary mr-2 w-4 h-4" />
                <span className="truncate">{location}</span>
              </div>
              {isAuthenticated && user && (
                <>
                  <Link href="/orders">
                    <div className="flex items-center px-4 py-2 text-sm hover:bg-gray-50">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </div>
                  </Link>
                  {user?.isAdmin && (
                    <Link href="/admin">
                      <div className="flex items-center px-4 py-2 text-sm hover:bg-gray-50">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </div>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

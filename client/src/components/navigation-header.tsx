import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

interface NavigationHeaderProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartItemCount: number;
  onSearch?: (query: string) => void;
}

export default function NavigationHeader({ 
  isCartOpen, 
  setIsCartOpen, 
  cartItemCount,
  onSearch 
}: NavigationHeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="text-2xl font-bold text-primary flex items-center">
                <Utensils className="mr-2" />
                <span className="hidden sm:inline">West Row Kitchen</span>
                <span className="sm:hidden">WRK</span>
              </div>
            </div>
          </Link>
          
          {/* Location Selector */}
          <div className="hidden md:flex items-center bg-neutral rounded-lg px-4 py-2 border border-gray-200">
            <MapPin className="text-primary mr-2 w-4 h-4" />
            <span className="text-sm font-medium">123 West Row St, Los Angeles, CA</span>
          </div>
          
          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input 
                type="text" 
                placeholder="Search restaurants, cuisines, or dishes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </form>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            
            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline">{(user as any)?.firstName || 'Account'}</span>
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
                  {(user as any)?.isAdmin && (
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
          <form onSubmit={handleSearch} className="relative">
            <Input 
              type="text" 
              placeholder="Search restaurants..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <div className="flex items-center px-4 py-2 text-sm">
                <MapPin className="text-primary mr-2 w-4 h-4" />
                <span>123 West Row St, LA</span>
              </div>
              {isAuthenticated && user && (
                <>
                  <Link href="/orders">
                    <div className="flex items-center px-4 py-2 text-sm hover:bg-gray-50">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </div>
                  </Link>
                  {(user as any)?.isAdmin && (
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

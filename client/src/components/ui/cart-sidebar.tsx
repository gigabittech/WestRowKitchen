import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Minus, ShoppingBag, Clock } from "lucide-react";
import { Link } from "wouter";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantName?: string;
  image?: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function CartSidebar({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem 
}: CartSidebarProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const serviceFee = subtotal * 0.05;
  const tax = (subtotal + deliveryFee + serviceFee) * 0.0875;
  const total = subtotal + deliveryFee + serviceFee + tax;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`cart-sidebar fixed top-0 right-0 w-full md:w-96 h-full bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ${isOpen ? 'open' : ''}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Your Order
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Your cart is empty</h4>
              <p className="text-gray-600 mb-6">Add items from restaurants to get started</p>
              <Link href="/restaurants">
                <Button onClick={onClose} className="btn-primary" data-testid="button-browse-restaurants">
                  Browse Restaurants
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🍽️</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      {item.restaurantName && (
                        <p className="text-sm text-gray-600">{item.restaurantName}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 rounded-full p-0"
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 rounded-full p-0"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 text-xs p-0 h-auto"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="space-y-3 mb-6 p-4 bg-neutral rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Link href="/checkout">
                <Button 
                  className="w-full btn-primary py-4 text-lg font-semibold mb-4"
                  onClick={onClose}
                >
                  Proceed to Checkout
                </Button>
              </Link>
              
              <div className="text-center text-sm text-gray-500 flex items-center justify-center">
                <Clock className="w-4 h-4 mr-1" />
                Estimated delivery: 25-35 minutes
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

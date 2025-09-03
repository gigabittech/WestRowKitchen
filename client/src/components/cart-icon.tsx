import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";

interface CartIconProps {
  className?: string;
}

export default function CartIcon({ className }: CartIconProps) {
  const { cartItemCount, setIsCartOpen } = useCart();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative ${className}`}
      onClick={() => setIsCartOpen(true)}
      data-testid="button-cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {cartItemCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-white"
        >
          {cartItemCount > 99 ? '99+' : cartItemCount}
        </Badge>
      )}
    </Button>
  );
}
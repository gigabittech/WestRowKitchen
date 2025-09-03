import { useCart } from "@/contexts/CartContext";
import CartSidebar from "@/components/ui/cart-sidebar";

export default function UniversalCartSidebar() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();

  return (
    <CartSidebar
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      items={cartItems}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeFromCart}
    />
  );
}
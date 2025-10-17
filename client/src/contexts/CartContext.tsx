import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { MenuItem } from '@shared/schema';
import { getFoodImage } from '@/utils/food-images';
import { v4 as uuidv4 } from "uuid";


export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName?: string;
  image?: string;
  menu_item_id: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem, restaurantName?: string, selectedPrices?: Record<string, number>  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'west-row-kitchen-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          // Restore images for items loaded from localStorage
          const cartWithImages = parsedCart.map(item => ({
            ...item,
            image: item.image 
          }));
          setCartItems(cartWithImages);
        }
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [cartItems, isInitialized]);



  const uniqueId = uuidv4();

  const addToCart = (item: MenuItem, restaurantName?: string ,selectedPrices?: Record<string, number> ) => {
    const foodImage = getFoodImage(item.name);
    const cartItem: CartItem = {
      id:  uuidv4(),
      menu_item_id: item.id,
      name: item.name,
      price: selectedPrices ? parseFloat(selectedPrices?.toString()): parseFloat(item.price.toString()) ,
      quantity: 1,
      restaurantId: item.restaurantId,
      restaurantName,
      image: foodImage || item.image || undefined,
    };

    // console.log('Adding to cart:', cartItem);

    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { 
            ...i, 
            quantity: i.quantity + 1,
            image: i.image || foodImage || undefined  // Ensure image is preserved/updated
          } : i
        );
      }
      return [...prev, cartItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
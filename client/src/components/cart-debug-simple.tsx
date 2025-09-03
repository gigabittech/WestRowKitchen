import { useCart } from "@/contexts/CartContext";

export default function CartDebugSimple() {
  const { cartItems, cartItemCount } = useCart();
  
  return (
    <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-300 p-3 rounded-lg shadow-lg z-50 max-w-xs">
      <h4 className="font-bold text-blue-800">Cart Debug</h4>
      <p className="text-sm">Count: {cartItemCount}</p>
      <p className="text-sm">Items: {cartItems.length}</p>
      <div className="mt-1 max-h-20 overflow-y-auto">
        {cartItems.map((item, i) => (
          <div key={i} className="text-xs flex items-center space-x-1">
            <span>{item.name.substring(0, 12)}...</span>
            <span>Qty: {item.quantity}</span>
            {item.image ? <span className="text-green-600">🖼️</span> : <span className="text-red-600">❌</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
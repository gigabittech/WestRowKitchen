import { useCart } from "@/hooks/useCart";

export default function CartDebug() {
  const { cartItems, cartItemCount, cartTotal } = useCart();
  
  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 p-4 rounded-lg shadow-lg z-50">
      <h3 className="font-bold text-red-800">Cart Debug</h3>
      <p>Items Count: {cartItemCount}</p>
      <p>Total: ${cartTotal.toFixed(2)}</p>
      <p>Items Array Length: {cartItems.length}</p>
      <div className="mt-2">
        <p className="text-sm font-semibold">Items:</p>
        {cartItems.map((item, index) => (
          <div key={index} className="text-xs">
            {item.name} - Qty: {item.quantity} - ${item.price}
          </div>
        ))}
      </div>
      <div className="mt-2">
        <p className="text-xs">LocalStorage Key: west-row-kitchen-cart</p>
        <p className="text-xs">
          LocalStorage Data: {localStorage.getItem('west-row-kitchen-cart')?.substring(0, 50)}...
        </p>
      </div>
    </div>
  );
}
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import api from "../services/api";

const Cart = ({ tableId }) => {
  const { cart, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = cart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  const placeOrder = async () => {
    try {
      setLoading(true);
      await api.post("/orders", {
        tableNumber: tableId,
        items: cart.map(i => ({
          menuId: i._id,
          qty: i.qty
        }))
      });
      setSuccess(true);
      clearCart();
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-green-600 text-white p-4 text-center">
        ✅ Order placed successfully!
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-xl">
      <div className="flex justify-between text-sm mb-2">
        <span>{cart.length} items</span>
        <span className="font-semibold">₹{total}</span>
      </div>

      <button
        onClick={placeOrder}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded-lg"
      >
        {loading ? "Placing order..." : "Place Order"}
      </button>
    </div>
  );
};

export default Cart;
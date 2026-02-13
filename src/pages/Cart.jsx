import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, addToCart, decreaseQty, total } = useContext(CartContext);
  const navigate = useNavigate();
  if (cart.length === 0) {
    return (
      <div className="p-6 text-center bg-white rounded shadow flex flex-col items-center gap-4 max-w-md mx-auto mt-20">
        <h2 className="text-2xl font-bold mb-4 text-[#EF4F5F]">Your Cart is Empty</h2>
        
        <Link
          to="menu"
          className="mt-4 inline-block bg-[#EF4F5F] text-white py-2 px-6 rounded-lg"
        >
          Browse Menu
      </Link>
    </div>
    );
  }
  const placeOrderHandler = async () => {
    const tableNumber = localStorage.getItem("tableNumber");
    const name = localStorage.getItem("customerName");

    if (!tableNumber) {
      alert("❌ Table not detected. Scan QR again.");
      return;
    }

    const orderData = {
      tableNumber: Number(tableNumber),
      customerName: name || "Guest",
      items: cart.map((item) => ({
        menuId: item._id,
        qty: item.qty,
      })),
    };

    const res = await fetch(`${import.meta.env.VITE_API_URL}api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    navigate(`/order/${data._id}`);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#EF4F5F]">
        Your Order
      </h2>

      {cart.map((item) => (
        <div
          key={item._id}
          className="flex justify-between items-center mb-4 mt-4 p-4 rounded shadow"
        >
          <div>
            <img
              src={item.image || "https://via.placeholder.com/300"}
              alt={item.name}
              className="w-32 h-28 object-cover rounded"
            />
            <h3 className="font-semibold ">{item.name}</h3>
            <p className="text-sm text-gray-500">
              ₹{item.price} × {item.qty}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => decreaseQty(item._id)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              −
            </button>
            <span>{item.qty}</span>
            <button
              onClick={() => addToCart(item)}
              className="px-3 py-1 bg-black text-white rounded"
            >
              +
            </button>
          </div>
        </div>
      ))}

      <div className="mt-6 border-t pt-4">
        <h3 className="text-xl font-bold">Total: ₹{total}</h3>

        <button
          onClick={placeOrderHandler}
          className="mt-4 w-full bg-[#EF4F5F] text-white py-2 rounded-xl text-lg"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Cart;

import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

// --- RESTAURANT CONFIGURATION (Arrah, Bihar) ---
const RESTAURANT_COORDS = {
  lat: 25.559080895405874,    
  lng: 84.66458716857322,
};
const MAX_DISTANCE_METERS = 100; // Allowed radius around the restaurant

const Cart = () => {
  const { cart, addToCart, decreaseQty, total } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState("Dining"); // New: Dining or Delivery
  const [deliveryDetails, setDeliveryDetails] = useState({ address: "", phone: "" });
  const navigate = useNavigate();

  // --- HAVERSINE DISTANCE CALCULATOR ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const deltaP = ((lat2 - lat1) * Math.PI) / 180;
    const deltaL = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(deltaL / 2) * Math.sin(deltaL / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Returns distance in meters
  };

  const submitOrder = async () => {
    const tableNumber = localStorage.getItem("tableNumber");
    const name = localStorage.getItem("customerName");

    try {
      const orderData = {
        orderType,
        tableNumber: orderType === "Dining" ? Number(tableNumber) : null,
        customerName: name || "Guest",
        address: orderType === "Delivery" ? deliveryDetails.address : "Dine-in",
        phone: orderType === "Delivery" ? deliveryDetails.phone : "N/A",
        items: cart.map((item) => ({
          menuId: item._id,
          qty: item.qty,
        })),
        totalAmount: total,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        navigate(`/order/${data._id}`);
      } else {
        alert("Order failed at the server. Try again.");
        setLoading(false);
      }
    } catch (err) {
      alert("Network error. Please check your internet.");
      setLoading(false);
    }
  };

  const placeOrderHandler = async () => {
    const tableNumber = localStorage.getItem("tableNumber");

    if (orderType === "Dining" && !tableNumber) {
      alert("❌ Table not detected. Please scan the QR code again.");
      return;
    }

    if (orderType === "Delivery" && (!deliveryDetails.address || !deliveryDetails.phone)) {
      alert("❌ Please enter your address and phone number for delivery.");
      return;
    }

    setLoading(true);

    // If Delivery, skip GPS check and submit
    if (orderType === "Delivery") {
      await submitOrder();
      return;
    }

    // If Dining, perform Geofencing check
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(
          latitude, 
          longitude, 
          RESTAURANT_COORDS.lat, 
          RESTAURANT_COORDS.lng
        );

        if (distance > MAX_DISTANCE_METERS) {
          alert(`⛔ Out of Range: You are ${Math.round(distance)}m away. Please order from inside the restaurant.`);
          setLoading(false);
          return;
        }

        await submitOrder();
      },
      (error) => {
        setLoading(false);
        alert("Location access is required for Dine-in orders. Please enable GPS.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (cart.length === 0) {
    return (
      <div className="p-6 text-center mt-20">
        <h2 className="text-2xl font-bold text-[#EF4F5F]">Cart is Empty</h2>
        <Link to="/menu" className="mt-4 inline-block bg-[#EF4F5F] text-white py-2 px-6 rounded-lg">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto pb-20">
      <h2 className="text-2xl font-black text-center text-gray-800 mb-6 uppercase tracking-tight">Your Order</h2>
      
      {/* --- ORDER TYPE TOGGLE --- */}
      <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
        <button 
          onClick={() => setOrderType("Dining")}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${orderType === "Dining" ? "bg-white shadow-sm text-[#EF4F5F]" : "text-gray-500"}`}
        >
          🍽️ Dine-in
        </button>
        <button 
          onClick={() => setOrderType("Delivery")}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${orderType === "Delivery" ? "bg-white shadow-sm text-[#EF4F5F]" : "text-gray-500"}`}
        >
          🛵 Delivery
        </button>
      </div>

      {/* --- DELIVERY FORM --- */}
      {orderType === "Delivery" && (
        <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <input 
            type="text" 
            placeholder="Full Delivery Address" 
            className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#EF4F5F] shadow-sm"
            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#EF4F5F] shadow-sm"
            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
          />
        </div>
      )}

      {/* Items Mapping */}
      {cart.map((item) => (
        <div key={item._id} className="flex justify-between items-center mb-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <img src={item.image || "https://via.placeholder.com/300"} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
            <div>
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <p className="text-sm text-[#EF4F5F] font-bold">₹{item.price} × {item.qty}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => decreaseQty(item._id)} className="w-8 h-8 bg-gray-100 rounded-lg font-bold">−</button>
            <span className="font-bold">{item.qty}</span>
            <button onClick={() => addToCart(item)} className="w-8 h-8 bg-black text-white rounded-lg font-bold">+</button>
          </div>
        </div>
      ))}

      {/* Checkout Section */}
      <div className="mt-8 bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-400 font-bold uppercase text-xs">Grand Total</span>
          <span className="text-2xl font-black text-gray-900">₹{total}</span>
        </div>

        <button
          onClick={placeOrderHandler}
          disabled={loading}
          className={`w-full py-4 rounded-2xl text-lg font-black transition-all flex justify-center items-center gap-3 ${
            loading ? "bg-gray-300" : "bg-[#EF4F5F] text-white shadow-lg shadow-red-200"
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {orderType === "Dining" ? "Verifying Location..." : "Placing Order..."}
            </>
          ) : (
            "Place Order"
          )}
        </button>
      </div>
    </div>
  );
};

export default Cart;
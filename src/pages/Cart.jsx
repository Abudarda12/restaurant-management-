import { useContext, useState, useMemo } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

// --- CONFIGURATION ---
const RESTAURANT_COORDS = { lat: 25.559080895405874, lng: 84.66458716857322 };
const MAX_DISTANCE_METERS = 100;
const DELIVERY_FEE = 20; // Flat fee for delivery

const Cart = () => {
  const { cart, addToCart, decreaseQty, total } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [orderType, setOrderType] = useState("Dining"); 
  const [deliveryDetails, setDeliveryDetails] = useState({ address: "", phone: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // --- DYNAMIC TOTAL CALCULATION ---
  const finalTotal = useMemo(() => {
    return orderType === "Delivery" ? total + DELIVERY_FEE : total;
  }, [total, orderType]);

  const validateForm = () => {
    let newErrors = {};
    if (orderType === "Delivery") {
      if (!deliveryDetails.address.trim()) newErrors.address = "Address is required";
      else if (deliveryDetails.address.length < 10) newErrors.address = "Address is too short";
      
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!deliveryDetails.phone) newErrors.phone = "Phone is required";
      else if (!phoneRegex.test(deliveryDetails.phone)) newErrors.phone = "Invalid 10-digit number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const detectAddress = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data?.display_name) {
            setDeliveryDetails((prev) => ({ ...prev, address: data.display_name }));
            setErrors((prev) => ({ ...prev, address: null }));
          }
        } catch (err) { alert("Auto-detect failed."); } 
        finally { setDetecting(false); }
      },
      () => { setDetecting(false); alert("Access denied."); }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const deltaP = ((lat2 - lat1) * Math.PI) / 180;
    const deltaL = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(deltaL / 2) * Math.sin(deltaL / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
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
        items: cart.map((item) => ({ menuId: item._id, qty: item.qty })),
        totalAmount: finalTotal, // Use the dynamic total including fee
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
        alert("Server error. Try again.");
        setLoading(false);
      }
    } catch (err) { alert("Network error."); setLoading(false); }
  };

  const placeOrderHandler = async () => {
    if (orderType === "Dining" && !localStorage.getItem("tableNumber")) return alert("❌ Scan QR first.");
    if (!validateForm()) return;

    setLoading(true);
    if (orderType === "Delivery") { await submitOrder(); return; }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lng);
        if (dist > MAX_DISTANCE_METERS) { alert("⛔ Out of Range."); setLoading(false); return; }
        await submitOrder();
      },
      () => { setLoading(false); alert("GPS required."); },
      { enableHighAccuracy: true }
    );
  };

  if (cart.length === 0) return <div className="p-10 text-center"><h2 className="text-xl font-bold text-red-500">Cart is Empty</h2><Link to="/menu" className="text-blue-500 underline">Back to Menu</Link></div>;

  return (
    <div className="p-4 max-w-xl mx-auto pb-24 font-sans bg-gray-50 min-h-screen">
      <h2 className="text-xl font-black mb-6 text-center uppercase">Checkout</h2>
      
      {/* TOGGLE */}
      <div className="flex bg-white p-1 rounded-2xl mb-6 shadow-sm border">
        <button onClick={() => setOrderType("Dining")} className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${orderType === "Dining" ? "bg-black text-white" : "text-gray-400"}`}>🍽️ DINE-IN</button>
        <button onClick={() => setOrderType("Delivery")} className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${orderType === "Delivery" ? "bg-[#EF4F5F] text-white" : "text-gray-400"}`}>🛵 DELIVERY</button>
      </div>

      {/* DELIVERY FORM */}
      {orderType === "Delivery" && (
        <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Delivery Address</label>
            <textarea 
              rows="3"
              placeholder="e.g. House No. 123, Street Name, Arrah..." 
              className={`w-full p-4 mt-1 bg-white border ${errors.address ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#EF4F5F] shadow-sm text-sm transition-colors`}
              value={deliveryDetails.address}
              onChange={(e) => {
                setDeliveryDetails({ ...deliveryDetails, address: e.target.value });
                if(errors.address) setErrors({...errors, address: null});
              }}
            />
            {errors.address && <p className="text-[10px] text-red-500 ml-2 mt-1 font-bold">{errors.address}</p>}
            
            <button 
              onClick={detectAddress}
              disabled={detecting}
              className="absolute right-3 bottom-10 text-[10px] font-black uppercase text-[#EF4F5F] flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
            >
              {detecting ? "📡 Locating..." : "📍 Detect Location"}
            </button>
          </div>
          
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Mobile Number</label>
            <input 
              type="tel" 
              placeholder="10-digit mobile number" 
              className={`w-full p-4 mt-1 bg-white border ${errors.phone ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#EF4F5F] shadow-sm text-sm font-bold transition-colors`}
              value={deliveryDetails.phone}
              onChange={(e) => {
                setDeliveryDetails({ ...deliveryDetails, phone: e.target.value });
                if(errors.phone) setErrors({...errors, phone: null});
              }}
            />
            {errors.phone && <p className="text-[10px] text-red-500 ml-2 mt-1 font-bold">{errors.phone}</p>}
          </div>
        </div>
      )}

      {/* ITEMS */}
      <div className="space-y-3 mb-8">
        {cart.map((item) => (
          <div key={item._id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
              <div><p className="text-sm font-bold">{item.name}</p><p className="text-xs text-gray-400">₹{item.price} × {item.qty}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => decreaseQty(item._id)} className="w-6 h-6 bg-gray-100 rounded">-</button>
              <span className="text-sm font-bold">{item.qty}</span>
              <button onClick={() => addToCart(item)} className="w-6 h-6 bg-gray-100 rounded">+</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- BILL SUMMARY --- */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 mb-6">
        <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Bill Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Item Total</span>
            <span className="font-bold">₹{total}</span>
          </div>
          {orderType === "Delivery" && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>Delivery Fee (Arrah Local)</span>
              <span className="font-bold">₹{DELIVERY_FEE}</span>
            </div>
          )}
          <div className="border-t border-dashed pt-3 flex justify-between items-center">
            <span className="text-lg font-black text-gray-800">Grand Total</span>
            <span className="text-2xl font-black text-[#EF4F5F]">₹{finalTotal}</span>
          </div>
        </div>

        <button onClick={placeOrderHandler} disabled={loading} className={`w-full py-4 rounded-2xl mt-6 text-white font-black transition-all ${loading ? 'bg-gray-300' : 'bg-black shadow-lg shadow-gray-200'}`}>
          {loading ? "Processing..." : `Pay & Place Order`}
        </button>
      </div>
    </div>
  );
};

export default Cart;
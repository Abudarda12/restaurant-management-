import { useParams, Link, redirect } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusSkeleton from "../components/StatusSkeleton";

const OrderStatus = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status Animation Mapping
  const statusConfig = {
    Pending: {
      icon: "⏳",
      label: "Order Received",
      desc: "Waiting for the kitchen to confirm...",
      animation: "animate-pulse",
      color: "text-yellow-500",
      progress: "w-1/4",
    },
    Preparing: {
      icon: "👨‍🍳",
      label: "Chef is Cooking",
      desc: "Your meal is being prepared with fresh ingredients!",
      animation: "animate-bounce",
      color: "text-blue-500",
      progress: "w-2/4",
    },
    Served: {
      icon: "🍽️",
      label: "Food Served",
      desc: "Enjoy your meal! Hope you love it.",
      animation: "animate-none",
      color: "text-green-500",
      progress: "w-full",
    },
    Cancelled: {
      icon: "❌",
      label: "Order Cancelled",
      desc: "Please contact the counter for details.",
      animation: "animate-none",
      color: "text-red-500",
      progress: "w-0",
    },
  };

  //order cancel
  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/orders/${id}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Order cancelled successfully.");
        // Optional: Force an immediate local state update so UI changes instantly
        setOrder(prev => ({ ...prev, status: "Cancelled" }));
        redirect("/menu");
      } else {
        // This will now catch the 400 "Chef is cooking" message
        alert(data.message || "Could not cancel order.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Network error: Server is currently unreachable.");
    }
  };


  //fetching order
  useEffect(() => {
    const fetchOrder = () => {
      fetch(`${import.meta.env.VITE_API_URL}api/orders/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data);
          setLoading(false);

          // Optimization: If order is served or cancelled, we don't need to poll anymore
          if (data.status === "Served" || data.status === "Cancelled") {
            clearInterval(interval);
          }
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    };

    fetchOrder();

    // 🔄 Updated refresh rate to 5 seconds (5000ms)
    const interval = setInterval(fetchOrder, 5000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <StatusSkeleton />;
  if (!order) return <div className="text-center p-10">Order Not Found</div>;

  const currentStatus = statusConfig[order.status] || statusConfig.Pending;

  return (
    <div className="p-6 max-w-xl mx-auto pb-20 bg-gray-50 min-h-screen">
      {/* --- STEPPER ANIMATION --- */}
      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 mb-8 text-center border border-gray-100">
        <div
          className={`text-6xl mb-4 inline-block ${currentStatus.animation}`}
        >
          {currentStatus.icon}
        </div>
        <h2 className={`text-2xl font-black ${currentStatus.color}`}>
          {currentStatus.label}
        </h2>
        <p className="text-gray-500 text-sm mt-2">{currentStatus.desc}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full mt-8 overflow-hidden">
          <div
            className={`h-full bg-[#EF4F5F] transition-all duration-1000 ease-out ${currentStatus.progress}`}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          <span>Received</span>
          <span>Preparing</span>
          <span>Ready</span>
        </div>
      </div>

      {/* --- TABLE & STATUS INFO --- */}
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400">Table</p>
          <p className="text-2xl font-black text-gray-900">
            #{order.tableNumber}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-gray-400">Items</p>
          <p className="text-lg font-black text-gray-900">
            {order.items.length} Dishes
          </p>
        </div>
      </div>

      {/* --- ORDER DETAILS CARD --- */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 mb-8">
        <ul className="space-y-4">
          {order.items.map((item) => (
            <li key={item._id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={item.menuId?.image}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">
                    {item.menuId?.name}
                  </p>
                  <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                </div>
              </div>
              <p className="font-bold text-gray-700">
                ₹{item.menuId?.price * item.qty}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-dashed border-gray-200 flex justify-between items-center">
          <span className="font-bold text-gray-400 uppercase text-xs">
            Total Amount
          </span>
          <span className="text-xl font-black text-gray-900">
            ₹{order.totalAmount}
          </span>
        </div>
      </div>

      {/*  cancel order */}
      {order.status === "Pending" && (
        <div className="mt-4">
          <button
            onClick={handleCancelOrder}
            className="w-full py-3 border-2 border-red-100 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all active:scale-95"
          >
            Cancel Order
          </button>
          <p className="text-[10px] text-gray-400 mt-2 italic">
            *Orders can only be cancelled before the kitchen starts preparation.
          </p>
        </div>
      )}
      {/* --- FEEDBACK ACTION --- */}
      <div className="pt-4">
        <Link
          to="/feedback"
          className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-gray-200"
        >
          Rate Your Experience ⭐
        </Link>
      </div>
    </div>
  );
};

export default OrderStatus;

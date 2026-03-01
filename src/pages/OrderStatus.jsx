import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusSkeleton from "../components/StatusSkeleton";

const OrderStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status Animation Mapping (Updated for Delivery)
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
      icon: "🛵",
      label: "Out for Delivery",
      desc: "Your food has left the kitchen and is on its way!",
      animation: "animate-pulse",
      color: "text-purple-500",
      progress: "w-3/4",
    },
    Paid: {
      icon: "✅",
      label: "Order Delivered",
      desc: "Hope you enjoy your meal! See you again.",
      animation: "animate-none",
      color: "text-green-500",
      progress: "w-full",
    },
    Cancelled: {
      icon: "❌",
      label: "Order Cancelled",
      desc: "This order was cancelled. Contact us for help.",
      animation: "animate-none",
      color: "text-red-500",
      progress: "w-0",
    },
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/orders/${id}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await res.json();
      if (res.ok) {
        alert("Order cancelled successfully.");
        setOrder((prev) => ({ ...prev, status: "Cancelled" }));
        navigate("/menu");
      } else {
        alert(data.message || "Could not cancel order.");
      }
    } catch (err) {
      alert("Network error: Server is currently unreachable.");
    }
  };

  useEffect(() => {
    let interval;
    const fetchOrder = () => {
      fetch(`${import.meta.env.VITE_API_URL}api/orders/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data);
          setLoading(false);
          if (data.status === "Paid" || data.status === "Cancelled") {
            clearInterval(interval);
          }
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    };

    fetchOrder();
    interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <StatusSkeleton />;
  if (!order)
    return <div className="text-center p-10 font-bold">Order Not Found</div>;

  const currentStatus = statusConfig[order.status] || statusConfig.Pending;

  return (
    <div className="p-6 max-w-xl mx-auto pb-20 bg-gray-50 min-h-screen">
      {/* --- STATUS CARD --- */}
      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 mb-6 text-center border border-gray-100">
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
        <div className="flex justify-between mt-2 text-[9px] font-bold text-gray-400 uppercase">
          <span>Received</span>
          <span>Cooking</span>
          <span>Transit</span>
          <span>Done</span>
        </div>
      </div>

      {/* --- DELIVERY INFO (Conditional) --- */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 mb-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">
              Order Type
            </p>
            <p className="font-black text-gray-900">
              {order.orderType === "Delivery"
                ? "🛵 Home Delivery"
                : "🍽️ Dine-in"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-400">
              Order ID
            </p>
            <p className="font-mono text-xs text-gray-500">
              #{id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        {order.orderType === "Delivery" && (
          <div className="pt-4 border-t border-dashed border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
              Delivering To
            </p>
            <p className="text-sm text-gray-700 leading-tight font-medium mb-2">
              {order.address}
            </p>
            <p className="text-xs font-bold text-gray-900">📞 {order.phone}</p>
          </div>
        )}
      </div>

      {/* --- ORDER ITEMS --- */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 mb-6 shadow-sm">
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

        {/* Total Summary */}
        <div className="mt-6 pt-6 border-t border-dashed border-gray-100 space-y-2">
          {order.orderType === "Delivery" && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery Fee</span>
              <span>₹20</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-gray-900 uppercase text-xs">
              Grand Total
            </span>
            <span className="text-xl font-black text-[#EF4F5F]">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {order.status === "Pending" && (
        <button
          onClick={handleCancelOrder}
          className="w-full py-4 border-2 border-red-50 border-dashed text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all mb-4"
        >
          Cancel Order
        </button>
      )}

      <Link
        to="/feedback"
        className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-gray-200"
      >
        Rate Your Experience ⭐
      </Link>
    </div>
  );
};

export default OrderStatus;

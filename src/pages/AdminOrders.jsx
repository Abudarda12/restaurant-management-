import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const prevOrderCountRef = useRef(0);
  const audioRef = useRef(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/orders`);
      const data = await res.json();

      // 🔔 NEW ORDER SOUND LOGIC
      if (
        prevOrderCountRef.current > 0 &&
        data.length > prevOrderCountRef.current
      ) {
        audioRef.current
          .play()
          .catch((err) =>
            console.log("Audio play blocked until user interaction"),
          );
      }

      prevOrderCountRef.current = data.length;
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    // 🔄 Auto refresh every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${import.meta.env.VITE_API_URL}api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    if (window.confirm("Archive this completed order?")) {
      await fetch(`${import.meta.env.VITE_API_URL}api/orders/${id}`, {
        method: "DELETE",
      });
      fetchOrders();
    }
  };

  // Grouping Logic - Ensures case-insensitivity to avoid "hidden" items
  const statusCategories = ["Pending", "Preparing", "Served"];
  const groupedOrders = statusCategories.reduce((acc, status) => {
    acc[status] = orders.filter(
      (order) => order.status?.toLowerCase() === status.toLowerCase(),
    );
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link to="admin/dashboard" className="text-blue-500 hover:underline">
        ← Back to Admin Dashboard
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#EF4F5F]">
          Live Kitchen Board
        </h1>
        <button
          onClick={() => audioRef.current.play()}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition"
        >
          Enable Sound Alerts 🔔
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-inner text-gray-400 font-medium">
          No active orders at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusCategories.map((status) => (
            <div
              key={status}
              className="bg-gray-200 p-4 rounded-xl min-h-[80vh] flex flex-col"
            >
              <h2
                className={`text-lg font-bold mb-4 flex justify-between items-center px-2 ${
                  status === "Pending"
                    ? "text-orange-600"
                    : status === "Preparing"
                      ? "text-blue-600"
                      : "text-green-600"
                }`}
              >
                {status}
                <span className="bg-white text-gray-700 px-2.5 py-0.5 rounded-full text-xs shadow-sm">
                  {groupedOrders[status].length}
                </span>
              </h2>

              <div className="space-y-4 overflow-y-auto">
                {groupedOrders[status].map((order) => (
                  <div
                    key={order._id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-l-black"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <div>
                          <h3 className="font-bold text-lg leading-tight">
                            Table #{order.tableNumber}
                          </h3>
                          {/* The Customer Name Badge */}
                          <span className="text-[#EF4F5F] text-xs font-extrabold uppercase bg-red-50 px-2 py-0.5 rounded">
                            👤 {order.customerName}
                          </span>
                        </div>
                        {/* Use the new Timer here */}
                        <OrderTimer createdAt={order.createdAt} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* ITEMS LIST - Fixed Visibility */}
                    <div className="py-2 mb-3">
                      <ul className="text-sm space-y-1">
                        {order.items.map((item) => (
                          <li
                            key={item._id}
                            className="flex justify-between text-gray-700"
                          >
                            <span className="truncate mr-2">
                              {item.menuId?.name || "Deleted Item"}
                            </span>
                            <span className="font-bold flex-shrink-0">
                              × {item.qty}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t pt-3 flex flex-col gap-2">
                      <p className="text-sm font-bold text-gray-800 mb-1">
                        Total: ₹{order.totalAmount}
                      </p>

                      {/* ACTION BUTTONS */}
                      {status === "Pending" && (
                        <button
                          onClick={() => updateStatus(order._id, "Preparing")}
                          className="w-full py-2 bg-orange-500 text-white rounded font-bold text-xs uppercase tracking-wider hover:bg-orange-600 transition"
                        >
                          Start Preparing
                        </button>
                      )}

                      {status === "Preparing" && (
                        <button
                          onClick={() => updateStatus(order._id, "Served")}
                          className="w-full py-2 bg-blue-600 text-white rounded font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition"
                        >
                          Mark as Served
                        </button>
                      )}

                      {status === "Served" && (
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="w-full py-2 bg-gray-100 text-gray-500 rounded font-bold text-xs uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition border border-gray-200"
                        >
                          Archive Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Timer Component to show how long an order has been in its current status
const OrderTimer = ({ createdAt }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const diff = Math.floor((new Date() - new Date(createdAt)) / 60000); // Difference in minutes
      setElapsed(diff);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [createdAt]);

  // Determine color based on lateness
  const timerColor =
    elapsed >= 15 ? "text-red-600 animate-pulse font-black" : "text-gray-500";

  return (
    <span
      className={`text-xs font-mono px-2 py-1 bg-gray-100 rounded ${timerColor}`}
    >
      {elapsed} min ago
    </span>
  );
};

export default AdminOrders;

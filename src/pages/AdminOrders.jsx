import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [menuList, setMenuList] = useState([]); // For the Quick Add dropdown
  const [viewFilter, setViewFilter] = useState("All"); // All, Dining, Delivery
  const prevOrderCountRef = useRef(0);
  const audioRef = useRef(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  // Fetch Menu once for the Quick Add dropdown
  const fetchMenu = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/menu`);
      const data = await res.json();
      setMenuList(data);
    } catch (err) {
      console.error("Menu fetch error:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/orders`);
      const data = await res.json();

      if (
        prevOrderCountRef.current > 0 &&
        data.length > prevOrderCountRef.current
      ) {
        audioRef.current.play().catch(() => console.log("Audio blocked"));
      }

      prevOrderCountRef.current = data.length;
      setOrders(data);
    } catch (error) {
      console.error("Orders fetch error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenu();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- ADD ITEM TO EXISTING ORDER ---
  const addItemToExistingOrder = async (orderId, menuId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/orders/${orderId}/add-item`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menuId, qty: 1 }),
        },
      );
      if (res.ok) fetchOrders();
    } catch (err) {
      alert("Failed to add item to order.");
    }
  };

  const handlePrint = (orderId) => {
    const printContent = document.getElementById(`kot-${orderId}`);
    if (!printContent) return alert("Print content not found!");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <html>
      <head>
        <title>Print KOT</title>
        <style>
          body { font-family: monospace; padding: 20px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { text-align: left; padding: 5px 0; border-bottom: 1px dashed #ccc; }
          .text-right { text-align: right; }
          .dashed { border-top: 2px dashed black; margin: 15px 0; }
          @page { margin: 0; }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
    </html>`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

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

  const statusCategories = ["Pending", "Preparing", "Served"];

  const filteredOrders = orders.filter((order) => {
    if (viewFilter === "All") return true;
    return order.orderType === viewFilter;
  });

  const groupedOrders = statusCategories.reduce((acc, status) => {
    acc[status] = filteredOrders.filter(
      (o) => o.status?.toLowerCase() === status.toLowerCase(),
    );
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Link
              to="/admin/dashboard"
              className="text-gray-500 hover:text-black text-sm font-bold flex items-center gap-1 mb-2"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Kitchen Board
            </h1>
          </div>

          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {["All", "Dining", "Delivery"].map((type) => (
              <button
                key={type}
                onClick={() => setViewFilter(type)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                  viewFilter === type
                    ? "bg-black text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {type === "Dining"
                  ? "🍽️ Dine-In"
                  : type === "Delivery"
                    ? "🛵 Delivery"
                    : "Show All"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusCategories.map((status) => (
            <div
              key={status}
              className="bg-gray-200/50 p-4 rounded-3xl min-h-[80vh] border border-gray-200"
            >
              <h2
                className={`text-sm font-black mb-6 flex justify-between items-center px-2 uppercase tracking-widest ${
                  status === "Pending"
                    ? "text-orange-600"
                    : status === "Preparing"
                      ? "text-blue-600"
                      : "text-green-600"
                }`}
              >
                {status}
                <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs shadow-sm border border-gray-100 italic">
                  {groupedOrders[status].length} Orders
                </span>
              </h2>

              <div className="space-y-5">
                {groupedOrders[status].map((order) => (
                  <div
                    key={order._id}
                    className={`bg-white p-5 rounded-3xl shadow-md border-t-8 transition-all ${
                      order.orderType === "Delivery"
                        ? "border-t-purple-600"
                        : "border-t-slate-900"
                    }`}
                  >
                    {/* TYPE BADGE */}
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${
                          order.orderType === "Delivery"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : "bg-slate-50 text-slate-700 border-slate-100"
                        }`}
                      >
                        {order.orderType === "Delivery"
                          ? "🛵 Online"
                          : "🍽️ Dine-In"}
                      </span>
                      <button
                        onClick={() => handlePrint(order._id)}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200"
                      >
                        🖨️
                      </button>
                    </div>

                    <h3 className="font-black text-2xl text-gray-900 mb-1 leading-none">
                      {order.orderType === "Delivery"
                        ? "Parcel Order"
                        : `Table #${order.tableNumber}`}
                    </h3>

                    <div className="flex flex-col gap-1 mb-4 mt-2">
                      <span className="text-gray-500 text-xs font-bold">
                        👤 {order.customerName}
                      </span>
                      {order.orderType === "Delivery" && (
                        <span className="text-purple-600 text-xs font-bold bg-purple-50 w-fit px-2 py-0.5 rounded italic">
                          📞 {order.phone}
                        </span>
                      )}
                    </div>

                    {order.orderType === "Delivery" && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-[11px] text-slate-600 font-bold leading-relaxed italic">
                          📍 {order.address}
                        </p>
                      </div>
                    )}

                    <OrderTimer createdAt={order.createdAt} />

                    <ul className="mt-4 text-sm border-t border-dashed border-gray-100 pt-4 space-y-2">
                      {order.items.map((item) => (
                        <li
                          key={item._id}
                          className="flex justify-between font-bold text-gray-800"
                        >
                          <span>{item.menuId?.name || "Deleted"}</span>
                          <span className="text-gray-400">x{item.qty}</span>
                        </li>
                      ))}
                    </ul>

                    {/* --- QUICK ADD FEATURE --- */}
                    <div className="mt-2 mb-4 bg-gray-50 p-2 rounded-xl">
                      <select
                        className="w-full bg-transparent text-[11px] font-bold outline-none cursor-pointer text-gray-400"
                        onChange={(e) => {
                          if (e.target.value) {
                            addItemToExistingOrder(order._id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">+ Add Extra (Water, Soda...)</option>
                        {menuList.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name} - ₹{item.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-between items-center py-3 border-t border-gray-50">
                      <span className="text-[10px] font-black uppercase text-gray-400">
                        Bill Total
                      </span>
                      <span className="font-black text-gray-900 text-lg">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {status === "Pending" && (
                        <button
                          onClick={() => updateStatus(order._id, "Preparing")}
                          className="w-full py-3 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100"
                        >
                          Accept Order
                        </button>
                      )}
                      {status === "Preparing" && (
                        <button
                          onClick={() => updateStatus(order._id, "Served")}
                          className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
                        >
                          {order.orderType === "Delivery"
                            ? "Dispatch Parcel"
                            : "Mark Served"}
                        </button>
                      )}
                      {status === "Served" && (
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase"
                        >
                          Archive
                        </button>
                      )}
                    </div>

                    {/* --- HIDDEN KOT TEMPLATE --- */}
                    <div id={`kot-${order._id}`} className="hidden">
                      <center>
                        <h2 style={{ margin: 0, fontSize: "20px" }}>
                          {order.orderType === "Delivery"
                            ? "DELIVERY RECEIPT"
                            : "KITCHEN ORDER"}
                        </h2>
                        <h1 style={{ margin: "5px 0", fontSize: "28px" }}>
                          {order.orderType === "Delivery"
                            ? "PARCEL"
                            : `#${order.tableNumber}`}
                        </h1>
                        <p style={{ margin: 0 }}>
                          --------------------------------
                        </p>
                      </center>

                      <table
                        style={{
                          width: "100%",
                          marginTop: "10px",
                          borderCollapse: "collapse",
                        }}
                      >
                        <thead>
                          <tr style={{ borderBottom: "2px solid black" }}>
                            <th style={{ textAlign: "left", padding: "5px 0" }}>
                              Item
                            </th>
                            <th
                              style={{ textAlign: "right", padding: "5px 0" }}
                            >
                              Qty
                            </th>
                            <th
                              style={{ textAlign: "right", padding: "5px 0" }}
                            >
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item._id}>
                              <td
                                style={{
                                  fontWeight: "bold",
                                  padding: "8px 0",
                                  fontSize: "14px",
                                }}
                              >
                                {item.menuId?.name || "Item"}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  fontWeight: "bold",
                                }}
                              >
                                x{item.qty}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  fontWeight: "bold",
                                }}
                              >
                                ₹{(item.menuId?.price || 0) * item.qty}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* --- TOTAL SECTION WITH DELIVERY CHARGE --- */}
                      <div
                        style={{
                          borderTop: "2px dashed black",
                          marginTop: "10px",
                          paddingTop: "10px",
                        }}
                      >
                        {order.orderType === "Delivery" && (
                          <>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "14px",
                                marginBottom: "5px",
                              }}
                            >
                              <span>Item Subtotal:</span>
                              <span>₹{order.totalAmount - 20}</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "14px",
                                marginBottom: "5px",
                                color: "#000",
                              }}
                            >
                              <span>Delivery Charge:</span>
                              <span>₹20</span>
                            </div>
                          </>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "20px",
                            fontWeight: "900",
                            marginTop: "5px",
                          }}
                        >
                          <span>GRAND TOTAL:</span>
                          <span>₹{order.totalAmount}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "15px",
                          fontSize: "13px",
                          lineHeight: "1.4",
                        }}
                      >
                        <p style={{ margin: "2px 0" }}>
                          <strong>Customer:</strong> {order.customerName}
                        </p>

                        {order.orderType === "Delivery" && (
                          <div
                            style={{
                              background: "#f9f9f9",
                              padding: "5px",
                              border: "1px solid #eee",
                              marginTop: "5px",
                            }}
                          >
                            <p style={{ margin: "2px 0" }}>
                              <strong>Phone:</strong> {order.phone}
                            </p>
                            <p style={{ margin: "2px 0" }}>
                              <strong>Address:</strong> {order.address}
                            </p>
                          </div>
                        )}

                        <div
                          style={{
                            marginTop: "10px",
                            borderTop: "1px solid #eee",
                            paddingTop: "5px",
                          }}
                        >
                          <p style={{ margin: "2px 0", fontSize: "11px" }}>
                            <strong>Order ID:</strong> #
                            {order._id.slice(-6).toUpperCase()}
                          </p>
                          <p style={{ margin: "2px 0", fontSize: "11px" }}>
                            <strong>Time:</strong>{" "}
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <center>
                        <p
                          style={{
                            marginTop: "20px",
                            borderTop: "1px solid #000",
                            paddingTop: "10px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {order.orderType === "Delivery"
                            ? "SAFE DELIVERY • HAPPY EATING"
                            : "KITCHEN COPY"}
                        </p>
                      </center>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OrderTimer = ({ createdAt }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const calc = () =>
      setElapsed(Math.floor((new Date() - new Date(createdAt)) / 60000));
    calc();
    const interval = setInterval(calc, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);
  const color =
    elapsed >= 15 ? "text-red-600 animate-pulse font-black" : "text-gray-400";
  return (
    <span
      className={`text-[10px] font-mono px-2 py-1 bg-gray-50 border rounded-lg w-fit ${color}`}
    >
      {elapsed} min ago
    </span>
  );
};

export default AdminOrders;

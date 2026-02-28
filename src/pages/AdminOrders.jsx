import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [viewFilter, setViewFilter] = useState("All"); // All, Dining, Delivery
  const prevOrderCountRef = useRef(0);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/orders`);
      const data = await res.json();

      if (prevOrderCountRef.current > 0 && data.length > prevOrderCountRef.current) {
        audioRef.current.play().catch(() => console.log("Audio blocked"));
      }

      prevOrderCountRef.current = data.length;
      setOrders(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

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
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
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
      await fetch(`${import.meta.env.VITE_API_URL}api/orders/${id}`, { method: "DELETE" });
      fetchOrders();
    }
  };

  const statusCategories = ["Pending", "Preparing", "Served"];
  
  // Filter logic for the UI Toggle
  const filteredOrders = orders.filter(order => {
    if (viewFilter === "All") return true;
    return order.orderType === viewFilter;
  });

  const groupedOrders = statusCategories.reduce((acc, status) => {
    acc[status] = filteredOrders.filter(o => o.status?.toLowerCase() === status.toLowerCase());
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Link to="/admin/dashboard" className="text-gray-500 hover:text-black text-sm font-bold flex items-center gap-1 mb-2">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Kitchen Live Board</h1>
          </div>

          {/* --- TOP FILTERS --- */}
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {["All", "Dining", "Delivery"].map((type) => (
              <button
                key={type}
                onClick={() => setViewFilter(type)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                  viewFilter === type ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {type === "Dining" ? "🍽️ Dine-In" : type === "Delivery" ? "🛵 Delivery" : "Show All"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusCategories.map((status) => (
            <div key={status} className="bg-gray-200/50 p-4 rounded-3xl min-h-[80vh] border border-gray-200">
              <h2 className={`text-sm font-black mb-6 flex justify-between items-center px-2 uppercase tracking-widest ${
                status === "Pending" ? "text-orange-600" : status === "Preparing" ? "text-blue-600" : "text-green-600"
              }`}>
                {status} 
                <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs shadow-sm border border-gray-100">
                  {groupedOrders[status].length}
                </span>
              </h2>

              <div className="space-y-5">
                {groupedOrders[status].map((order) => (
                  <div 
                    key={order._id} 
                    className={`bg-white p-5 rounded-3xl shadow-md border-t-8 transition-all ${
                      order.orderType === 'Delivery' ? 'border-t-purple-600' : 'border-t-slate-900'
                    }`}
                  >
                    {/* TYPE BADGE */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${
                        order.orderType === 'Delivery' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                      }`}>
                        {order.orderType === 'Delivery' ? '🛵 Online Delivery' : '🍽️ Dine-In Order'}
                      </span>
                      <button onClick={() => handlePrint(order._id)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors">
                        🖨️
                      </button>
                    </div>

                    <h3 className="font-black text-2xl text-gray-900 mb-1">
                      {order.orderType === "Delivery" ? "Home Parcel" : `Table #${order.tableNumber}`}
                    </h3>
                    
                    <div className="flex flex-col gap-1 mb-4">
                      <span className="text-gray-500 text-xs font-bold">👤 {order.customerName}</span>
                      {order.orderType === "Delivery" && (
                        <span className="text-purple-600 text-xs font-bold bg-purple-50 w-fit px-2 py-0.5 rounded">📞 {order.phone}</span>
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

                    <ul className="mt-4 text-sm border-y border-dashed border-gray-100 py-4 space-y-2">
                      {order.items.map((item) => (
                        <li key={item._id} className="flex justify-between font-bold text-gray-800">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                            {item.menuId?.name || "Deleted"}
                          </span>
                          <span className="text-gray-400">x{item.qty}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-between items-center my-4">
                      <span className="text-[10px] font-black uppercase text-gray-400">Total Bill</span>
                      <span className="font-black text-gray-900 text-lg">₹{order.totalAmount}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {status === "Pending" && (
                        <button onClick={() => updateStatus(order._id, "Preparing")} className="w-full py-3 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all">
                          Start Cooking
                        </button>
                      )}
                      {status === "Preparing" && (
                        <button onClick={() => updateStatus(order._id, "Served")} className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all">
                          {order.orderType === "Delivery" ? "Dispatch Parcel" : "Food Served"}
                        </button>
                      )}
                      {status === "Served" && (
                        <button onClick={() => deleteOrder(order._id)} className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase active:scale-95 transition-all">
                          Archive
                        </button>
                      )}
                    </div>

                    {/* --- HIDDEN KOT TEMPLATE --- */}
                    <div id={`kot-${order._id}`} className="hidden">
                      <center>
                        <h2 style={{ margin: 0, fontSize: "20px" }}>{order.orderType === "Delivery" ? "DELIVERY" : "DINE-IN"}</h2>
                        <h1 style={{ margin: "5px 0", fontSize: "28px" }}>
                          {order.orderType === "Delivery" ? "PARCEL" : `#${order.tableNumber}`}
                        </h1>
                        <p style={{ margin: 0 }}>--------------------------------</p>
                      </center>
                      <table style={{ width: "100%", marginTop: "10px" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid black" }}>
                            <th style={{ textAlign: "left" }}>Item</th>
                            <th style={{ textAlign: "right" }}>Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map(item => (
                            <tr key={item._id}>
                              <td style={{ fontWeight: "bold", padding: "5px 0" }}>{item.menuId?.name || "Item"}</td>
                              <td style={{ textAlign: "right", fontWeight: "bold" }}>x{item.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="dashed"></div>
                      <p style={{ fontSize: "14px" }}><strong>Customer:</strong> {order.customerName}</p>
                      {order.orderType === "Delivery" && (
                        <>
                          <p style={{ fontSize: "14px" }}><strong>Phone:</strong> {order.phone}</p>
                          <p style={{ fontSize: "14px" }}><strong>Address:</strong> {order.address}</p>
                        </>
                      )}
                      <p style={{ fontSize: "12px" }}><strong>Time:</strong> {new Date(order.createdAt).toLocaleTimeString()}</p>
                      <center><p style={{ marginTop: "20px" }}>*** THANK YOU ***</p></center>
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
    const calc = () => setElapsed(Math.floor((new Date() - new Date(createdAt)) / 60000));
    calc();
    const interval = setInterval(calc, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);
  const color = elapsed >= 15 ? "text-red-600 animate-pulse font-black" : "text-gray-400";
  return <span className={`text-[10px] font-mono px-2 py-1 bg-gray-50 border rounded-lg w-fit ${color}`}>{elapsed} min ago</span>;
};

export default AdminOrders;
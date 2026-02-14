import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const prevOrderCountRef = useRef(0);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

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
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- PRINT LOGIC ---
  const handlePrint = (orderId) => {
    const printContent = document.getElementById(`kot-${orderId}`);

    if (!printContent) {
      alert("Print content not found!");
      return;
    }

    // This is better than overwriting document.body because it preserves React state
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <html>
      <head>
        <title>Print KOT</title>
        <style>
          body { font-family: monospace; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          .text-right { text-align: right; }
          .dashed-line { border-top: 1px dashed black; margin: 10px 0; }
          @page { margin: 0; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();

    // Wait for images/content to load before printing
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
  const groupedOrders = statusCategories.reduce((acc, status) => {
    acc[status] = orders.filter(
      (order) => order.status?.toLowerCase() === status.toLowerCase(),
    );
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link to="/admin/dashboard" className="text-blue-500 hover:underline">
        ← Back
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-[#EF4F5F]">
          Live Kitchen Board
        </h1>
        <button
          onClick={() => audioRef.current.play()}
          className="px-4 py-2 bg-white border rounded-lg shadow-sm"
        >
          Enable Sound 🔔
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusCategories.map((status) => (
          <div key={status} className="bg-gray-200 p-4 rounded-xl min-h-[80vh]">
            <h2
              className={`text-lg font-black mb-4 flex justify-between uppercase ${status === "Pending" ? "text-orange-600" : status === "Preparing" ? "text-blue-600" : "text-green-600"}`}
            >
              {status} <span>{groupedOrders[status].length}</span>
            </h2>

            <div className="space-y-4">
              {groupedOrders[status].map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-4 rounded-xl shadow border-l-4 border-black"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-xl">
                        Table #{order.tableNumber}
                      </h3>
                      <span className="text-[#EF4F5F] text-[10px] font-black uppercase bg-red-50 px-2 py-0.5 rounded">
                        👤 {order.customerName}
                      </span>
                    </div>
                    {/* PRINT ACTION */}
                    <button
                      onClick={() => handlePrint(order._id)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      title="Print KOT"
                    >
                      🖨️
                    </button>
                  </div>

                  <div className="mt-3">
                    <OrderTimer createdAt={order.createdAt} />
                  </div>

                  <ul className="mt-3 text-sm border-t border-b py-2 space-y-1">
                    {order.items.map((item) => (
                      <li
                        key={item._id}
                        className="flex justify-between font-bold text-gray-700"
                      >
                        <span>{item.menuId?.name || "Deleted"}</span>
                        <span>× {item.qty}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-col gap-2">
                    {status === "Pending" && (
                      <button
                        onClick={() => updateStatus(order._id, "Preparing")}
                        className="w-full py-2 bg-orange-500 text-white rounded font-black text-xs uppercase tracking-widest"
                      >
                        Start Preparing
                      </button>
                    )}
                    {status === "Preparing" && (
                      <button
                        onClick={() => updateStatus(order._id, "Served")}
                        className="w-full py-2 bg-blue-600 text-white rounded font-black text-xs uppercase tracking-widest"
                      >
                        Mark Served
                      </button>
                    )}
                    {status === "Served" && (
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="w-full py-2 bg-gray-100 text-gray-500 rounded font-black text-xs uppercase"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                  {/* --- HIDDEN PRINT TEMPLATE --- */}
                  <div id={`kot-${order._id}`} className="hidden">
                    <div
                      style={{
                        width: "80mm",
                        padding: "10px",
                        fontFamily: "monospace",
                        color: "#000",
                      }}
                    >
                      <center>
                        <h2 style={{ margin: 0, fontSize: "18px" }}>
                          KITCHEN ORDER
                        </h2>
                        <p style={{ margin: "5px 0" }}>
                          Table: {order.tableNumber}
                        </p>
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
                          <tr style={{ borderBottom: "1px dashed #000" }}>
                            <th
                              style={{
                                textAlign: "left",
                                paddingBottom: "5px",
                              }}
                            >
                              Item
                            </th>
                            <th
                              style={{
                                textAlign: "right",
                                paddingBottom: "5px",
                              }}
                            >
                              Qty
                            </th>
                          </tr>
                        </thead>
                        {/* Added <tbody> to fix the React warning */}
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item._id}>
                              <td
                                style={{
                                  fontWeight: "bold",
                                  padding: "4px 0",
                                  fontSize: "14px",
                                }}
                              >
                                {item.menuId?.name || "Deleted Item"}
                              </td>

                              <td
                                style={{
                                  textAlign: "right",
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                }}
                              >
                                {item.menuId?.price || 0} × {item.qty}
                              </td>
                             
                            </tr>
                          ))}
                        </tbody>
                        <tfoot style={{ borderTop: "1px dashed #000" }}>
                          <tr>
                            <td
                              style={{
                                textAlign: "right",
                                paddingBottom: "5px",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              Total:
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                paddingBottom: "5px",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              ₹{order.totalAmount}
                            </td>
                          </tr>
                        </tfoot> 
                        
                      </table>

                      <div
                        style={{
                          marginTop: "15px",
                          borderTop: "1px dashed #000",
                          paddingTop: "5px",
                        }}
                      >
                        <p style={{ margin: "2px 0", fontSize: "12px" }}>
                          <strong>Customer:</strong> {order.customerName}
                        </p>
                        <p style={{ margin: "2px 0", fontSize: "12px" }}>
                          <strong>Time:</strong>{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <center>
                        <p style={{ marginTop: "15px", fontSize: "10px" }}>
                          *** End of KOT ***
                        </p>
                      </center>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderTimer = ({ createdAt }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const calculateTime = () =>
      setElapsed(Math.floor((new Date() - new Date(createdAt)) / 60000));
    calculateTime();
    const interval = setInterval(calculateTime, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const timerColor =
    elapsed >= 15 ? "text-red-600 animate-pulse font-black" : "text-gray-500";
  return (
    <span
      className={`text-[10px] font-mono px-2 py-1 bg-gray-100 rounded ${timerColor}`}
    >
      {elapsed} min ago
    </span>
  );
};

export default AdminOrders;

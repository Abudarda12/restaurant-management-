import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [viewFilter, setViewFilter] = useState("All");
  const [showManualModal, setShowManualModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("Dining");
  const [newOrder, setNewOrder] = useState({ 
    tableNumber: "", 
    customerName: "Walk-in Customer", 
    items: [],
    discount: 0 
  });

  const prevOrderCountRef = useRef(0);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    fetchOrders();
    fetchMenu();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

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
      if (prevOrderCountRef.current > 0 && data.length > prevOrderCountRef.current) {
        audioRef.current.play().catch(() => {});
      }
      prevOrderCountRef.current = data.length;
      setOrders(data);
    } catch (error) {
      console.error("Orders fetch error:", error);
    }
  };

  const addItemToExistingOrder = async (orderId, menuId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/orders/${orderId}/add-item`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId, qty: 1 }),
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      alert("Failed to add item.");
    }
  };

  const handleCreateManualOrder = async () => {
    if (selectedPlatform === "Dining" && !newOrder.tableNumber) {
      return alert("Please select Table Number!");
    }
    if (newOrder.items.length === 0) return alert("Add at least one item!");

    const subtotal = newOrder.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const finalAmount = Math.max(0, subtotal - Number(newOrder.discount));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newOrder,
          orderType: selectedPlatform,
          status: "Preparing",
          totalAmount: finalAmount,
        }),
      });
      if (res.ok) {
        setShowManualModal(false);
        setNewOrder({ tableNumber: "", customerName: "Walk-in Customer", items: [], discount: 0 });
        setSelectedPlatform("Dining");
        fetchOrders();
      }
    } catch (err) {
      alert("Error creating POS order");
    }
  };

  const addItemToManual = (item) => {
    const exists = newOrder.items.find((i) => i.menuId === item._id);
    if (exists) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map((i) => i.menuId === item._id ? { ...i, qty: i.qty + 1 } : i),
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, { menuId: item._id, name: item.name, price: item.price, qty: 1 }],
      });
    }
  };

  const handlePrintKOT = (orderId) => {
    const printContent = document.getElementById(`kot-${orderId}`);
    if (!printContent) return alert("KOT content not found!");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>KOT - #${orderId.slice(-4)}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: 'Courier New', monospace; width: 72mm; padding: 10px; font-size: 14px; color: #000; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .dashed-line { border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; border-bottom: 1px solid #000; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintBill = (order) => {
    const subtotal = order.totalAmount;
    const gst = (subtotal * 0.05).toFixed(2);
    const grandTotal = (parseFloat(subtotal) + parseFloat(gst)).toFixed(2);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: Arial, sans-serif; width: 72mm; padding: 5px; font-size: 12px; color: #000; }
            .center { text-align: center; }
            .border-top { border-top: 1px dashed #000; margin: 5px 0; padding-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { text-align: left; border-bottom: 1px solid #000; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="center"><h2 style="margin:0;">Apna Restaurant</h2><p>TAX INVOICE</p></div>
          <div class="border-top">
            <p><b>Bill:</b> #${order._id.slice(-6).toUpperCase()} <span style="float:right;">${new Date().toLocaleDateString()}</span></p>
            <p><b>Cust:</b> ${order.customerName}</p>
            ${order.orderType === "Delivery" ? `<p><b>Phone:</b> ${order.phone}</p><p><b>Addr:</b> ${order.address}</p>` : 
              (order.orderType === "Dining" ? `<p><b>Table:</b> ${order.tableNumber}</p>` : `<p><b>Platform:</b> ${order.orderType}</p>`)}
          </div>
          <table>
            <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th></tr></thead>
            <tbody>
              ${order.items.map(item => `<tr><td>${item.menuId?.name}</td><td class="right">${item.qty}</td><td class="right">₹${item.menuId?.price * item.qty}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="border-top">
            <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span><span>₹${subtotal}</span></div>
            ${order.discount ? `<div style="display:flex; justify-content:space-between; color:red;"><span>Discount:</span><span>-₹${order.discount}</span></div>` : ''}
            <div style="display:flex; justify-content:space-between;"><span>GST (5%):</span><span>₹${gst}</span></div>
            <div class="border-top" style="display:flex; justify-content:space-between; font-weight:bold; font-size:14px;">
              <span>GRAND TOTAL:</span><span>₹${grandTotal}</span>
            </div>
          </div>
          <div class="center" style="margin-top:15px;"><p>THANK YOU! VISIT AGAIN</p></div>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
  const filteredOrders = orders.filter((o) => viewFilter === "All" || o.orderType === viewFilter);
  const groupedOrders = statusCategories.reduce((acc, status) => {
    acc[status] = filteredOrders.filter((o) => o.status?.toLowerCase() === status.toLowerCase());
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Link to="/admin/dashboard" className="text-gray-500 hover:text-black text-sm font-bold flex items-center gap-1 mb-2">← Back</Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">Orders Console</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setShowManualModal(true)} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all">➕ NEW POS ORDER</button>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              {["All", "Dining", "Delivery", "Swiggy", "Zomato"].map((type) => (
                <button key={type} onClick={() => setViewFilter(type)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewFilter === type ? "bg-black text-white" : "text-gray-400 hover:bg-gray-50"}`}>{type}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusCategories.map((status) => (
            <div key={status} className="bg-gray-200/50 p-4 rounded-3xl min-h-[80vh] border border-gray-200">
              <h2 className={`text-sm font-black mb-6 flex justify-between items-center px-2 uppercase tracking-widest ${status === "Pending" ? "text-orange-600" : status === "Preparing" ? "text-blue-600" : "text-green-600"}`}>
                {status} <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs italic">{groupedOrders[status].length}</span>
              </h2>

              <div className="space-y-5">
                {groupedOrders[status].map((order) => (
                  <div key={order._id} className={`bg-white p-5 rounded-3xl shadow-md border-t-8 transition-all ${
                    order.orderType === "Swiggy" ? "border-t-orange-500" : 
                    order.orderType === "Zomato" ? "border-t-red-600" : 
                    order.orderType === "Delivery" ? "border-t-purple-600" : "border-t-slate-900"
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                        order.orderType === "Swiggy" ? "bg-orange-50 text-orange-600 border-orange-100" : 
                        order.orderType === "Zomato" ? "bg-red-50 text-red-600 border-red-100" : 
                        "bg-slate-50 text-slate-700 border-slate-100"
                      }`}>
                        {order.orderType === "Swiggy" ? "🧡 Swiggy" : order.orderType === "Zomato" ? "❤️ Zomato" : order.orderType === "Delivery" ? "🛵 Delivery" : "🍽️ Dine-In"}
                      </span>
                      <button onClick={() => handlePrintKOT(order._id)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl border text-[10px] font-bold">🖨️ KOT</button>
                    </div>

                    <h3 className="font-black text-2xl text-gray-900 mb-1 leading-none">
                        {order.orderType === "Dining" ? `Table #${order.tableNumber}` : "Online Order"}
                    </h3>
                    
                    <div className="flex flex-col gap-1 mb-3 mt-1">
                      <p className="text-gray-500 text-xs font-bold italic">👤 {order.customerName}</p>
                      {order.orderType === "Delivery" && (
                        <>
                          <p className="text-purple-600 text-[11px] font-bold">📞 {order.phone}</p>
                          <p className="text-gray-400 text-[10px] leading-tight bg-gray-50 p-2 rounded-lg border border-dashed mt-1">📍 {order.address}</p>
                        </>
                      )}
                    </div>

                    <OrderTimer createdAt={order.createdAt} />

                    <ul className="mt-4 text-sm border-t border-dashed pt-4 space-y-2">
                      {order.items.map((item) => (
                        <li key={item._id} className="flex justify-between font-bold text-gray-800">
                          <span>{item.menuId?.name}</span> <span className="text-gray-400">x{item.qty}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 bg-gray-50 p-2 rounded-xl border border-dashed">
                      <select className="w-full bg-transparent text-[10px] font-black outline-none text-gray-400 uppercase" onChange={(e) => { if (e.target.value) { addItemToExistingOrder(order._id, e.target.value); e.target.value = ""; } }}>
                        <option value="">+ Add Extra Item</option>
                        {menuList.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 mt-6">
                      {status === "Pending" && <button onClick={() => updateStatus(order._id, "Preparing")} className="w-full py-3 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Accept Order</button>}
                      {status === "Preparing" && <button onClick={() => updateStatus(order._id, "Served")} className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Mark Served</button>}
                      {status === "Served" && (
                        <>
                          <button onClick={() => handlePrintBill(order)} className="w-full py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">📄 Print Final Bill</button>
                          <button onClick={() => deleteOrder(order._id)} className="w-full py-3 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase">Archive</button>
                        </>
                      )}
                    </div>

                    <div id={`kot-${order._id}`} className="hidden">
                      <div className="center">
                        <p className="bold large">{order.orderType.toUpperCase()} KOT</p>
                        <p className="bold" style={{fontSize: '32px', margin: '5px 0'}}>
                            {order.orderType === "Dining" ? `TABLE: ${order.tableNumber}` : order.orderType}
                        </p>
                        <p>ID: #{order._id.slice(-6).toUpperCase()}</p>
                        <div className="dashed-line"></div>
                      </div>
                      <table>
                        <thead><tr><th>ITEM</th><th style={{textAlign:'center'}}>QTY</th></tr></thead>
                        <tbody>{order.items.map(i => <tr key={i._id}><td className="bold">{i.menuId?.name}</td><td style={{textAlign:'center'}} className="bold">x{i.qty}</td></tr>)}</tbody>
                      </table>
                      <div className="dashed-line"></div>
                      <p className="bold">Cust: {order.customerName}</p>
                      {order.orderType === "Delivery" && (
                        <div style={{fontSize: '12px'}}>
                          <p><b>Phone:</b> {order.phone}</p>
                          <p><b>Address:</b> {order.address}</p>
                        </div>
                      )}
                      <div className="center" style={{marginTop: '10px', fontSize: '10px'}}><p>SmartMenu Cloud POS</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showManualModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-black text-2xl uppercase italic tracking-tighter">Counter Billing (POS)</h2>
              <button onClick={() => setShowManualModal(false)} className="bg-white p-2 rounded-full shadow-sm">✕</button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-3/5 p-8 overflow-y-auto border-r border-dashed">
                <input type="text" placeholder="🔍 Search Dish..." className="w-full p-4 rounded-2xl bg-gray-100 mb-6 font-bold outline-none ring-0 focus:ring-2 focus:ring-green-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  {menuList.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                    <button key={item._id} onClick={() => addItemToManual(item)} className="text-left p-4 rounded-2xl border-2 border-gray-50 hover:border-green-500 hover:bg-green-50 transition-all flex flex-col justify-between h-24">
                      <p className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-lg font-black text-green-600">₹{item.price}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-2/5 p-8 bg-gray-50/50 flex flex-col">
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Select Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                        {["Dining", "Swiggy", "Zomato"].map(plat => (
                            <button key={plat} onClick={() => setSelectedPlatform(plat)} className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all ${selectedPlatform === plat ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-100"}`}>
                                {plat}
                            </button>
                        ))}
                    </div>
                  </div>
                  {selectedPlatform === "Dining" && (
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Table Number</label>
                        <input type="number" placeholder="E.g. 10" className="w-full p-3 rounded-xl border-2 border-white shadow-sm font-black text-xl outline-none" value={newOrder.tableNumber} onChange={(e) => setNewOrder({...newOrder, tableNumber: e.target.value})} />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">Apply Discount (₹)</label>
                    <input type="number" placeholder="0" className="w-full p-3 rounded-xl border-2 border-red-50 text-red-600 shadow-sm font-black text-xl outline-none" value={newOrder.discount} onChange={(e) => setNewOrder({...newOrder, discount: e.target.value})} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto mb-6 pr-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-4">Current Cart</p>
                  {newOrder.items.map(item => (
                    <div key={item.menuId} className="flex justify-between items-center mb-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <div><p className="text-xs font-black">{item.name}</p><p className="text-[10px] text-gray-400">₹{item.price} x {item.qty}</p></div>
                      <span className="font-black text-sm">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-dashed pt-6">
                  <div className="flex justify-between items-end mb-6">
                    <span className="font-black text-gray-400 uppercase text-xs">Final Amount</span>
                    <span className="font-black text-4xl text-gray-900">₹{Math.max(0, newOrder.items.reduce((sum, i) => sum + (i.price * i.qty), 0) - newOrder.discount)}</span>
                  </div>
                  <button onClick={handleCreateManualOrder} className="w-full py-5 bg-green-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all">🚀 Generate Bill & KOT</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
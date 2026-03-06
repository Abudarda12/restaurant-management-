import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRGenerator from "../components/QRGenerator";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    totalRevenue: 0,
  });

  const logout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "login";
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}api/admin/orders`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        // Calculate Revenue from orders marked as 'Served'
        const revenue = data
          .filter((o) => o.status?.toLowerCase() === "served")
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        setStats({
          totalOrders: data.length,
          pending: data.filter((o) => o.status === "Pending").length,
          totalRevenue: revenue,
        });
      })
      .catch((err) => console.error("Error fetching dashboard stats:", err));
  }, []);

  // --- TABLE MAP LOGIC ---
  // Assuming a standard restaurant setup with 10 tables
  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">
            Executive Overview
          </h1>
          <p className="text-gray-500 font-bold">Welcome back, Admin</p>
        </div>
        <button
          onClick={logout}
          className="bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 px-6 py-2 rounded-2xl font-black transition-all shadow-sm"
        >
          Logout
        </button>
      </div>

      

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border-b-8 border-blue-500 transition-transform hover:scale-105">
          <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
            Total Revenue
          </p>
          <h2 className="text-3xl font-black text-gray-900">
            ₹{stats.totalRevenue.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border-b-8 border-orange-500 transition-transform hover:scale-105">
          <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
            Active Orders
          </p>
          <h2 className="text-3xl font-black text-gray-900">{stats.pending}</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border-b-8 border-yellow-500 transition-transform hover:scale-105">
          <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
            Avg. Rating
          </p>
          <h2 className="text-3xl font-black text-gray-900">4.8 / 5</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border-b-8 border-purple-500 transition-transform hover:scale-105">
          <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
            Total Footfall
          </p>
          <h2 className="text-3xl font-black text-gray-900">
            {stats.totalOrders}
          </h2>
        </div>
      </div>

      {/* --- LIVE TABLE FLOOR PLAN --- */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-xl uppercase italic tracking-tighter">
            Live Floor Plan
          </h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Free
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Eating
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Billed
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {tables.map((num) => {
            // Find an active dining order for this table
            const activeOrder = orders.find(
              (o) =>
                o.orderType === "Dining" &&
                Number(o.tableNumber) === num &&
                ["pending", "preparing", "served"].includes(
                  o.status?.toLowerCase(),
                ),
            );

            let statusStyles = "bg-green-50 border-green-200 text-green-700";
            let statusLabel = "Available";

            if (activeOrder) {
              if (activeOrder.status?.toLowerCase() === "served") {
                statusStyles = "bg-blue-50 border-blue-200 text-blue-700";
                statusLabel = "Billed";
              } else {
                statusStyles =
                  "bg-red-50 border-red-200 text-red-700 animate-pulse";
                statusLabel = "Occupied";
              }
            }

            return (
              <div
                key={num}
                className={`${statusStyles} border-2 p-6 rounded-3xl flex flex-col items-center justify-center transition-all hover:shadow-md cursor-default`}
              >
                <span className="text-[9px] font-black uppercase opacity-60 mb-1">
                  {statusLabel}
                </span>
                <h3 className="text-2xl font-black leading-none">T-{num}</h3>
                {activeOrder && (
                  <p className="text-[10px] font-bold mt-2">
                    ₹{activeOrder.totalAmount}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/admin/orders"
          className="flex items-center justify-center p-6 bg-white rounded-3xl shadow-sm hover:bg-green-50 transition border border-gray-100 text-green-700 font-black uppercase text-xs tracking-widest"
        >
          📦 Live Orders
        </Link>
        <Link
          to="/admin/menu"
          className="flex items-center justify-center p-6 bg-white rounded-3xl shadow-sm hover:bg-blue-50 transition border border-gray-100 text-blue-700 font-black uppercase text-xs tracking-widest"
        >
          🍴 Manage Menu
        </Link>
        <Link
          to="/admin/feedback"
          className="flex items-center justify-center p-6 bg-white rounded-3xl shadow-sm hover:bg-yellow-50 transition border border-gray-100 text-yellow-700 font-black uppercase text-xs tracking-widest"
        >
          💬 Reviews
        </Link>
        <Link
          to="/admin/reports"
          className="flex items-center justify-center p-6 bg-white rounded-3xl shadow-sm hover:bg-purple-50 transition border border-gray-100 text-purple-700 font-black uppercase text-xs tracking-widest"
        >
          📈 Analytics
        </Link>
      </div>
      <div className="mb-8">
        <QRGenerator />
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const logout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "admin/login";
  };

  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}api/admin/orders`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // 1. Calculate Revenue from orders marked as 'Served'
        const revenue = data
          .filter((o) => o.status === "Served")
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // 2. Update state with all values
        setStats({
          totalOrders: data.length,
          pending: data.filter((o) => o.status === "Pending").length,
          totalRevenue: revenue,
        });
      })
      .catch((err) => console.error("Error fetching dashboard stats:", err));
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Executive Overview
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* REVENUE CARD */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
          <p className="text-gray-500 text-sm uppercase font-bold">
            Total Revenue
          </p>
          <h2 className="text-3xl font-black">
            ₹{stats.totalRevenue.toLocaleString("en-IN")}
          </h2>
        </div>

        {/* ACTIVE ORDERS CARD */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
          <p className="text-gray-500 text-sm uppercase font-bold">
            Active Orders
          </p>
          <h2 className="text-3xl font-black">{stats.pending}</h2>
        </div>

        {/* AVG RATING CARD */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-500">
          <p className="text-gray-500 text-sm uppercase font-bold">
            Avg. Rating
          </p>
          <h2 className="text-3xl font-black">4.8 / 5</h2>
        </div>

        {/* TOTAL CUSTOMERS CARD */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-500">
          <p className="text-gray-500 text-sm uppercase font-bold">
            Total Customers
          </p>
          <h2 className="text-3xl font-black">{stats.totalOrders}</h2>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/orders"
          className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-green-50 transition border border-green-200 text-green-700 font-bold"
        >
          📦 Live Order Tracking
        </Link>
        <Link
          to="/admin/menu"
          className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-blue-50 transition border border-blue-200 text-blue-700 font-bold"
        >
          🍴 Edit Digital Menu
        </Link>
        <Link
          to="/admin/feedback"
          className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-yellow-50 transition border border-yellow-200 text-yellow-700 font-bold"
        >
          💬 Customer Reviews
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
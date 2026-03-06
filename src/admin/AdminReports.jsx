import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const AdminReports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Default to today's date in local time (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}api/admin/orders`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching report data:", err));
  }, []);

  // Filter orders for the local selected date and status 'Served' (Case Insensitive)
  const dailyOrders = orders.filter((o) => {
    const orderDateLocal = new Date(o.createdAt).toLocaleDateString("en-CA");
    const isServed = o.status?.toLowerCase() === "served";
    return orderDateLocal === selectedDate && isServed;
  });

  // --- CHART LOGIC: Grouping Sales by Platform ---
  const platformStats = dailyOrders.reduce((acc, o) => {
    const type = o.orderType || "Dining";
    acc[type] = (acc[type] || 0) + (Number(o.totalAmount) || 0);
    return acc;
  }, {});

  const chartData = Object.keys(platformStats).map(key => ({
    name: key,
    value: platformStats[key]
  }));

  const COLORS = {
    Dining: "#000000",
    Delivery: "#8B5CF6", 
    Swiggy: "#F97316",   
    Zomato: "#EF4444",   
  };

  const totalGrossRevenue = dailyOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) || 0),
    0
  );
  const baseRevenue = totalGrossRevenue / 1.05;
  const totalGST = totalGrossRevenue - baseRevenue;
  const cgst = totalGST / 2;
  const sgst = totalGST / 2;

  const totalItemsSold = dailyOrders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.qty, 0),
    0
  );

  const downloadCSV = () => {
    const headers = ["Order ID", "Customer", "Type", "Amount", "Time"];
    const rows = dailyOrders.map((o) => [
      o._id.slice(-6).toUpperCase(),
      o.customerName,
      o.orderType,
      o.totalAmount,
      new Date(o.createdAt).toLocaleTimeString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Sales_Report_${selectedDate}.csv`);
    link.click();
  };

  const downloadMonthlyCSV = () => {
    const selectedYearMonth = selectedDate.substring(0, 7);

    const monthlyOrders = orders.filter((o) => {
      const orderMonth = new Date(o.createdAt).toISOString().substring(0, 7);
      return (
        orderMonth === selectedYearMonth && o.status?.toLowerCase() === "served"
      );
    });

    if (monthlyOrders.length === 0)
      return alert("No data found for this month!");

    const headers = [
      "Date",
      "Order ID",
      "Customer",
      "Subtotal",
      "GST (5%)",
      "Total Amount",
    ];

    const rows = monthlyOrders.map((o) => {
      const total = Number(o.totalAmount) || 0;
      const subtotal = (total / 1.05).toFixed(2);
      const gst = (total - subtotal).toFixed(2);

      return [
        new Date(o.createdAt).toLocaleDateString("en-IN"),
        o._id.slice(-6).toUpperCase(),
        o.customerName,
        subtotal,
        gst,
        total,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Monthly_Report_${selectedYearMonth}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold">Generating Report...</div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              to="/admin/dashboard"
              className="text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-black transition"
            >
              ← Dashboard
            </Link>
            <h1 className="text-4xl font-black text-gray-900 mt-2">
              Daily Sales Insights
            </h1>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-3 rounded-xl border-2 border-gray-200 font-bold outline-none focus:border-blue-500 transition shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Card (Full width on mobile, 2/3 on desktop) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
                Gross Collections (Incl. Tax)
              </p>
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                ₹{totalGrossRevenue.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-dashed border-gray-200">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase">Net Sales (Excl. Tax)</p>
                <p className="text-xl font-black text-blue-600">₹{baseRevenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase">Total GST (5%)</p>
                <p className="text-xl font-black text-orange-500">₹{totalGST.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase">Total Orders</p>
                <p className="text-xl font-black text-gray-900">{dailyOrders.length}</p>
              </div>
            </div>
          </div>

          {/* Pie Chart Card (1/3 width on desktop) */}
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-gray-400 text-center">Sales Channel Mix</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-900 text-white p-6 rounded-3xl">
            <h3 className="text-sm font-bold uppercase opacity-60 mb-4">
              Tax Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>CGST (2.5%)</span>
                <span className="font-bold">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (2.5%)</span>
                <span className="font-bold">₹{sgst.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col justify-center items-center text-center">
            <p className="text-gray-400 text-xs font-bold uppercase">
              Items Prepared
            </p>
            <h4 className="text-4xl font-black text-gray-900">
              {totalItemsSold}
            </h4>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">
              Transaction History
            </h3>

            <div className="flex gap-3">
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black hover:bg-blue-100 transition"
              >
                📥 DAILY CSV
              </button>
              <button
                onClick={downloadMonthlyCSV}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black hover:bg-purple-700 shadow-lg shadow-purple-100 transition"
              >
                📅 DOWNLOAD MONTHLY REPORT (GST)
              </button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase">
                <th className="p-4">Time</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Mode</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {dailyOrders.length > 0 ? (
                dailyOrders.map((o) => (
                  <tr key={o._id} className="border-t hover:bg-gray-50/50">
                    <td className="p-4 text-gray-400">
                      {new Date(o.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4 font-bold">{o.customerName}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                        o.orderType === "Swiggy" ? "bg-orange-50 text-orange-600 border-orange-100" : 
                        o.orderType === "Zomato" ? "bg-red-50 text-red-600 border-red-100" : 
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {o.orderType}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black">
                      ₹{o.totalAmount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400">
                    No served orders found for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
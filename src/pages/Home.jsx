import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* Decorative Background Element */}
      <div className="absolute top-0 left-0 w-full h-64 bg-[#EF4F5F] -skew-y-3 -translate-y-12 z-0"></div>

      <div className="z-10 max-w-2xl">
        <h1 className="text-5xl font-black text-white mb-4 drop-shadow-md">
          Restro<span className="text-gray-900">Flow</span>
        </h1>
        <p className="text-gray-100 mb-12 font-medium">
          Smart Dining. Seamless Kitchen Management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CUSTOMER SECTION */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
            <div className="text-4xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Customer</h2>
            <p className="text-gray-500 text-sm mb-6">
              Scan the QR code on your table to browse our digital menu and place an order instantly.
            </p>
            <Link 
              to="/menu" 
              className="w-full py-3 bg-[#EF4F5F] text-white rounded-xl font-bold hover:bg-[#d14350] transition shadow-lg shadow-red-200"
            >
              Order Now
            </Link>
          </div>

          {/* ADMIN SECTION */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
            <div className="text-4xl mb-4">👨‍🍳</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Staff</h2>
            <p className="text-gray-500 text-sm mb-6">
              Manage live orders, update the menu, and track restaurant performance in real-time.
            </p>
            <Link 
              to="/admin/login" 
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg shadow-gray-200"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <p className="mt-12 text-gray-400 text-xs uppercase tracking-widest font-bold">
          Powered by RestroFlow v1.0
          copyright © 2024. All rights reserved.
        </p>
        <p>
            Made with ❤️ by <Link to="https://github.com/abudarda12" className="text-blue-500 hover:underline">Abudarda</Link>
        </p>
      </div>
    </div>
  );
};

export default Home;
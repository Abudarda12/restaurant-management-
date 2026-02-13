import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Visual Element */}
      <div className="mb-8">
        <h1 className="text-9xl font-black text-gray-200 relative">
          404
          <span className="absolute inset-0 flex items-center justify-center text-4xl text-[#EF4F5F] mt-12">
            🍴
          </span>
        </h1>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Oops! Page not found.
      </h2>
      <p className="text-gray-500 max-w-sm mb-8">
        It looks like the page you're looking for has been removed, 
        renamed, or was never on our menu to begin with.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="px-8 py-3 bg-[#EF4F5F] text-white rounded-xl font-bold hover:bg-[#d14350] transition shadow-lg shadow-red-100"
        >
          Go to Home
        </Link>
        <Link
          to="/menu"
          className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition"
        >
          View Menu
        </Link>
      </div>

      {/* Subtle branding */}
      <p className="mt-16 text-gray-400 text-sm italic">
        "Even our best chefs can't find this page!"
      </p>
    </div>
  );
};

export default NotFound;
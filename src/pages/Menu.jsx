import { useEffect, useState } from "react";
import MenuCard from "../components/MenuCard";
import { Link, useSearchParams } from "react-router-dom";
import MenuSkeleton from "../components/MenuSceleton";

const categories = [
  "All",
  "Quick-Snacks",
  "Burger",
  "Pasta",
  "Desserts",
  "Drinks",
  "Gym-Beam",
  "Sandwiches",
  "Eggs",
  "Chinese",
  "Nepali",
  "Beverages",
  "Mocktail & Shakes",
];

const Menu = () => {
  const [customerName, setCustomerName] = useState(
    localStorage.getItem("customerName") || "",
  );
  const [showModal, setShowModal] = useState(
    !localStorage.getItem("customerName"),
  );
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); // --- NEW: Search State ---
  
  const tableNumber = localStorage.getItem("tableNumber");

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    if (name) {
      localStorage.setItem("customerName", name);
      setCustomerName(name);
      setShowModal(false);
    }
  };

  useEffect(() => {
    const table = searchParams.get("table");
    if (table) localStorage.setItem("tableNumber", table);

    setLoading(true);

    let url = `${import.meta.env.VITE_API_URL}api/menu`;
    if (activeCategory !== "All") {
      url += `?category=${encodeURIComponent(activeCategory)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [activeCategory, searchParams]);

  // --- NEW: Filtering Logic (Search + Category) ---
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans">
      {/* --- STICKY TOP HEADER --- */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30 px-4 pt-3 pb-2">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                Ordering to
              </p>
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-1 tracking-tighter">
                📍 Table {tableNumber || "N/A"}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Welcome,</p>
              <p className="text-sm font-bold text-[#EF4F5F]">
                {customerName || "Guest"}
              </p>
            </div>
          </div>

          {/* --- NEW: SEARCH BAR --- */}
          <div className="relative mb-3 group">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
              🔍
            </span>
            <input 
              type="text"
              placeholder="Search for dishes, snacks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#EF4F5F] focus:bg-white transition-all outline-none font-medium"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchTerm(""); // Clear search when switching categories
                }}
                className={`whitespace-nowrap px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                  activeCategory === cat
                    ? "bg-[#EF4F5F] border-[#EF4F5F] text-white shadow-lg shadow-red-100 scale-95"
                    : "bg-white border-gray-100 text-gray-600 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- NAME MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <span className="text-3xl">🍔</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 text-center mb-2">
              Taste Awaits!
            </h2>
            <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
              Just your name and we'll get the kitchen fired up for you.
            </p>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <input
                name="name"
                required
                autoFocus
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus:bg-white focus:border-[#EF4F5F] outline-none transition-all text-center font-bold"
                placeholder="Enter your name"
              />
              <button className="w-full bg-[#EF4F5F] text-white font-black py-4 rounded-2xl shadow-xl shadow-red-200 hover:bg-[#d14350] active:scale-95 transition-all">
                See the Menu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MENU CONTENT --- */}
      <main className="pt-44 px-4 max-w-md mx-auto">
        <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">
          {searchTerm 
            ? `Results for "${searchTerm}"` 
            : activeCategory === "All"
              ? "Today's Specials"
              : activeCategory.replace("-", " ")}
        </h3>

        <div className="grid grid-cols-1 gap-8">
          {loading ? (
            <>
              <MenuSkeleton />
              <MenuSkeleton />
              <MenuSkeleton />
            </>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-20">🍽️</div>
              <p className="text-gray-400 font-bold italic">
                Oops! No dishes found.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item._id} className="relative transition-all duration-300">
                {/* Visual indicator for Out of Stock */}
                {!item.isAvailable && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl">
                      Sold Out
                    </span>
                  </div>
                )}
                <div className={!item.isAvailable ? "grayscale opacity-60 pointer-events-none" : ""}>
                   <MenuCard item={item} />
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* --- FLOATING CART BUTTON --- */}
      <Link
        to="/cart"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 active:scale-90 transition-transform z-40 border border-white/10"
      >
        <span className="bg-[#EF4F5F] p-1.5 rounded-lg text-sm">🛒</span>
        <span className="font-black tracking-wide text-xs uppercase">
          View Your Cart
        </span>
      </Link>
    </div>
  );
};

export default Menu;
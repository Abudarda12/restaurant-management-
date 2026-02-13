import { useEffect, useState } from "react";
import MenuCard from "../components/MenuCard";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const categories = ["All", "Snacks", "Main-Course", "Drinks", "Desserts"];

const Menu = () => {
  const [customerName, setCustomerName] = useState(
    localStorage.getItem("customerName") || "",
  );
  const [showModal, setShowModal] = useState(
    !localStorage.getItem("customerName"),
  );
  const [items, setItems] = useState([]);
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");

  // Handle name submission from the modal
  const handleNameSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    if (name) {
      localStorage.setItem("customerName", name);
      setCustomerName(name);
      setShowModal(false);
    }
  };

  // Fetch menu items on component mount and when activeCategory changes
  useEffect(() => {
    const table = searchParams.get("table");

    let url = `${import.meta.env.VITE_API_URL}api/menu`;
    if (activeCategory !== "All") {
      url += `?category=${encodeURIComponent(activeCategory)}`;
    }
    if (table) {
      localStorage.setItem("tableNumber", table);
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
      });
  }, [activeCategory]);

  return (
    <div className=" bg-gray-100 min-h-screen mb-10  ">
      <div className=" mx-auto  p-1 bg-white rounded shadow  fixed top-0 left-0 right-0 z-10">
        <div className="relative">
          {/* NAME MODAL */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                  Welcome! 👋
                </h2>
                <p className="text-gray-500 text-center text-sm mb-6">
                  Please enter your name so the waiter knows who to bring the
                  food to.
                </p>
                <form onSubmit={handleNameSubmit}>
                  <input
                    name="name"
                    required
                    autoFocus
                    className="w-full border-2 border-gray-100 rounded-xl p-3 mb-4 focus:border-[#EF4F5F] outline-none"
                    placeholder="Your Name (e.g., Rahul)"
                  />
                  <button className="w-full bg-[#EF4F5F] text-white font-bold py-3 rounded-xl hover:shadow-lg transition">
                    Start Ordering
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* REST OF YOUR MENU CONTENT */}
          <h1 className="text-xl p-4">
            Hi, {customerName}! What's on your mind?
          </h1>
        </div>
        {/* CATEGORY TABS */}
        <div className="flex gap-3 overflow-x-auto mb-6 justify-center  ">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full border text-sm  ${
                activeCategory === cat
                  ? "bg-black text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* ITEMS */}
      <div className="p-6 max-w-7xl mx-auto mt-24">
        {items.length === 0 && (
          <p className="text-center">No items available</p>
        )}
        <div className="flex flex-wrap gap-6 justify-center">
          {items.map((item) => (
            <MenuCard key={item._id} item={item} />
          ))}
        </div>
      </div>
      <Link
        to="/cart"
        className="fixed bottom-4 right-4 bg-black text-white px-8 py-4 rounded-full shadow-lg"
      >
        🛒 Cart
      </Link>
    </div>
  );
};

export default Menu;

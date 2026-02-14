import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminMenu = () => {
  const [menu, setMenu] = useState([]);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ name: "", price: "", category: "", image: "" });
  const [isFormOpen, setIsFormOpen] = useState(false); // Toggle for mobile/desktop view

  const token = localStorage.getItem("adminToken");

  const fetchMenu = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}api/admin/menu`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMenu(data);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addItem = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}api/admin/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        image: form.image.trim() === "" ? undefined : form.image,
      }),
    });

    if (res.ok) {
      setForm({ name: "", price: "", category: "", image: "" });
      fetchMenu();
      setIsFormOpen(false);
    } else {
      alert("Failed to add item");
    }
  };

  const categories = ["Quick-Snacks", "Burger", "Pasta", "Desserts", "Drinks", "Gym-Beam", "Sandwiches", "Eggs", "Chinese", "Nepali", "Beverages", "Mocktail & Shakes"];

  const filteredMenu = filter === "All" ? menu : menu.filter((item) => item.category === filter);

  const deleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}api/admin/menu/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setMenu(menu.filter((item) => item._id !== id));
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* HEADER SECTION */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Menu Management</h1>
          </div>
          
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-[#EF4F5F] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-[#d14350] transition-all flex items-center justify-center gap-2"
          >
            {isFormOpen ? "Close Form" : "＋ Add New Item"}
          </button>
        </div>

        {/* CATEGORY FILTER CHIPS */}
        <div className="max-w-7xl mx-auto mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setFilter("All")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all ${filter === "All" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"}`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all ${filter === cat ? "bg-[#EF4F5F] border-[#EF4F5F] text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"}`}
            >
              {cat.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-8">
        
        {/* ADD ITEM FORM - COLLAPSIBLE SIDEBAR STYLE */}
        {isFormOpen && (
          <div className="lg:w-1/3 animate-in fade-in slide-in-from-left duration-300">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 sticky top-44">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#EF4F5F] rounded-full"></span>
                Add Dish Details
              </h2>
              <form onSubmit={addItem} className="flex flex-col gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Dish Name</label>
                  <input name="name" placeholder="e.g. Spicy Chicken Burger" value={form.name} onChange={handleChange} required className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 outline-none focus:border-[#EF4F5F] focus:bg-white transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Price (₹)</label>
                  <input name="price" type="number" placeholder="299" value={form.price} onChange={handleChange} min={0} required className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 outline-none focus:border-[#EF4F5F] focus:bg-white transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} required className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 outline-none focus:border-[#EF4F5F] focus:bg-white transition-all appearance-none">
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat.replace("-", " ")}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Image URL</label>
                  <input name="image" placeholder="https://image-link.com" value={form.image} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 outline-none focus:border-[#EF4F5F] focus:bg-white transition-all" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl mt-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg">
                  Publish to Menu
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MENU ITEMS GRID */}
        <div className={`flex-1 ${!isFormOpen ? 'w-full' : ''}`}>
          {filteredMenu.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-400 font-medium">No items found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMenu.map((item) => (
                <div key={item._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop"} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-700 shadow-sm border border-white/20">
                        {item.category.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-800 leading-tight">{item.name}</h3>
                      <span className="text-green-600 font-black">₹{item.price}</span>
                    </div>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                      <Link
                        to={`/admin/menu/update/${item._id}`}
                        className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteItem(item._id)}
                        className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;
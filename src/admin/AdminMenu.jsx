import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminMenu = () => {
  const [menu, setMenu] = useState([]);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
  });

  const token = localStorage.getItem("adminToken");

  // Fetch menu items
  const fetchMenu = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}api/admin/menu`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setMenu(data);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add item
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
      fetchMenu(); // refresh UI
    } else {
      alert("Failed to add item");
    }
  };

  // Group menu by category
  const categories = ["Quick-Snacks", "Burger", "Pasta", "Desserts", "Tea & Cooffee House", "Gym-Beam", "Sandwiches", "Eggs", "Chinese", "Nepali", "Beverages", "Mocktail & Shakes"];

  const filteredMenu =
    filter === "All" ? menu : menu.filter((item) => item.category === filter);

  // Grouping logic (we group the filtered results)
  const groupedMenu = categories.reduce((acc, category) => {
    acc[category] = filteredMenu.filter((item) => item.category === category);
    return acc;
  }, {});

  //Delete item
  const deleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}api/admin/menu/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          // Update state locally so the item disappears immediately
          setMenu(menu.filter((item) => item._id !== id));
        } else {
          alert("Failed to delete the item.");
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className=" min-h-screen bg-gray-100 flex flex-col items-center gap-6">
      <Link to="/admin/dashboard" className="text-[#EF4F5F] hover:underline">
        Back to Dashboard
      </Link>
      {/* ADD ITEM FORM */}
      <form
        onSubmit={addItem}
        className="w-full  bg-white p-6 rounded shadow flex flex-col gap-2"
      >
        <h1 className="text-xl font-bold">Add New Menu Item</h1>
        <input
          name="name"
          placeholder="Item name"
          value={form.name}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          min={0}
          required
          className="border p-2 rounded"
        />

        <select
          name="category"
          id="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="" disabled>
            Select Category
          </option>
          <option value="Quick-Snacks">Quick Snacks</option>
          <option value="Burger">Burger</option>
          <option value="Pasta">Pasta</option>
          <option value="Desserts">Desserts</option>
          <option value="Tea & Cooffee House">Tea & Cooffee House</option>
          <option value="Gym-Beam">Gym-Beam</option>
          <option value="Sandwiches">Sandwiches</option>
          <option value="Eggs">Eggs</option>
          <option value="Chinese">Chinese</option>
          <option value="Nepali">Nepali</option>
          <option value="Beverages">Beverages</option>
          <option value="Mocktail & Shakes">Mocktail & Shakes</option>
        </select>

        <input
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
          className="border p-2 rounded"
          
        />

        <button
          type="submit"
          className="bg-[#EF4F5F] text-white p-2 rounded hover:bg-[#d14550]"
        >
          Add Item
        </button>
      </form>

      {/* MENU LIST Category */}
      <div className="flex gap-4 bg-white p-4 rounded shadow mb-4 w-full max-w-7xl justify-center">
        <button
          onClick={() => setFilter("All")}
          className={`px-4 py-2 rounded-full border ${filter === "All" ? "bg-[#EF4F5F] text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full border ${filter === cat ? "bg-[#EF4F5F] text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            {cat.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* MENU LIST */}
      <div className="w-full max-w-7xl p-6 flex flex-col gap-10">
        {categories.map(
          (category) =>
            // Show category if it has items AND (filter is "All" or matches this category)
            groupedMenu[category]?.length > 0 && (
              <div key={category} className="category-section">
                <h2 className="text-2xl font-bold border-b-2 border- mb-4 pb-1 uppercase">
                  {category.replace("-", " ")}
                </h2>

                <div className="flex flex-wrap gap-6 justify-start">
                  {groupedMenu[category].map((item) => (
                    <div
                      key={item._id}
                      className="bg-white p-4 rounded shadow flex flex-col items-center gap-2 w-64"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-40 object-cover rounded"
                        />
                      )}
                      <b className="text-lg">{item.name}</b>
                      <p className="text-green-600 font-semibold">
                        ₹{item.price}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <Link
                          to={`/api/admin/menu/${item._id}`}
                          className="text-green-500 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteItem(item._id)}
                          className="text-red-500 hover:underline"
                        >Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
        )}

        {/* Show a message if no items match the filter */}
        {filteredMenu.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No items found in this category.
          </p>
        )}
      </div>
      
    </div>
  );
};

export default AdminMenu;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AdminUpdateMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", price: "", category: "", image: "" });
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    // Fetch current item details
    fetch(`${import.meta.env.VITE_API_URL}api/admin/menu/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setForm(data))
      .catch((err) => console.error(err));
  }, [id, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}api/admin/menu/${id}`, {
      method: "PUT", // or PATCH depending on your API
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Item updated successfully!");
      navigate("/admin/menu");
    } else {
      alert("Failed to update item");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex justify-center">
      <form onSubmit={handleUpdate} className="bg-white p-6 rounded shadow-md w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Edit Menu Item</h1>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
          placeholder="Name"
          required
        />
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 rounded"
          placeholder="Price"
          required
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="Snacks">Snacks</option>
          <option value="Main-course">Main Course</option>
          <option value="Desserts">Desserts</option>
          <option value="Drinks">Drinks</option>
        </select>
        <input
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="border p-2 rounded"
          placeholder="Image URL"
        />
        <button type="submit" className="bg-green-600 text-white p-2 rounded font-bold">
          Save Changes
        </button>
        <button type="button" onClick={() => navigate("/admin/menu")} className="text-gray-500">
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AdminUpdateMenu;
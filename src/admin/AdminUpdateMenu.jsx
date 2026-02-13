import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
const AdminUpdateMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
  });
  const token = localStorage.getItem("adminToken");
  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/admin/menu/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setForm({
        name: data.name,
        price: data.price,
        category: data.category,
        image: data.image,
      });
    };
    fetchItem();
  }, [id, token]);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Update item
  const updateItem = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}api/admin/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
      }),
    });
    if (res.ok) {
      navigate("/admin/menu");
    } else {
      alert("Failed to update item");
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center text-[#EF4F5F]">
        Update Menu Item
      </h2>
      <form onSubmit={updateItem} className="flex flex-col gap-4 mt-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          className="border p-2 rounded "
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
          <option value="Snacks">Snacks</option>
          <option value="Main-course">Main Course</option>
          <option value="Dessert">Dessert</option>
          <option value="Drinks">Drinks</option>
        </select>
        <input
          type="text"
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
          Update Item
        </button>
      </form>
      <button
        onClick={() => navigate("/admin/menu")}
        className="mt-4 text-green-500 hover:underline"
      >
        Back to Menu
      </button>
      <div className="rounded-xl p-3 shadow-sm bg-white flex flex-col items-center justify-between text-center w-1/3 mt-6">
        <p className="text-lg font-bold">{form.name}</p>
        <p className="text-gray-600">{form.price}</p>
        <p className="text-sm text-gray-500">{form.category}</p>
        {form.image && (
          <img
            src={form.image}
            alt={form.name}
            className="w-32 h-32 object-cover mt-2"
          />
        )}
      </div>
    </div>
  );
};

export default AdminUpdateMenu;

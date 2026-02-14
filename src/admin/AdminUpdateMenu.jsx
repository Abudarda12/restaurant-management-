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
  const baseUrl = import.meta.env.VITE_API_URL;
  const endpoints = [
    `${baseUrl}api/admin/menu/${id}`,
    `${baseUrl}api/admin/menu/menu/${id}`,
  ];

  useEffect(() => {
    // Fetch current item details
    const fetchItem = async () => {
      try {
        let res = null;
        for (const endpoint of endpoints) {
          const attempt = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (attempt.ok) {
            res = attempt;
            break;
          }
          if (attempt.status !== 404) {
            res = attempt;
            break;
          }
        }

        if (!res || !res.ok) {
          throw new Error("Failed to fetch item details");
        }
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error(err);
        alert("Could not load item data. It may have been deleted.");
        navigate("/admin/menu");
      }
    };
    fetchItem();
  }, [id, token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      image: form.image,
    };
    try {
      const requestConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      };
      const methods = ["PATCH", "PUT"];
      let res = null;

      for (const endpoint of endpoints) {
        for (const method of methods) {
          const attempt = await fetch(endpoint, {
            ...requestConfig,
            method,
          });
          if (attempt.ok) {
            res = attempt;
            break;
          }
          if (attempt.status !== 404 && attempt.status !== 405) {
            res = attempt;
            break;
          }
        }
        if (res) break;
      }

      if (res?.ok) {
        alert("Item updated successfully!");
        navigate("/admin/menu");
      } else {
        const errorData = await res?.json?.().catch(() => ({}));
        alert(
          `Failed to update item: ${errorData?.message || res?.statusText || "Not Found"}`,
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while updating the item.");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex justify-center">
      <form
        onSubmit={handleUpdate}
        className="bg-white p-6 rounded shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold">Edit Menu Item</h1>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Name"
          required
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Price"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          <option value="Quick-Snacks">Quick Snacks</option>
          <option value="Burger">Burger</option>
          <option value="Pasta">Pasta</option>
          <option value="Desserts">Desserts</option>
          <option value="Drinks">Drinks</option>
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
          value={form.image}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Image URL"
        />
        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded font-bold"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/menu")}
          className="text-gray-500"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AdminUpdateMenu;

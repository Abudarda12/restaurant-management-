import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminSettings = () => {
  const [config, setConfig] = useState({
    restaurantName: "",
    address: "",
    phone: "",
    gstPercentage: 5,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}api/admin/settings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error("Error loading settings"));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(config),
      });
      alert("Settings Updated Successfully!");
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            to="/admin/dashboard"
            className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black"
          >
            ← Back
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mt-2 uppercase italic">
            Store Config
          </h1>
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Restaurant Name */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-lg focus:ring-2 focus:ring-black/5"
                value={config.restaurantName}
                onChange={(e) =>
                  setConfig({ ...config, restaurantName: e.target.value })
                }
              />
            </div>

            {/* GST Rate */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                GST Percentage (%)
              </label>
              <input
                type="number"
                className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-lg focus:ring-2 focus:ring-black/5"
                value={config.gstPercentage}
                onChange={(e) =>
                  setConfig({ ...config, gstPercentage: e.target.value })
                }
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                Business Phone
              </label>
              <input
                type="text"
                className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-lg"
                value={config.phone}
                onChange={(e) =>
                  setConfig({ ...config, phone: e.target.value })
                }
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                Store Address
              </label>
              <input
                type="text"
                className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-lg"
                value={config.address}
                onChange={(e) =>
                  setConfig({ ...config, address: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-orange-400 uppercase block mb-1">
                Swiggy Markup (%)
              </label>
              <input
                type="number"
                className="w-full p-3 rounded-xl bg-gray-50 border-none font-bold"
                value={config.swiggyMarkup}
                onChange={(e) =>
                  setConfig({ ...config, swiggyMarkup: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-red-400 uppercase block mb-1">
                Zomato Markup (%)
              </label>
              <input
                type="number"
                className="w-full p-3 rounded-xl bg-gray-50 border-none font-bold"
                value={config.zomatoMarkup}
                onChange={(e) =>
                  setConfig({ ...config, zomatoMarkup: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-6 border-t border-dashed border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-5 bg-black text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {saving ? "SAVING CHANGES..." : "Update Business Profile"}
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
          SmartMenu POS v2.0 • Secured Engine
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;

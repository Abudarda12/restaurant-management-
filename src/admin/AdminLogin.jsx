import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  

  const login = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("adminToken", data.token);
    window.location.href = "/admin/dashboard";
  } else {
    alert(data.message);
  }
};

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-80 border p-4 rounded">
        <h2 className="text-lg font-bold mb-3">Admin Login</h2>
        <input
          placeholder="Email"
          className="border w-full mb-2 p-2"
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border w-full mb-2 p-2"
          onChange={e => setPassword(e.target.value)}
        />
        <button
          onClick={login}
          className="bg-black text-white w-full py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
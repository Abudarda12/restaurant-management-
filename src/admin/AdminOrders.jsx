import { useEffect, useState } from "react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
      }
    })
      .then(res => res.json())
      .then(setOrders);
  }, []);

  return (
    <div>
      <h2>Orders</h2>
      {orders.map(order => (
        <div key={order._id}>
          Table {order.tableNo} – {order.status}
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
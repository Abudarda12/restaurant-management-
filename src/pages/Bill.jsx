import { useEffect, useState } from "react";

const Bill = () => {
  const tableNumber = localStorage.getItem("tableNumber");
  const [bill, setBill] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/bill/${tableNumber}`)
      .then(res => res.json())
      .then(setBill);
  }, []);

  if (!bill) return <p>Loading...</p>;

  return (
    <div>
      <h2>Table {bill.tableNumber} Bill</h2>
      {bill.items.map((i, idx) => (
        <p key={idx}>{i.name} × {i.qty}</p>
      ))}
      <h3>Total ₹{bill.totalAmount}</h3>

      <button onClick={() => window.location.href="/feedback"}>
        Pay & Feedback
      </button>
    </div>
  );
};

export default Bill;
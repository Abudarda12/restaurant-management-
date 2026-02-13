import React, { use } from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  useEffect(() => {
    // Fetch feedback data from the server (placeholder)
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/feedback`)
      .then((res) => res.json())
      .then((data) => {
        setFeedback(data);
        console.log("Fetched feedback:", data);

      })
      .catch((err) => {
        console.error("Error fetching feedback:", err);
        setFeedback([{ error: "Error fetching feedback" }]);
      });
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-4">Customer Feedback</h1>
      {feedback.length === 0 ? (
        <p>No feedback available.</p>
      ) : ( 
        <ul className="space-y-4 ">
          {feedback.map((item, index) => (
            <li key={index} className="border p-4 rounded">
               <p><strong>Name:</strong> {item.name}</p>
              <p><strong>Table Number:</strong> {item.tableNumber}</p>
              <p><strong>Phone:</strong> {item.phone}</p>
              <p><strong>Rating:</strong> {item.rating} / 5</p>
              <p><strong>Comment:</strong> {item.comment}</p>
            </li>
          ))}
        </ul>
      )}
        <div className="mt-6">
        <Link
          to="/admin/dashboard"
          className="px-4 py-2 bg-[#EF4F5F] text-white rounded hover:bg-[#d14350] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default AdminFeedback;

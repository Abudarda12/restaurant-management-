import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}api/admin/feedback`)
      .then((res) => res.json())
      .then((data) => {
        setFeedback(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching feedback:", err);
        setLoading(false);
      });
  }, []);

  // Calculate Average Rating for the Header
  const avgRating = feedback.length > 0 
    ? (feedback.reduce((sum, f) => sum + Number(f.rating), 0) / feedback.length).toFixed(1) 
    : 0;

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600 bg-green-50";
    if (rating >= 3) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse">LOADING REVIEWS...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Link to="/admin/dashboard" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-all">
              ← Dashboard
            </Link>
            <h1 className="text-4xl font-black text-gray-900 mt-2 italic uppercase">Guest Experience</h1>
          </div>
          
          {/* Summary Stat Card */}
          <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase">Total Reviews</p>
              <p className="text-2xl font-black">{feedback.length}</p>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase">Avg Rating</p>
              <p className="text-2xl font-black text-yellow-500">★ {avgRating}</p>
            </div>
          </div>
        </div>

        {feedback.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Guest Feedback Yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedback.map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col justify-between">
                
                <div>
                  <div className="flex justify-between items-start mb-6">
                    {/* Rating Badge */}
                    <div className={`px-4 py-2 rounded-2xl font-black text-lg ${getRatingColor(item.rating)}`}>
                      {item.rating} <span className="text-xs opacity-60">/ 5</span>
                    </div>
                    {/* Table Info Badge */}
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                      Table #{item.tableNumber || "N/A"}
                    </span>
                  </div>

                  <p className="text-gray-800 font-medium leading-relaxed italic text-lg mb-6">
                    "{item.comment || "No comment provided."}"
                  </p>
                </div>

                <div className="pt-6 border-t border-dashed border-gray-100 mt-auto flex justify-between items-center">
                  <div>
                    <p className="font-black text-gray-900 text-sm uppercase tracking-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase">{item.phone || "No Phone"}</p>
                  </div>
                  {/* Timestamp Placeholder (if your DB has it) */}
                  <span className="text-[9px] font-black text-gray-300 uppercase">
                    Verified Guest
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFeedback;
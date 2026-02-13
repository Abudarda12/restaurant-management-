import { useState } from "react";

const Feedback = () => {
  const tableNumber = localStorage.getItem("tableNumber");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0); // Track hover state for visual feedback
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async () => {
    if (rating === 0) {
      alert("Please select a rating!");
      return;
    }

    await fetch(`${import.meta.env.VITE_API_URL}api/admin/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNumber, rating, comment, name, phone }),
    });

    setSubmitted(true);
    localStorage.removeItem("tableNumber");
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-2xl font-bold text-center text-[#EF4F5F] mb-6">
        Share Your Experience
      </h2>
      
      {!submitted ? (
        <form onSubmit={(e) => { e.preventDefault(); submitFeedback(); }}>
          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg p-2.5 w-full focus:ring-2 focus:ring-[#EF4F5F] outline-none"
              placeholder="Enter your name"
            />
          </div>

          {/* Phone Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded-lg p-2.5 w-full focus:ring-2 focus:ring-[#EF4F5F] outline-none"
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
            />
          </div>

          {/* STAR RATING SECTION */}
          <div className="mb-6 text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">Rate our food & service</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-4xl transition-colors duration-200 ${
                    star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs mt-2 text-gray-500 font-medium italic">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent!"}
              </p>
            )}
          </div>

          {/* Comment Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Any specific comments?</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border rounded-lg p-2.5 w-full h-24 focus:ring-2 focus:ring-[#EF4F5F] outline-none"
              placeholder="Optional"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#EF4F5F] text-white font-bold py-3 rounded-lg hover:bg-[#d14350] transition-colors shadow-md"
          >
            Submit Feedback
          </button>
        </form>
      ) : (
        <div className="text-center py-10">
          <div className="text-6xl mb-4 text-green-500">✓</div>
          <h3 className="text-xl font-bold text-gray-800">Thank You!</h3>
          <p className="text-gray-600 mt-2">Your feedback helps us serve you better.</p>
        </div>
      )}
    </div>
  );
};

export default Feedback;
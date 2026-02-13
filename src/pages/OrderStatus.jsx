import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const OrderStatus = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((o) => o._id === id);
        setOrder(found);
      });
  }, [id]);

  if (!order) {
    return <p className="text-center mt-10">Loading order...</p>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-center text-[#EF4F5F] mb-4">
        Order Status
      </h1>

      <p className="text-center mb-2">
        <strong>Table:</strong> {order.tableNumber}
      </p>

      <p className="text-center mb-4">
        <strong>Status:</strong>{" "}
        <span className="font-semibold">{order.status}</span>
      </p>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Items</h3>
        <ul className="text-sm">
          {order.items.map((item) => (
            <li key={item._id} className="flex items-center mb-2">
              <img
                // Change menuId.image to menuId?.image
                src={item.menuId?.image || "https://via.placeholder.com/300"}
                alt={item.menuId?.name || "Item Unavailable"}
                className="w-16 h-16 object-cover rounded mr-2 inline-block"
              />
              {/* Change menuId.name to menuId?.name */}
              {item.menuId?.name || "Deleted Item"} × {item.qty}
            </li>
          ))}
        </ul>

        <p className="font-bold mt-4">Total: ₹{order.totalAmount}</p>
      </div>
      <div>
        <h1 className="text-center mt-4 text-lg font-semibold">
          Thank you for your order!
        </h1>
        <p className="text-center text-sm text-gray-600">
          Your order is being prepared and will be served shortly. Please wait
          patiently and enjoy your meal once it's ready.
        </p>
        <h1 className="text-center mt-4 text-lg font-semibold">
          Provide your valuable feedback!
        </h1>
        <Link
          to="/feedback"
          className="block text-center text-blue-500 hover:underline"
        >
          Click here to give feedback
        </Link>
      </div>
    </div>
  );
};

export default OrderStatus;

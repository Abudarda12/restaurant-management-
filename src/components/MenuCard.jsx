import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const MenuCard = ({ item }) => {
  const { cart, addToCart, decreaseQty } = useContext(CartContext);
  const current = cart.find((i) => i._id === item._id);

  return (
    <div className="w-100 rounded-xl p-3 shadow-sm bg-white flex flex-col items-center justify-between text-center ">
      <img
        src={item.image || "https://via.placeholder.com/300"}
        alt={item.name}
        className="w-full h-68 object-cover rounded-lg mb-2"
      />

      <h2 className="font-semibold">{item.name}</h2>
      <p className="text-sm text-gray-500">₹{item.price}</p>
      <p className="text-xs text-gray-400 mb-2">{item.category}</p>

      {!current ? (
        <button
          onClick={() => addToCart(item)}
          className="w-full bg-red-700 text-white py-2 rounded-lg text-sm"
        >
          Add to Cart
        </button>
      ) : (
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => decreaseQty(item._id)}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            −
          </button>
          <span>{current.qty}</span>
          <button
            onClick={() => addToCart(item)}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuCard;

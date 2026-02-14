import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const MenuCard = ({ item }) => {
  const { cart, addToCart, decreaseQty } = useContext(CartContext);
  const current = cart.find((i) => i._id === item._id);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
      {/* IMAGE SECTION */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop"}
          alt={item.name}
          loading="lazy" // Native lazy loading
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
          <p className="text-[10px] font-black text-gray-800 uppercase tracking-tighter">
            {item.category.replace("-", " ")}
          </p>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h2 className="font-bold text-gray-800 text-lg leading-tight flex-1">
            {item.name}
          </h2>
          <span className="text-[#EF4F5F] font-black text-lg ml-2">
            ₹{item.price}
          </span>
        </div>
        
        <p className="text-xs text-gray-400 mb-4 line-clamp-2">
          Freshly prepared with the finest ingredients.
        </p>

        {/* ACTION BUTTONS */}
        <div className="mt-auto">
          {!current ? (
            <button
              onClick={() => addToCart(item)}
              className="w-full bg-white border-2 border-gray-100 text-gray-800 py-2 rounded-xl text-sm font-bold hover:border-[#EF4F5F] hover:text-[#EF4F5F] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 border border-gray-100">
              <button
                onClick={() => decreaseQty(item._id)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-red-500 transition-colors"
              >
                <span className="text-xl font-bold">−</span>
              </button>
              
              <span className="font-black text-gray-800">{current.qty}</span>
              
              <button
                onClick={() => addToCart(item)}
                className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-lg shadow-md hover:bg-black transition-colors"
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
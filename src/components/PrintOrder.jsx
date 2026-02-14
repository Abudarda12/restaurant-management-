// components/KOTTemplate.jsx
export default function KOTTemplate({ order }) {
  return (
    <div id="kot-print" className="hidden print:block p-4 w-[80mm] text-black bg-white font-mono text-sm">
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <h2 className="text-xl font-bold">KITCHEN ORDER</h2>
        <p>Order ID: {order._id.slice(-6).toUpperCase()}</p>
        <p className="text-lg">Table: {order.tableNumber}</p>
      </div>
      
      <div className="mb-2">
        <p>User: {order.customerName}</p>
        <p>Time: {new Date(order.createdAt).toLocaleTimeString()}</p>
      </div>

      <table className="w-full border-b border-black mb-2">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left">Item</th>
            <th className="text-right">Qty</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td>{item.menuId?.name || "Unknown"}</td>
              <td className="text-right">{item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="text-center italic text-[10px]">
        *** End of KOT ***
      </div>
    </div>
  );
};

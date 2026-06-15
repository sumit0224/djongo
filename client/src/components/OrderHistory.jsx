import React from "react";

const OrderHistory = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-zinc-950 border border-zinc-900 rounded-lg text-center space-y-4">
        <svg className="w-12 h-12 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">No Orders</p>
        <p className="text-xs text-zinc-600">Your order history is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-wider font-outfit">
          Your Orders
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Review details and tracking statuses of your previous orders.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 space-y-4 transition hover:border-zinc-800/80"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-4 gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                  Order #{order.id}
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono uppercase">
                  {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider block font-bold">Total Amount</span>
                  <span className="text-base font-extrabold text-zinc-100">₹{order.total_amount}</span>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  order.status === "delivered"
                    ? "bg-zinc-900/50 text-emerald-400 border-emerald-950"
                    : "bg-zinc-900/50 text-indigo-400 border-indigo-950"
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Nested items bought */}
            <div className="space-y-2.5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-zinc-900/10 p-3 rounded border border-zinc-900/60"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-zinc-900 rounded flex items-center justify-center font-bold text-zinc-500 text-[10px] border border-zinc-850">
                      {item.product.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">{item.product.name}</span>
                      <span className="text-[10px] text-zinc-500 font-medium mt-0.5 block">₹{item.price} each</span>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 block">Qty: {item.quantity}</span>
                    <span className="text-xs font-bold text-zinc-100 block">₹{item.total_price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;

import React from "react";

const CartSidebar = ({ cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, handleCheckout }) => {
  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop Dim overlay */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Slide-over panel */}
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-900 flex flex-col h-full shadow-2xl">
          {/* Header */}
          <div className="px-4 md:px-6 py-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
            <h3 className="text-lg font-bold text-zinc-100 font-outfit uppercase tracking-wider">
              Your Cart
            </h3>
            <button
              onClick={() => setCartOpen(false)}
              className="text-zinc-400 hover:text-zinc-50 p-2 rounded hover:bg-zinc-900 border border-zinc-950 hover:border-zinc-800 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
            {!cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <svg className="w-12 h-12 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-sm text-zinc-400 font-semibold uppercase tracking-wider">Empty Cart</p>
                <p className="text-xs text-zinc-600">Select items from the catalog to add to your order.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-lg flex flex-col space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-100">{item.product.name}</h4>
                        <span className="text-xs text-zinc-500 font-bold mt-1 block">₹{item.product.price} each</span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1.5 rounded hover:bg-zinc-900/80 transition"
                        title="Remove from Cart"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-900 pt-3">
                      {/* Quantity editors */}
                      <div className="flex items-center space-x-2 bg-zinc-950 border border-zinc-900 rounded p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity, -1, item.product.stock)}
                          disabled={item.quantity <= 1}
                          className={`p-1 rounded text-xs transition ${
                            item.quantity <= 1
                              ? "text-zinc-850 cursor-not-allowed"
                              : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-xs font-bold text-zinc-300 px-2 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity, 1, item.product.stock)}
                          disabled={item.quantity >= item.product.stock}
                          className={`p-1 rounded text-xs transition ${
                            item.quantity >= item.product.stock
                              ? "text-zinc-850 cursor-not-allowed"
                              : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <span className="text-sm font-bold text-zinc-200">
                        ₹{item.total_price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart && cart.items.length > 0 && (
            <div className="px-4 md:px-6 py-5 border-t border-zinc-900 space-y-4 bg-zinc-950">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs text-zinc-500 uppercase tracking-wider font-bold">
                  <span>Subtotal</span>
                  <span className="text-zinc-300">₹{cart.cart_total}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-500 uppercase tracking-wider font-bold">
                  <span>Shipping</span>
                  <span className="text-emerald-500 font-bold uppercase tracking-wider">Free</span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-900 pt-3">
                  <span className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Total</span>
                  <span className="text-xl font-extrabold text-zinc-50">
                    ₹{cart.cart_total}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-widest transition rounded active:scale-[0.98]"
              >
                Place Secure Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;

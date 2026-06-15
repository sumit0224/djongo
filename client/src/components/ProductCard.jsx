import React from "react";

const ProductCard = ({ product, addToCart }) => {
  const imageUrl = product.image
    ? (product.image.startsWith("http") ? product.image : `http://127.0.0.1:8000${product.image}`)
    : null;

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden flex flex-col group transition hover:border-zinc-800">
      {/* Product Image / Fallback Container */}
      <div className="w-full h-48 bg-zinc-900/40 relative overflow-hidden flex items-center justify-center border-b border-zinc-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <svg className="w-10 h-10 text-zinc-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">No Image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-bold text-zinc-50 group-hover:text-zinc-200 transition">
              {product.name}
            </h3>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              product.stock > 0
                ? "bg-zinc-900/50 text-emerald-400 border-emerald-900/60"
                : "bg-zinc-900/50 text-rose-400 border-rose-900/60"
            }`}>
              {product.stock > 0 ? "In Stock" : "Sold Out"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline border-t border-zinc-900 pt-3">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Price</span>
            <span className="text-lg font-black text-zinc-100">
              ₹{product.price}
            </span>
          </div>

          <button
            disabled={product.stock <= 0}
            onClick={() => addToCart(product.id)}
            className={`w-full py-2.5 rounded text-xs font-bold uppercase tracking-wider transition ${
              product.stock > 0
                ? "bg-zinc-50 text-zinc-950 hover:bg-zinc-200 active:scale-[0.98]"
                : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800"
            }`}
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

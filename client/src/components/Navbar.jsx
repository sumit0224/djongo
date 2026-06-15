import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user, activeTab, setActiveTab, cartCount, cartOpen, setCartOpen, handleLogout }) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-900 px-4 md:px-8 py-4 flex justify-between items-center">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded bg-zinc-100 flex items-center justify-center font-bold text-zinc-950 font-outfit">
          A
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-50 font-outfit">
          AuraCart
        </span>
      </div>

      {/* Center Tabs (Visible when user is authenticated) */}
      {user && (
        <nav className="flex space-x-1 bg-zinc-900 p-1 rounded border border-zinc-800/80">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "products"
                ? "bg-zinc-100 text-zinc-950"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "orders"
                ? "bg-zinc-100 text-zinc-950"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            Orders
          </button>
        </nav>
      )}

      {/* Right User Section */}
      <div className="flex items-center space-x-4">
        {/* Cart Toggle Button */}
        {user && (
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded border border-zinc-900 hover:border-zinc-800 transition flex items-center space-x-2"
            title="Toggle Cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs font-bold bg-zinc-100 text-zinc-950 px-1.5 py-0.5 rounded">
              {cartCount}
            </span>
          </button>
        )}

        {/* User Info & Auth Links */}
        {user ? (
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline text-xs font-medium text-zinc-400">
              {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 text-xs font-bold uppercase tracking-wider transition"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-3 py-1.5 text-zinc-400 hover:text-zinc-100 text-xs font-bold uppercase tracking-wider transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold uppercase tracking-wider transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

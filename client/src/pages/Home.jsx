import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import CartSidebar from "../components/CartSidebar";
import OrderHistory from "../components/OrderHistory";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("products"); // "products" or "orders"
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check user profile on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get("/profile/");
        if (profileRes.status === 200) {
          setUser(profileRes.data);
          fetchCart();
          fetchOrders();
        }
      } catch (err) {
        console.log("Not authenticated:", err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
      
      // Fetch products (available to all)
      fetchProducts();
    };

    initApp();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/");
      if (res.status === 200) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart/");
      if (res.status === 200) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/");
      if (res.status === 200) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      alert("Please login to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post("/cart/add/", {
        product_id: productId,
        quantity: 1,
      });

      if (res.status === 200 || res.status === 201) {
        fetchCart();
        alert("Item added to cart successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add to cart");
    }
  };

  const updateQuantity = async (itemId, currentQty, amount, maxStock) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      alert(`Cannot add more. Only ${maxStock} items in stock.`);
      return;
    }

    try {
      const res = await api.patch(`/cart/item/${itemId}/`, {
        quantity: newQty,
      });
      if (res.status === 200) {
        fetchCart();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update quantity");
    }
  };

  const removeFromCart = async (itemId) => {
    if (!window.confirm("Remove this item from your cart?")) return;

    try {
      const res = await api.delete(`/cart/item/${itemId}/`);
      if (res.status === 200) {
        fetchCart();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const res = await api.post("/order/create/");
      if (res.status === 201) {
        alert("Order placed successfully!");
        setCart(null);
        fetchCart();
        fetchOrders();
        fetchProducts(); // Refresh stocks
        setCartOpen(false); // Close cart drawer
        setActiveTab("orders"); // Switch to orders tab
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to place order");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout/");
    } catch (err) {
      console.error("Logout backend notification failed:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setCart(null);
      setOrders([]);
      setCartOpen(false);
      alert("Logged out successfully!");
    }
  };

  const cartCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-outfit">
      {/* Navbar Component */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
        {activeTab === "products" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-wider font-outfit">
                Hardware & Tech
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Carefully curated gear. Solid builds. High performance.
              </p>
            </div>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-zinc-950 border border-zinc-900 rounded-lg text-center space-y-4">
                <svg className="w-12 h-12 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-sm text-zinc-400 font-semibold uppercase tracking-wider">Empty Catalog</p>
                <p className="text-xs text-zinc-600">No products are currently available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <OrderHistory orders={orders} />
        )}
      </main>

      {/* Cart Drawer Component */}
      <CartSidebar
        cart={cart}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        handleCheckout={handleCheckout}
      />

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-6 text-center text-[10px] text-zinc-600 uppercase tracking-wider">
        <p>© 2026 AuraCart. Minimalist E-Commerce. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/register/",
        formData
      );

      if (response.status === 201) {
        alert("User registered successfully!");
        console.log(response.data);
        navigate("/login");
      }
    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(JSON.stringify(error.response.data));
      } else {
        alert("Something went wrong!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 font-outfit">
      <div className="bg-zinc-950 border border-zinc-900 rounded p-8 w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-100">
            Create Account
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Register to shop our hardware catalog
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="first name"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-900 rounded text-zinc-100 text-sm focus:outline-none focus:border-zinc-400 focus:ring-0 placeholder-zinc-800 transition"
              required
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="last name"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-900 rounded text-zinc-100 text-sm focus:outline-none focus:border-zinc-400 focus:ring-0 placeholder-zinc-800 transition"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="username"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-900 rounded text-zinc-100 text-sm focus:outline-none focus:border-zinc-400 focus:ring-0 placeholder-zinc-800 transition"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-900 rounded text-zinc-100 text-sm focus:outline-none focus:border-zinc-400 focus:ring-0 placeholder-zinc-800 transition"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="password"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-900 rounded text-zinc-100 text-sm focus:outline-none focus:border-zinc-400 focus:ring-0 placeholder-zinc-800 transition"
              required
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 py-3 rounded text-xs font-bold uppercase tracking-widest transition active:scale-[0.98] mt-2"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 uppercase tracking-wider">
          Already have an account?{" "}
          <a href="/login" className="text-zinc-100 hover:underline font-bold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
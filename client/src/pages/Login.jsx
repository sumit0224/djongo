import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
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
                "/login/",
                formData
            );

            if (response.status === 200) {
                localStorage.setItem("access_token", response.data.access);
                localStorage.setItem("refresh_token", response.data.refresh);
                
                alert("User logged in successfully!");
                console.log(response.data);
                navigate("/");
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
                        Log In
                    </h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        Enter credentials to access account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                            Username
                        </label>
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

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                            Password
                        </label>
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

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 py-3 rounded text-xs font-bold uppercase tracking-widest transition active:scale-[0.98] mt-2"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-center text-xs text-zinc-500 uppercase tracking-wider">
                    New customer?{" "}
                    <a
                        href="/register"
                        className="text-zinc-100 hover:underline font-bold"
                    >
                        Create account
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
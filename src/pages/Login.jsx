import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import logo from "../assets/logo.png";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7] flex items-center justify-center overflow-hidden relative px-4">

      {/* Blur Effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-black/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />

      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-black/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[40px] p-8 md:p-10">

        {/* Logo */}
        <div className="flex flex-col items-center justify-center text-center mb-10">

          <div className="bg-white p-5 rounded-[30px] shadow-xl mb-2">

            <img
              src={logo}
              alt="Logo"
              className="w-24 h-24 object-contain"
            />

          </div>

          {/* <h1 className="text-4xl font-black tracking-tight text-black">
            Pinanki
          </h1> */}

          <p className="text-gray-950 font-bold text-3xl mt-2">
            Inventory Management
          </p>

        </div>

        {/* Welcome */}
        <div className="mb-8">

          <div className="flex items-center gap-2 mb-3">

            {/* <div className="bg-black text-white p-2 rounded-xl">
              <ShieldCheck size={18} />
            </div>

            <span className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full">
              Secure Login
            </span> */}

          </div>

          {/* <h2 className="text-3xl font-black flex justify-between leading-tight">
            Welcome Back
          </h2> */}

          {/* <p className="text-gray-500 mt-2">
            Login to continue managing your inventory
          </p> */}

        </div>

        {/* Email */}
        <div className="mb-5">

          <label className="text-sm text-gray-500 mb-3 block">
            Email Address
          </label>

          <div className="bg-white border border-gray-200 rounded-3xl px-5 flex items-center focus-within:border-black transition-all duration-300 shadow-sm hover:shadow-lg">

            <Mail
              size={18}
              className="text-gray-400"
            />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-transparent outline-none p-5 text-lg"
            />

          </div>

        </div>

        {/* Password */}
        <div className="mb-8">

          <label className="text-sm text-gray-500 mb-3 block">
            Password
          </label>

          <div className="bg-white border border-gray-200 rounded-3xl px-5 flex items-center focus-within:border-black transition-all duration-300 shadow-sm hover:shadow-lg">

            <Lock
              size={18}
              className="text-gray-400"
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full bg-transparent outline-none p-5 text-lg"
            />

          </div>

        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white py-5 rounded-3xl text-lg font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl"
        >

          {loading
            ? "Logging in..."
            : "Login"}

          {!loading && (
            <ArrowRight size={22} />
          )}

        </button>

      </div>

    </div>
  );
}
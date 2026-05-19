import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useState } from "react";

import { supabase } from "../supabase";

import { Package2, ReceiptText, LogOut, Boxes, Menu, X } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate("/login");
  };

  const navLinks = [
    {
      name: "Products",
      path: "/products",
      icon: <Package2 size={20} />,
    },
    {
      name: "Billing",
      path: "/bill",
      icon: <ReceiptText size={20} />,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-5 left-5 z-50 bg-black text-white p-3 rounded-2xl shadow-xl"
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[280px] bg-white/70 backdrop-blur-2xl border-r border-white/40 shadow-2xl z-50 transition-all duration-300
        
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full p-5">
          {/* Top */}
          <div className="flex items-center justify-between mb-10">
            {/* Logo */}
            <div
              onClick={() => navigate("/products")}
              className="flex items-center gap-3 cursor-pointer group"
            >
              
             <div className="flex flex-col items-center justify-center text-center">

  <img
    src={logo}
    alt="Logo"
    className="w-28 h-28 object-contain"
  />

  <p className="text-2xl font-bold text-black">
    Pinanki Management
  </p>

</div>
            </div>

            {/* Close Mobile */}
            <button onClick={() => setOpen(false)} className="md:hidden">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300
                  
                  ${
                    isActive
                      ? "bg-black text-white shadow-xl"
                      : "text-gray-600 hover:bg-black hover:text-white"
                  }
                  `}
                >
                  <div className="transition group-hover:scale-110">
                    {link.icon}
                  </div>

                  <span className="font-medium text-base">{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

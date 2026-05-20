import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";
import { supabase } from "../supabase";



import {
  Package2,
  ReceiptText,
  Boxes,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
    Wallet,
} from "lucide-react";

export default function Navbar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const links = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: Boxes,
    },
    {
      label: "Products",
      path: "/products",
      icon: Package2,
    },
    {
      label: "Billing",
      path: "/bill",
      icon: ReceiptText,
    },
    {
      label: "Unpaid",
      path: "/unpaid",
      icon: Wallet ,
    }
  ];

  return (
    <>
      {/* MOBILE TOPBAR */}

      <div
        className="
        md:hidden

        fixed
        top-0
        left-0
        right-0

        z-40

        h-16

        bg-white/90
        backdrop-blur-xl

        border-b
        border-zinc-200

        flex
        items-center

        px-4
        "
      >
        <button
          onClick={() => setOpen(true)}
          className="
          p-2

          rounded-xl

          hover:bg-zinc-100

          transition
          "
        >
          <Menu size={24} />
        </button>

        <div
          className="
          flex-1

          flex

          justify-center
          "
        >
          <img
            src={logo}
            alt=""
            className="
            h-8
            object-contain
            "
          />
        </div>
      </div>

      {/* OVERLAY */}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
          fixed
          inset-0

          bg-black/40

          z-40

          md:hidden
          "
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
        fixed

        left-0
        top-0

        h-screen

        bg-white/85
        backdrop-blur-2xl

        border-r
        border-zinc-200

        shadow-xl

        z-50

        flex
        flex-col

        transition-all
        duration-300

        ${collapsed ? "w-[90px]" : "w-[260px]"}

        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* HEADER */}

        <div
          className={`
          p-5

          flex

          ${collapsed ? "flex-col items-center" : "justify-between"}
          `}
        >
          <div
            onClick={() => navigate("/dashboard")}
            className="
            cursor-pointer

            flex
            flex-col

            items-center
            "
          >
            <img
              src={logo}
              alt=""
              className={`
              object-contain

              transition-all

              ${collapsed ? "w-12 h-12" : "w-24 h-24"}
              `}
            />

            {!collapsed && (
              <p
                className="
                text-lg

                font-bold

                mt-2

                text-center
                "
              >
                Pinanki Management
              </p>
            )}
          </div>

          <div
            className="
            flex
            items-center
            "
          >
            {/* DESKTOP */}

            <button
              onClick={() => setCollapsed((v) => !v)}
              className="
              hidden
              md:flex

              w-10
              h-10

              rounded-xl

              items-center
              justify-center

              bg-zinc-100

              hover:bg-black
              hover:text-white

              transition
              "
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>

            {/* MOBILE */}

            <button
              onClick={() => setOpen(false)}
              className="
              md:hidden

              ml-2
              "
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* NAV */}

        <nav
          className="
          flex-1

          px-4

          space-y-3
          "
        >
          {links.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;

            return (
              <Link
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={`

          flex
          items-center

          ${collapsed ? "justify-center" : "gap-4"}

          px-4
          py-4

          rounded-2xl

          transition-all

          ${
            active
              ? `
          bg-black
          text-white
          shadow-lg
          `
              : `
          text-zinc-500

          hover:bg-zinc-100
          `
          }

          `}
              >
                <Icon size={20} />

                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}

        <div
          className="
          p-4
          "
        >
          <button
            onClick={logout}
            className="
            w-full

            bg-red-500

            hover:bg-red-600

            text-white

            py-4

            rounded-2xl

            flex

            items-center
            justify-center

            gap-3

            transition
            "
          >
            <LogOut size={20} />

            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}

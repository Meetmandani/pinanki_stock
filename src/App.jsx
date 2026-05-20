import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Product from "./pages/Product";
import Bill from "./pages/Bill";
import Dashboard from "./pages/Dashboard";

export default function App() {

  const [collapsed, setCollapsed] = useState(false);

  function ProtectedLayout({ children }) {
    return (
      <ProtectedRoute>

        <Navbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main
          className={`
          min-h-screen

          transition-all
          duration-300

          ${
            collapsed
              ? "md:ml-[90px]"
              : "md:ml-[280px]"
          }
          `}
        >
          {children}
        </main>

      </ProtectedRoute>
    );
  }

  return (
    <Routes>

      {/* LOGIN */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* PRODUCTS */}

      <Route
        path="/products"
        element={
          <ProtectedLayout>
            <Product />
          </ProtectedLayout>
        }
      />

      {/* BILLING */}

      <Route
        path="/bill"
        element={
          <ProtectedLayout>
            <Bill />
          </ProtectedLayout>
        }
      />

      {/* DASHBOARD */}

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />

      {/* DEFAULT */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Product from "./pages/Product";
import Bill from "./pages/Bill";
// import ProductDetail from "./pages/ProductDetail";

export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Products */}
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Product />
            </>
          </ProtectedRoute>
        }
      />

      {/* Billing */}
      <Route
        path="/bill"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Bill />
            </>
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/product/:id"
        element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        }
      /> */}

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/products" />} />
    </Routes>
  );
}

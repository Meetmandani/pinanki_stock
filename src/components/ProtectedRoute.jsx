import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

  }, []);

if (loading) {
  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-white
      "
    >
      <div
        className="
        flex
        flex-col
        items-center
        gap-5
        "
      >

        {/* Spinner */}

        <div
          className="
          w-14
          h-14

          border-[4px]
          border-gray-200
          border-t-black

          rounded-full

          animate-spin
          "
        />

        {/* Text */}

        <p
          className="
          text-gray-500
          text-sm
          font-medium
          tracking-wide
          "
        >
          Loading...
        </p>

      </div>
    </div>
  );
}
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
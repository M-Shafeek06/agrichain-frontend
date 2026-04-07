import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();

  const role = localStorage.getItem("role");
  const roleId = localStorage.getItem("roleId");

  /* 🔐 Not logged in */
  if (!role || !roleId) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  /* 🛡 Role-based access control */
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ reason: "UNAUTHORIZED_ROLE" }}
      />
    );
  }

  /* ✅ Access granted */
  return <Outlet />;
}

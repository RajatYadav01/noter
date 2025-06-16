import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoutes() {
  return localStorage.getItem("isLoggedIn") === "true" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
}

export default ProtectedRoutes;

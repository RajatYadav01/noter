import { Navigate, Outlet } from "react-router-dom";

function PublicRoutes() {
  return localStorage.getItem("isLoggedIn") !== "true" ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
}

export default PublicRoutes;

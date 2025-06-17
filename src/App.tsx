import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import PageNotFound from "./pages/PageNotFound";
import UserProfileEditModal from "./components/UserProfileEditModal";
import PublicRoutes from "./pages/PublicRoutes";
import ProtectedRoutes from "./pages/ProtectedRoutes";
import { AuthContextProvider } from "./context/authContext";
import "./App.css";

const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_URL}>
      <AuthContextProvider>
        <Routes>
          <Route
            path="/"
            element={<Home displayOnlyFavouriteNotes={false} />}
          />
          <Route element={<PublicRoutes />}>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route
              path="/favourites"
              element={<Home displayOnlyFavouriteNotes={true} />}
            />
            <Route path="/update-profile" element={<UserProfileEditModal />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <ToastContainer />
      </AuthContextProvider>
    </BrowserRouter>
  );
};

export default App;

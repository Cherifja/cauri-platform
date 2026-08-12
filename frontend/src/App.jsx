import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import { AuthProvider } from "./lib/AuthContext.jsx";
import Home from "./pages/Home.jsx";
import PropertyDetail from "./pages/PropertyDetail.jsx";
import Booking from "./pages/Booking.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import TravelerLogin from "./pages/TravelerLogin.jsx";
import TravelerRegister from "./pages/TravelerRegister.jsx";
import TravelerForgotPassword from "./pages/TravelerForgotPassword.jsx";
import TravelerResetPassword from "./pages/TravelerResetPassword.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Discover from "./pages/Discover.jsx";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen font-body">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/logement/:slug" element={<PropertyDetail />} />
          <Route path="/connexion" element={<TravelerLogin />} />
          <Route path="/inscription" element={<TravelerRegister />} />
          <Route path="/mot-de-passe-oublie" element={<TravelerForgotPassword />} />
          <Route path="/reinitialiser-mot-de-passe" element={<TravelerResetPassword />} />
          <Route
            path="/mes-reservations"
            element={
              <RequireAuth redirectTo="/connexion" requireRole="traveler">
                <MyBookings />
              </RequireAuth>
            }
          />
          <Route
            path="/decouvrir"
            element={
              <RequireAuth redirectTo="/connexion" requireRole="traveler">
                <Discover />
              </RequireAuth>
            }
          />
          <Route
            path="/logement/:slug/reserver"
            element={
              <RequireAuth redirectTo="/connexion" requireRole="traveler">
                <Booking />
              </RequireAuth>
            }
          />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/proprietaire/connexion" element={<Login />} />
          <Route path="/proprietaire/inscription" element={<Register />} />
          <Route path="/proprietaire/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/proprietaire/reinitialiser-mot-de-passe" element={<ResetPassword />} />
          <Route
            path="/proprietaire"
            element={
              <RequireAuth requireRole="owner">
                <OwnerDashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

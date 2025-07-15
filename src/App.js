import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import LoginPage from "./pages/LoginPage";
import ForgotResetPasswordPage from "./pages/ForgotResetPasswordPage";
import SearchPage from "./pages/SearchPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import RequestsPage from "./pages/RequestsPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MyProfilePage from "./pages/MyProfilePage";
import CalendarPage from "./pages/CalendarPage";
import NoticePage from "./pages/NoticePage";
import ContactPage from "./pages/ContactPage";
import PublicContactPage from "./pages/PublicContactPage";
import PaymentsPage from "./pages/PaymentsPage";

function App() {
  const userType = localStorage.getItem("userType");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotResetPasswordPage />} />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={["krisshak", "bhooswami"]}>
              <AppointmentsPage userType={localStorage.getItem("userType")} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute allowedRoles={["krisshak", "bhooswami"]}>
              <RequestsPage userType={localStorage.getItem("userType")} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute allowedRoles={["krisshak", "bhooswami"]}>
              <SearchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["krisshak", "bhooswami"]}>
              <MyProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calender"
          element={
            <ProtectedRoute allowedRoles={["krisshak", "bhooswami"]}>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notice"
          element={
            <ProtectedRoute allowedRoles={["krisshak", "bhooswami", "district_admin", "state_admin"]}>
              <NoticePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute allowedRoles={["krisshak", "bhooswami", "district_admin", "state_admin"]}>
              <ContactPage />
            </ProtectedRoute>
          }
        />
        <Route path="/contact/public" element={<PublicContactPage />} />

        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={["krisshak", "bhooswami"]}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;



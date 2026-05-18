import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ProtectedRoute from "@/components/ProtectedRoute";

const basename = window.location.pathname.startsWith("/~")
  ? `/${window.location.pathname.split("/")[1]}`
  : "/";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <div className="min-h-full flex flex-col bg-neutral-950 text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy loading de páginas para mejorar performance del bundle
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MembersPage = lazy(() => import("@/features/members/pages/MembersPage"));
const FeesPage = lazy(() => import("@/features/fees/pages/FeesPage"));

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-neutral-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}

const basename = window.location.pathname.startsWith("/~")
  ? `/${window.location.pathname.split("/")[1]}`
  : "/";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <div className="min-h-full flex flex-col bg-neutral-950 text-white">
          <Navbar />
          <Suspense fallback={<LoadingFallback />}>
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
              <Route
                path="/members"
                element={
                  <ProtectedRoute>
                    <MembersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fees"
                element={
                  <ProtectedRoute>
                    <FeesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

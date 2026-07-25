import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MembersPage = lazy(() => import("@/features/members/pages/MembersPage"));
const FeesPage = lazy(() => import("@/features/fees/pages/FeesPage"));
const DisciplinesPage = lazy(() => import("@/features/disciplines/pages/DisciplinesPage"));
const DisciplineDetailPage = lazy(() => import("@/features/disciplines/pages/DisciplineDetailPage"));
const GroupDetailPage = lazy(() => import("@/features/disciplines/pages/GroupDetailPage"));
const AttendancePage = lazy(() => import("@/features/attendance/pages/AttendancePage"));

function LoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: "easeInOut" as const }}
        className="flex-1 flex flex-col"
      >
        <Routes location={location}>
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
          <Route
            path="/disciplines"
            element={
              <ProtectedRoute>
                <DisciplinesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disciplines/:id"
            element={
              <ProtectedRoute>
                <DisciplineDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute>
                <GroupDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const basename = window.location.pathname.startsWith("/~")
  ? `/${window.location.pathname.split("/")[1]}`
  : "/";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          <Suspense fallback={<LoadingFallback />}>
            <AnimatedRoutes />
          </Suspense>
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

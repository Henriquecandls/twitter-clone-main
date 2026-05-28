import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "../context/AuthContext";
import { BackofficeTweetsPage } from "../pages/BackofficeTweetsPage";
import { BackofficeUsersPage } from "../pages/BackofficeUsersPage";
import { FeedPage } from "../pages/FeedPage";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

function PrivateRoute({ children }: { children: ReactElement }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: ReactElement }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/feed" replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/feed"
        element={
          <PrivateRoute>
            <FeedPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/backoffice/users"
        element={
          <AdminRoute>
            <BackofficeUsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/backoffice/tweets"
        element={
          <AdminRoute>
            <BackofficeTweetsPage />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

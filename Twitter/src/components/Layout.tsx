import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { Footer } from "./Footer";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-light bg-light border-bottom mb-4">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold">
            Twitter Clone
          </Link>

          <div className="d-flex gap-2 ms-auto align-items-center flex-wrap">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm theme-toggle"
              onClick={() => setDarkMode((v) => !v)}
            >
              {darkMode ? "Modo claro" : "Modo escuro"}
            </button>

            {!user ? (
              <>
                <Link to="/login" className="btn btn-outline-primary btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline-secondary btn-sm">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <Link to="/feed" className="btn btn-outline-primary btn-sm">
                  Feed
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-outline-secondary btn-sm">
                    Backoffice
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="app-main flex-grow-1">
        <div className="container">{children}</div>
      </main>

      <Footer />
    </div>
  );
}

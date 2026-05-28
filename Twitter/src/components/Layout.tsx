import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Twitter Clone</h1>
        <nav>
          <Link to="/">Home</Link>
          {user && <Link to="/feed">Feed</Link>}
          {isAdmin && (
            <>
              <Link to="/backoffice/users">Backoffice Users</Link>
              <Link to="/backoffice/tweets">Backoffice Tweets</Link>
            </>
          )}
          <button type="button" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "Modo escuro" : "Modo Claro"}
          </button>
          {user ? (
            <button type="button" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Registo</Link>
            </>
          )}
        </nav>
      </header>
      <main className="content">{children}</main>
      <footer className="footer">Projeto DWFE/DWBE - 2026</footer>
    </div>
  );
}

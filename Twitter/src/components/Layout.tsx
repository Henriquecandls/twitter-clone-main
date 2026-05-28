import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Twitter Clone</h1>
        <nav>
          <Link to="/">Home</Link>
          {user && <Link to="/feed">Feed</Link>}
          {isAdmin && <Link to="/backoffice/users">Backoffice</Link>}
          {user ? (
            <button onClick={logout}>Logout</button>
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

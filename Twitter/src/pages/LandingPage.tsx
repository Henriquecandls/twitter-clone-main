import { Link, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <Layout>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <h1 className="display-4 mb-3">Join the conversation</h1>
          <p className="lead mb-4">
            Share your thoughts, follow creators, and discover what&apos;s happening right now.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/register" className="btn btn-primary btn-lg">
              Sign up
            </Link>
            <Link to="/login" className="btn btn-outline-secondary btn-lg">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

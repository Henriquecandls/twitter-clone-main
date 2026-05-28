import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (token) {
    return <Navigate to="/feed" replace />;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!username || !email || !password) {
      setError("Preenche todos os campos");
      return;
    }

    try {
      await register(username, email, password);
      navigate("/feed");
    } catch {
      setError("Erro ao criar utilizador");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="mb-3">Signup</h3>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={submit}>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary w-100" type="submit">
                  Signup
                </button>
              </form>
              <p className="mt-3 mb-0 text-muted small">
                Já tens conta? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

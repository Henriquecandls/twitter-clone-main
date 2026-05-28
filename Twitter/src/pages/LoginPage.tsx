import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await login(username, password);
      navigate("/feed");
    } catch (err) {
      setError("Login falhou. Verifique as credenciais e tente novamente.");
    }
  };

  return (
    <Layout>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
        <button type="submit">Entrar</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </Layout>
  );
}

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Tweet, User } from "../types";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "https://twitter-clone-main-ikav.onrender.com";

export function AdminPage() {
  const { user, isAdmin, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "tweets">("users");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isAdmin) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, tweetsRes] = await Promise.all([
          api.get("/users"),
          api.get("/tweets"),
        ]);
        setUsers(usersRes.data);
        setTweets(tweetsRes.data);
      } catch {
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, isAdmin]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="alert alert-danger mt-4">Sem permissões</div>
      </Layout>
    );
  }

  const reloadUsers = async () => {
    const { data } = await api.get("/users");
    setUsers(data);
  };

  const reloadTweets = async () => {
    const { data } = await api.get("/tweets");
    setTweets(data);
  };

  const handleUserFieldChange =
    (id: number, field: keyof User | "password") =>
    async (e: ChangeEvent<HTMLInputElement>) => {
      const value = field === "is_admin" ? e.target.checked : e.target.value;
      const updated = users.map((u) => (u.id === id ? { ...u, [field]: value } : u));
      setUsers(updated);

      const target = updated.find((u) => u.id === id);
      if (!target) return;

      try {
        const payload: Record<string, unknown> = {
          username: target.username,
          email: target.email,
          is_admin: target.is_admin,
        };
        if (field === "password" && e.target.value) {
          payload.password = e.target.value;
        }
        await api.put(`/users/${id}`, payload);
      } catch {
        setError("Erro ao atualizar user");
      }
    };

  const handleDeleteUser = async (id: number) => {
    if (id === user?.id) {
      alert("Não podes apagar a tua conta");
      return;
    }
    if (!window.confirm("Apagar user?")) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Erro ao apagar user");
    }
  };

  const handleTweetFieldChange =
    (id: number, field: "conteudo" | "imagem_url") =>
    async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      const updated = tweets.map((t) => (t.id === id ? { ...t, [field]: value } : t));
      setTweets(updated);

      const target = updated.find((t) => t.id === id);
      if (!target) return;

      try {
        await api.put(`/tweets/${id}`, {
          conteudo: target.conteudo,
          imagem_url: target.imagem_url ?? "",
        });
      } catch {
        setError("Erro ao atualizar tweet");
      }
    };

  const handleDeleteTweet = async (id: number) => {
    if (!window.confirm("Apagar tweet?")) return;
    try {
      await api.delete(`/tweets/${id}`);
      setTweets((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Erro ao apagar tweet");
    }
  };

  const handleAddUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem("newUsername") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("newEmail") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("newPassword") as HTMLInputElement).value.trim();
    const isAdminNew = (form.elements.namedItem("newIsAdmin") as HTMLInputElement).checked;

    if (!username || !email || !password) return;

    try {
      await api.post("/auth/signup", { username, email, password });
      if (isAdminNew) {
        const { data: allUsers } = await api.get("/users");
        const created = allUsers.find((u: User) => u.username === username);
        if (created) {
          await api.put(`/users/${created.id}`, { is_admin: true });
        }
      }
      form.reset();
      await reloadUsers();
    } catch {
      setError("Erro ao criar user");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="mt-4">A carregar...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 className="mb-3">Admin</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <button
        type="button"
        onClick={() => setActiveTab("users")}
        className={`btn btn-sm me-2 ${activeTab === "users" ? "btn-primary" : "btn-outline-primary"}`}
      >
        Users
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("tweets")}
        className={`btn btn-sm ${activeTab === "tweets" ? "btn-secondary" : "btn-outline-secondary"}`}
      >
        Tweets
      </button>

      <hr />

      {activeTab === "users" ? (
        <div>
          <form onSubmit={handleAddUser} className="card card-body mb-3 shadow-sm">
            <h5 className="mb-3">Adicionar utilizador</h5>
            <input
              name="newUsername"
              placeholder="username"
              className="form-control mb-2"
              required
            />
            <input
              name="newEmail"
              placeholder="email"
              type="email"
              className="form-control mb-2"
              required
            />
            <input
              name="newPassword"
              type="password"
              placeholder="password"
              className="form-control mb-2"
              required
            />
            <label className="mb-2">
              <input type="checkbox" name="newIsAdmin" className="me-2" />
              Admin
            </label>
            <button className="btn btn-success" type="submit">
              Add
            </button>
          </form>

          {users.map((u) => (
            <div key={u.id} className="card card-body mb-2 shadow-sm">
              <div className="row g-2 align-items-center">
                <div className="col-md-3">
                  <input
                    className="form-control form-control-sm"
                    value={u.username}
                    onChange={handleUserFieldChange(u.id, "username")}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control form-control-sm"
                    value={u.email ?? ""}
                    onChange={handleUserFieldChange(u.id, "email")}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control form-control-sm"
                    type="password"
                    placeholder="nova password"
                    onBlur={handleUserFieldChange(u.id, "password")}
                  />
                </div>
                <div className="col-md-2">
                  <label className="small">
                    <input
                      type="checkbox"
                      checked={!!u.is_admin}
                      onChange={handleUserFieldChange(u.id, "is_admin")}
                      className="me-1"
                    />
                    Admin
                  </label>
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {tweets.map((t) => (
            <div key={t.id} className="card card-body mb-2 shadow-sm">
              <textarea
                className="form-control mb-2"
                value={t.conteudo}
                onChange={handleTweetFieldChange(t.id, "conteudo")}
                rows={2}
              />
              <input
                className="form-control mb-2"
                value={t.imagem_url ?? ""}
                placeholder="imagem_url"
                onChange={handleTweetFieldChange(t.id, "imagem_url")}
              />
              {t.imagem_url && (
                <img
                  src={
                    t.imagem_url.startsWith("http")
                      ? t.imagem_url
                      : `${API_ORIGIN}${t.imagem_url}`
                  }
                  alt="tweet"
                  className="img-fluid rounded mb-2"
                  style={{ maxHeight: 120 }}
                />
              )}
              <div className="text-muted small mb-2">
                Likes: {t.likes?.length ?? 0} • @{t.autor?.username}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDeleteTweet(t.id)}
              >
                Delete
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline-secondary btn-sm mt-2" onClick={reloadTweets}>
            Recarregar tweets
          </button>
        </div>
      )}

      <button type="button" className="btn btn-outline-secondary btn-sm mt-3" onClick={reloadUsers}>
        Recarregar utilizadores
      </button>
    </Layout>
  );
}

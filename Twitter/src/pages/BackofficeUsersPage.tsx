import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { api } from "../services/api";
import type { User } from "../types";

export function BackofficeUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const loadUsers = async () => {
    const { data } = await api.get("/users");
    setUsers(data);
  };

  const removeUser = async (id: number) => {
    await api.delete(`/users/${id}`);
    loadUsers();
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditUsername(user.username);
    setEditEmail(user.email ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditUsername("");
    setEditEmail("");
  };

  const saveUser = async (id: number) => {
    await api.put(`/users/${id}`, {
      username: editUsername,
      email: editEmail,
    });
    cancelEdit();
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Layout>
      <h2>Backoffice - Utilizadores</h2>
      {users.map((u) => (
        <div key={u.id} className="admin-row">
          {editingId === u.id ? (
            <>
              <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
              <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              <button onClick={() => saveUser(u.id)}>Guardar</button>
              <button onClick={cancelEdit}>Cancelar</button>
            </>
          ) : (
            <>
              <span>{u.username} ({u.email})</span>
              <button onClick={() => startEdit(u)}>Editar</button>
              <button onClick={() => removeUser(u.id)}>Apagar</button>
            </>
          )}
        </div>
      ))}
    </Layout>
  );
}

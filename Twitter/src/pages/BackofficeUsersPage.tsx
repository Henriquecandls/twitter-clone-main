import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { api } from "../services/api";
import type { User } from "../types";

export function BackofficeUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    const { data } = await api.get("/users");
    setUsers(data);
  };

  const removeUser = async (id: number) => {
    await api.delete(`/users/${id}`);
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
          <span>{u.username} ({u.email})</span>
          <button onClick={() => removeUser(u.id)}>Apagar</button>
        </div>
      ))}
    </Layout>
  );
}

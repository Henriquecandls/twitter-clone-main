import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { api } from "../services/api";
import type { Tweet } from "../types";

export function BackofficeTweetsPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const loadTweets = async () => {
    const { data } = await api.get("/tweets");
    setTweets(data);
  };

  const removeTweet = async (id: number) => {
    await api.delete(`/tweets/${id}`);
    loadTweets();
  };

  const startEdit = (tweet: Tweet) => {
    setEditingId(tweet.id);
    setEditContent(tweet.conteudo);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveTweet = async (id: number) => {
    await api.put(`/tweets/${id}`, { conteudo: editContent });
    cancelEdit();
    loadTweets();
  };

  useEffect(() => {
    loadTweets();
  }, []);

  return (
    <Layout>
      <h2>Backoffice - Tweets</h2>
      {tweets.map((t) => (
        <div key={t.id} className="admin-row">
          {editingId === t.id ? (
            <>
              <input value={editContent} onChange={(e) => setEditContent(e.target.value)} />
              <button onClick={() => saveTweet(t.id)}>Guardar</button>
              <button onClick={cancelEdit}>Cancelar</button>
            </>
          ) : (
            <>
              <span>{t.conteudo}</span>
              <button onClick={() => startEdit(t)}>Editar</button>
              <button onClick={() => removeTweet(t.id)}>Apagar</button>
            </>
          )}
        </div>
      ))}
    </Layout>
  );
}

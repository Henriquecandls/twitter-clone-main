import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { api } from "../services/api";
import type { Tweet } from "../types";

export function BackofficeTweetsPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);

  const loadTweets = async () => {
    const { data } = await api.get("/tweets");
    setTweets(data);
  };

  const removeTweet = async (id: number) => {
    await api.delete(`/tweets/${id}`);
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
          <span>{t.conteudo}</span>
          <button onClick={() => removeTweet(t.id)}>Apagar</button>
        </div>
      ))}
    </Layout>
  );
}

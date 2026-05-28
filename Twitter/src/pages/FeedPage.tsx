import { useCallback, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { TweetCard } from "../components/TweetCard";
import { TweetForm } from "../components/TweetForm";
import { api } from "../services/api";
import type { DiscoverUser, Tweet } from "../types";

type FeedMode = "following" | "public";

export function FeedPage() {
  const [feedMode, setFeedMode] = useState<FeedMode>("following");
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [users, setUsers] = useState<DiscoverUser[]>([]);

  const loadFeed = useCallback(async (mode: FeedMode) => {
    const endpoint = mode === "public" ? "/feed/public" : "/feed";
    const { data } = await api.get(endpoint);
    setTweets(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await api.get("/users/discover");
    setUsers(data);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadFeed(feedMode), loadUsers()]);
  }, [loadFeed, loadUsers, feedMode]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const toggleFollow = async (user: DiscoverUser) => {
    if (user.is_following) {
      await api.delete(`/users/${user.id}/follow`);
    } else {
      await api.post(`/users/${user.id}/follow`, {});
    }

    await refreshAll();
  };

  return (
    <Layout>
      <h2>Feed</h2>

      <div className="feed-tabs" role="tablist" aria-label="Tipo de feed">
        <button
          type="button"
          role="tab"
          aria-selected={feedMode === "following"}
          className={feedMode === "following" ? "active" : ""}
          onClick={() => setFeedMode("following")}
        >
          A seguir
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={feedMode === "public"}
          className={feedMode === "public" ? "active" : ""}
          onClick={() => setFeedMode("public")}
        >
          Público
        </button>
      </div>

      <p className="feed-hint">
        {feedMode === "following"
          ? "Tweets de quem segues e os teus."
          : "Todos os tweets de todos os utilizadores."}
      </p>

      <section className="feed-grid">
        <div>
          <TweetForm onCreated={refreshAll} />

          <div className="tweet-list">
            {tweets.length === 0 && (
              <p className="empty-feed">
                {feedMode === "following"
                  ? "Segue utilizadores para ver tweets aqui."
                  : "Ainda não há tweets."}
              </p>
            )}

            {tweets.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                onRefresh={refreshAll}
              />
            ))}
          </div>
        </div>

        <aside className="users-box">
          <h3>Utilizadores</h3>

          {users.length === 0 && (
            <p>Não há outros utilizadores.</p>
          )}

          {users.map((user) => (
            <div key={user.id} className="user-row">
              <span>@{user.username}</span>

              <button
                type="button"
                onClick={() => toggleFollow(user)}
              >
                {user.is_following ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))}
        </aside>
      </section>
    </Layout>
  );
}
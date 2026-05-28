import { useCallback, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { TweetCard } from "../components/TweetCard";
import { TweetForm } from "../components/TweetForm";
import { api } from "../services/api";
import type { DiscoverUser, Tweet } from "../types";

export function FeedPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [users, setUsers] = useState<DiscoverUser[]>([]);

  const loadFeed = useCallback(async () => {
    const token = localStorage.getItem("token");

    const { data } = await api.get("/feed", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setTweets(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const token = localStorage.getItem("token");

    const { data } = await api.get("/users/discover", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUsers(data);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadFeed(), loadUsers()]);
  }, [loadFeed, loadUsers]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const toggleFollow = async (user: DiscoverUser) => {
    const token = localStorage.getItem("token");

    if (user.is_following) {
      await api.delete(`/users/${user.id}/follow`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      await api.post(
        `/users/${user.id}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    await refreshAll();
  };

  return (
    <Layout>
      <h2>Feed</h2>

      <section className="feed-grid">
        <div>
          <TweetForm onCreated={refreshAll} />

          <div className="tweet-list">
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
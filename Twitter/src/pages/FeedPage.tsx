import { useCallback, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { TweetCard } from "../components/TweetCard";
import { TweetForm } from "../components/TweetForm";
import { api } from "../services/api";
import type { DiscoverUser, Tweet } from "../types";

function TweetList({
  tweets,
  emptyMessage,
  onRefresh,
}: {
  tweets: Tweet[];
  emptyMessage: string;
  onRefresh: () => void;
}) {
  if (tweets.length === 0) {
    return <p className="empty-feed">{emptyMessage}</p>;
  }

  return (
    <>
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} onRefresh={onRefresh} />
      ))}
    </>
  );
}

export function FeedPage() {
  const [followingTweets, setFollowingTweets] = useState<Tweet[]>([]);
  const [publicTweets, setPublicTweets] = useState<Tweet[]>([]);
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [publicFeedError, setPublicFeedError] = useState<string | null>(null);

  const loadFollowingFeed = useCallback(async () => {
    const { data } = await api.get("/feed");
    setFollowingTweets(data);
  }, []);

  const loadPublicFeed = useCallback(async () => {
    const endpoints = [
      { url: "/feed", params: { scope: "public" } },
      { url: "/tweets/public" },
      { url: "/feed/public" },
    ];

    let lastError: unknown = null;

    for (const endpoint of endpoints) {
      try {
        const { data } = await api.get(endpoint.url, { params: endpoint.params });
        setPublicTweets(data);
        setPublicFeedError(null);
        return;
      } catch (err) {
        lastError = err;
      }
    }

    const message = (lastError as { response?: { data?: { message?: string } } })?.response
      ?.data?.message;

    setPublicTweets([]);
    setPublicFeedError(
      message ||
        "Atualiza o backend no Render: Manual Deploy → Deploy latest commit."
    );
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await api.get("/users/discover");
    setUsers(data);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadFollowingFeed(), loadPublicFeed(), loadUsers()]);
  }, [loadFollowingFeed, loadPublicFeed, loadUsers]);

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

      <section className="feed-grid">
        <div>
          <TweetForm onCreated={refreshAll} />

          <section className="feed-section">
            <h3>Pessoas que segues</h3>
            <p className="feed-hint">Tweets de quem segues e os teus.</p>
            <div className="tweet-list">
              <TweetList
                tweets={followingTweets}
                emptyMessage="Segue utilizadores para ver tweets aqui."
                onRefresh={refreshAll}
              />
            </div>
          </section>

          <section className="feed-section">
            <h3>Feed público</h3>
            <p className="feed-hint">Todos os tweets de todos os utilizadores.</p>
            {publicFeedError && <p className="feed-error">{publicFeedError}</p>}
            <div className="tweet-list">
              <TweetList
                tweets={publicTweets}
                emptyMessage="Ainda não há tweets."
                onRefresh={refreshAll}
              />
            </div>
          </section>
        </div>

        <aside className="users-box">
          <h3>Utilizadores</h3>

          {users.length === 0 && <p>Não há outros utilizadores.</p>}

          {users.map((user) => (
            <div key={user.id} className="user-row">
              <span>@{user.username}</span>

              <button type="button" onClick={() => toggleFollow(user)}>
                {user.is_following ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))}
        </aside>
      </section>
    </Layout>
  );
}

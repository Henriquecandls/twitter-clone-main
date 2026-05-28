import { useCallback, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { People } from "../components/People";
import { TweetCard } from "../components/TweetCard";
import { TweetForm } from "../components/TweetForm";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { DiscoverUser, Tweet } from "../types";

function TweetList({
  tweets,
  users,
  currentUser,
  emptyMessage,
  onRefresh,
  onToggleFollow,
}: {
  tweets: Tweet[];
  users: DiscoverUser[];
  currentUser: ReturnType<typeof useAuth>["user"];
  emptyMessage: string;
  onRefresh: () => void;
  onToggleFollow: (user: DiscoverUser) => void;
}) {
  if (tweets.length === 0) {
    return <div className="alert alert-info">{emptyMessage}</div>;
  }

  return (
    <>
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          users={users}
          currentUser={currentUser}
          onRefresh={onRefresh}
          onToggleFollow={onToggleFollow}
        />
      ))}
    </>
  );
}

export function FeedPage() {
  const { user } = useAuth();
  const [followingTweets, setFollowingTweets] = useState<Tweet[]>([]);
  const [publicTweets, setPublicTweets] = useState<Tweet[]>([]);
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [publicFeedError, setPublicFeedError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const followedCount = users.filter((u) => u.is_following).length;

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
    setError(null);
    try {
      await Promise.all([loadFollowingFeed(), loadPublicFeed(), loadUsers()]);
    } catch {
      setError("Erro ao carregar o feed. Verifica se a API está a correr.");
    }
  }, [loadFollowingFeed, loadPublicFeed, loadUsers]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const toggleFollow = async (discoverUser: DiscoverUser) => {
    if (discoverUser.is_following) {
      await api.delete(`/users/${discoverUser.id}/follow`);
    } else {
      await api.post(`/users/${discoverUser.id}/follow`, {});
    }
    await refreshAll();
  };

  if (!user) {
    return (
      <Layout>
        <div className="alert alert-warning">Login necessário para ver o feed.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="row gy-4">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-end mb-3 gap-3">
            <div>
              <h2 className="mb-1">Feed</h2>
              <div className="text-muted small">
                Bem-vindo, <span className="fw-semibold">{user.username}</span> • Seguindo{" "}
                {followedCount}
              </div>
            </div>
          </div>

          <TweetForm onCreated={refreshAll} />

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-4">
            <h4 className="mb-3">Tweets dos utilizadores que segues</h4>
            <TweetList
              tweets={followingTweets}
              users={users}
              currentUser={user}
              emptyMessage="O teu feed mostra apenas tweets de utilizadores que segues. Segue alguém para começar a ver tweets."
              onRefresh={refreshAll}
              onToggleFollow={toggleFollow}
            />
          </div>

          <div className="mb-4">
            <h4 className="mb-3">Todos os tweets</h4>
            {publicFeedError && (
              <div className="alert alert-danger feed-error">{publicFeedError}</div>
            )}
            <TweetList
              tweets={publicTweets}
              users={users}
              currentUser={user}
              emptyMessage="Ainda não há tweets para mostrar."
              onRefresh={refreshAll}
              onToggleFollow={toggleFollow}
            />
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: "20px" }}>
            <div className="card-body">
              <h5 className="mb-3">Pessoas</h5>
              <People
                currentUserId={user.id}
                users={users}
                onToggleFollow={toggleFollow}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { api } from "../services/api";
import type { DiscoverUser, Tweet, User } from "../types";
import { Comments } from "./Comments";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "https://twitter-clone-main-ikav.onrender.com";

type Props = {
  tweet: Tweet;
  users: DiscoverUser[];
  currentUser: User | null;
  onRefresh: () => void;
  onToggleFollow: (user: DiscoverUser) => void;
};

export function TweetCard({ tweet, users, currentUser, onRefresh, onToggleFollow }: Props) {
  const likedByMe =
    !!currentUser && !!tweet.likes?.some((like) => like.utilizador_id === currentUser.id);
  const isAuthor = !!currentUser && currentUser.id === tweet.autor?.id;
  const isAdmin = !!currentUser?.is_admin;

  const authorUser = users.find((u) => u.id === tweet.autor?.id);
  const isFollowing = authorUser?.is_following ?? false;
  const showFollow = authorUser && !isAuthor;

  const imageSrc = tweet.imagem_url
    ? tweet.imagem_url.startsWith("http")
      ? tweet.imagem_url
      : `${API_ORIGIN}${tweet.imagem_url}`
    : null;

  const toggleLike = async () => {
    if (likedByMe) {
      await api.delete(`/tweets/${tweet.id}/like`);
    } else {
      await api.post(`/tweets/${tweet.id}/like`);
    }
    onRefresh();
  };

  const deleteTweet = async () => {
    if (!window.confirm("Apagar tweet?")) return;
    await api.delete(`/tweets/${tweet.id}`);
    onRefresh();
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div className="fw-bold">@{tweet.autor?.username ?? "user"}</div>
            {tweet.created_at && (
              <div className="text-muted small">
                {new Date(tweet.created_at).toLocaleString("pt-PT")}
              </div>
            )}
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className={`btn btn-sm ${likedByMe ? "btn-primary" : "btn-outline-primary"}`}
              onClick={toggleLike}
            >
              {likedByMe ? "Unlike" : "Like"}
            </button>

            {showFollow && authorUser && (
              <button
                type="button"
                className={`btn btn-sm ${isFollowing ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => onToggleFollow(authorUser)}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}

            {(isAuthor || isAdmin) && (
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={deleteTweet}>
                Apagar
              </button>
            )}
          </div>
        </div>

        <p className="mt-3 mb-3">{tweet.conteudo}</p>

        {imageSrc && (
          <img
            src={imageSrc}
            alt={`Imagem do tweet de ${tweet.autor?.username}`}
            className="img-fluid rounded mb-3"
            style={{ maxHeight: 240, objectFit: "cover" }}
          />
        )}

        <div className="text-muted small">Likes: {tweet.likes?.length ?? 0}</div>

        <Comments
          tweetId={tweet.id}
          comments={tweet.comments ?? []}
          onCommentAdded={onRefresh}
        />
      </div>
    </div>
  );
}

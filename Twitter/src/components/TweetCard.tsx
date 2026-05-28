import { useState } from "react";
import { api } from "../services/api";
import type { Tweet, User } from "../types";

export function TweetCard({ tweet, onRefresh }: { tweet: Tweet; onRefresh: () => void }) {
  const [comment, setComment] = useState("");

  const rawUser = localStorage.getItem("user");
  const currentUser: User | null = rawUser ? JSON.parse(rawUser) : null;

  const likedByMe = !!currentUser && !!tweet.likes?.some((like) => like.utilizador_id === currentUser.id);

  const toggleLike = async () => {
    if (likedByMe) {
      await api.delete(`/tweets/${tweet.id}/like`);
    } else {
      await api.post(`/tweets/${tweet.id}/like`);
    }

    onRefresh();
  };

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault();

    const text = comment.trim();
    if (!text) return;

    await api.post(`/tweets/${tweet.id}/comments`, { conteudo: text });
    setComment("");
    onRefresh();
  };

  return (
    <article className="tweet-card">
      <p>
        <strong>@{tweet.autor?.username ?? "user"}</strong>
      </p>

      <p>{tweet.conteudo}</p>

      {tweet.imagem_url && (
        <img
          src={`${import.meta.env.VITE_API_ORIGIN || "http://localhost:3000"}${tweet.imagem_url}`}
          alt="tweet"
        />
      )}

      <div className="tweet-actions">
        <button type="button" onClick={toggleLike}>
          {likedByMe ? "Unlike" : "Like"} ({tweet.likes?.length ?? 0})
        </button>
        <span>Comentários: {tweet.comments?.length ?? 0}</span>
      </div>

      <div className="comments">
        {tweet.comments?.map((comment) => (
          <p key={comment.id} className="comment">
            <strong>@{comment.autor?.username ?? "user"}:</strong> {comment.conteudo}
          </p>
        ))}
      </div>

      <form onSubmit={submitComment} className="comment-form">
        <input
          value={comment}
          maxLength={280}
          placeholder="Escreve um comentário..."
          onChange={(event) => setComment(event.target.value)}
        />
        <button type="submit">Comentar</button>
      </form>
    </article>
  );
}

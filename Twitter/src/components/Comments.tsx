import { useState, type FormEvent } from "react";
import { api } from "../services/api";
import type { Comment } from "../types";

type Props = {
  tweetId: number;
  comments: Comment[];
  onCommentAdded: () => void;
};

export function Comments({ tweetId, comments, onCommentAdded }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitComment = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const message = commentText.trim();
    if (!message) {
      setError("Escreve um comentário");
      return;
    }
    if (message.length > 280) {
      setError("O comentário não pode exceder 280 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/tweets/${tweetId}/comments`, { conteudo: message });
      setCommentText("");
      onCommentAdded();
    } catch {
      setError("Erro ao adicionar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 border-top pt-3">
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={() => setShowComments(!showComments)}
      >
        Comentários ({comments.length})
      </button>

      {showComments && (
        <div className="mt-3">
          <form onSubmit={handleSubmitComment} className="mb-3">
            <textarea
              className="form-control form-control-sm mb-2"
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Adiciona um comentário..."
              disabled={isSubmitting}
            />
            {error && <div className="alert alert-danger py-2 small mb-2">{error}</div>}
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? "A enviar..." : "Comentar"}
            </button>
          </form>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {comments.length === 0 ? (
              <div className="text-muted small">
                Sem comentários ainda. Sê o primeiro a comentar!
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="card mb-2"
                  style={{ borderRadius: "0.5rem" }}
                >
                  <div className="card-body p-2">
                    <div className="d-flex justify-content-between">
                      <strong className="small">
                        @{comment.autor?.username ?? "user"}
                      </strong>
                      {comment.created_at && (
                        <small className="text-muted">
                          {new Date(comment.created_at).toLocaleDateString("pt-PT")}
                        </small>
                      )}
                    </div>
                    <p className="small mb-0 mt-1">{comment.conteudo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

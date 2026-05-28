import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "https://twitter-clone-main-ikav.onrender.com";

export function TweetForm({ onCreated }: { onCreated: () => void }) {
  const [conteudo, setConteudo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadImageFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const message = conteudo.trim();
    if (!message) {
      setError("Escreve uma mensagem antes de postar");
      return;
    }
    if (message.length > 280) {
      setError("A mensagem não pode exceder 280 caracteres");
      return;
    }

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("conteudo", message);
        formData.append("image", imageFile);
        await api.post("/tweets", formData);
      } else {
        await api.post("/tweets", {
          conteudo: message,
          ...(imageUrl.trim() ? { imagem_url: imageUrl.trim() } : {}),
        });
      }

      setConteudo("");
      setImageUrl("");
      setImageFile(null);
      setPreview(null);
      onCreated();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      setError("Erro ao publicar tweet.");
    }
  };

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">O que estás a pensar?</label>
            <textarea
              className="form-control"
              rows={3}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreve o teu tweet..."
              maxLength={280}
            />
            <small className="text-muted">{conteudo.length}/280</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Imagem (URL ou upload)</label>
            <input
              className="form-control mb-2"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageFile(null);
                setPreview(e.target.value || null);
              }}
              placeholder="URL da imagem"
              disabled={!!imageFile}
            />
            <input
              className="form-control"
              type="file"
              accept="image/*"
              onChange={loadImageFile}
            />
          </div>
          {preview && (
            <img
              src={
                preview.startsWith("data:") || preview.startsWith("http")
                  ? preview
                  : `${API_ORIGIN}${preview}`
              }
              alt="Pré-visualização"
              className="img-fluid rounded mb-3"
              style={{ maxHeight: 240, objectFit: "cover" }}
            />
          )}
          {error && <div className="alert alert-danger">{error}</div>}
          <button className="btn btn-primary" type="submit">
            Publicar
          </button>
        </form>
      </div>
    </div>
  );
}

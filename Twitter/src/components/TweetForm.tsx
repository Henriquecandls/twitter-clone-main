import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export function TweetForm({ onCreated }: { onCreated: () => void }) {
  const [conteudo, setConteudo] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("conteudo", conteudo);
      if (image) formData.append("image", image);
      await api.post("/tweets", formData);
      setConteudo("");
      setImage(null);
      onCreated();
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      throw error;
    }
  };

  return (
    <form onSubmit={submit} className="tweet-form">
      <textarea maxLength={280} value={conteudo} onChange={(e) => setConteudo(e.target.value)} required />
      <small>{conteudo.length}/280</small>
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
      <button type="submit">Publicar</button>
    </form>
  );
}

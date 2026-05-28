export interface User {
  id: number;
  username: string;
  email?: string;
  is_admin: boolean;
}

export interface DiscoverUser extends User {
  is_following: boolean;
}

export interface Comment {
  id: number;
  conteudo: string;
  autor?: { id: number; username: string };
  created_at?: string;
}

export interface Like {
  utilizador_id: number;
  tweet_id: number;
  created_at?: string;
}

export interface Tweet {
  id: number;
  conteudo: string;
  imagem_url?: string | null;
  autor?: { id: number; username: string };
  likes?: Like[];
  comments?: Comment[];
  created_at?: string;
}

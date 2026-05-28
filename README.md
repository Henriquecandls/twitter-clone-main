# Twitter Clone - Projeto Final

## Arquitetura
- **Frontend**: React + Vite (SPA), deploy em GitHub Pages.
- **Backend**: Node.js + Express (MVC) + Sequelize, deploy em Render.
- **Base de dados**: MySQL em Aiven.

## Backend
Local: `Backend/app`

### Variáveis de ambiente
Copiar `.env.example` para `.env` e preencher com os dados do Aiven.

### Correr localmente
```bash
cd Backend/app
npm install
npm start
```

### Endpoints principais
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/feed`
- `POST /api/tweets`
- `POST /api/tweets/:id/like`
- `POST /api/tweets/:id/comments`
- `GET /api/users` (admin)

Swagger: `GET /api-docs`

## Frontend
Local: `Frontend/Twitter`

```bash
cd Frontend/Twitter
npm install
npm run dev
```

## Deploy
- **Render** (API): configurar as variáveis de ambiente do backend.
- **GitHub Pages** (SPA): definir `VITE_API_URL` para a URL do Render + `/api`, e correr `npm run deploy` no frontend.

## Nota importante de segurança
Se o `.env` tiver sido partilhado com credenciais reais, deve:
1. Rodar password da BD no Aiven.
2. Gerar novo `JWT_SECRET`.
3. Confirmar que `.env` está ignorado pelo Git.

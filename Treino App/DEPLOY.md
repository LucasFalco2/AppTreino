# Deploy — Render + Supabase

1. Crie um PostgreSQL no Supabase e copie a Connection String em **Connect**.
2. Suba este projeto para um repositório GitHub.
3. No Render, crie um Web Service a partir do repositório.
4. O `render.yaml` já contém os comandos principais.
5. Configure as variáveis de ambiente:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://SEU-APP.onrender.com`
   - `PUBLIC_API_URL=https://SEU-APP.onrender.com`
   - `WHATSAPP_ADMIN=554198996206`
   - `PIX_KEY=11151101958`
   - `PIX_KEY_DISPLAY=111.511.019-58`
   - `PIX_MERCHANT_NAME=Lucas Falco`
   - `PIX_MERCHANT_CITY=CURITIBA`
6. Não coloque `.env` no GitHub.
7. Para vídeos e fotos sobreviverem a reinícios/deploys, configure um Persistent Disk no Render montado em:
   `/opt/render/project/src/backend/uploads`
8. Acesse `/api/health` para conferir se a API está funcionando.

### Teste local

Backend:
```bash
cd backend
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run seed
npm start
```

Frontend, em outro terminal:
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

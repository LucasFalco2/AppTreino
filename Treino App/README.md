# Lucas Falco Training — versão corrigida

## O que foi corrigido

- Botão "Conhecer os planos" direcionando para `/planos`.
- Checkout com chave PIX exibida diretamente, sem QR Code.
- Chave PIX: `111.511.019-58` — Lucas Falco.
- WhatsApp configurado para o número informado.
- Correções nas páginas administrativas de Assinaturas, Pagamentos, Feedbacks e Alimentos.
- Error Boundary para evitar tela preta quando o React encontra um erro.
- Correção das URLs dos vídeos dos exercícios quando frontend e backend estão em servidores diferentes.
- Upload de vídeo com tratamento de erro/sucesso.
- Vídeos publicados em `/uploads/videos`.
- Fotos de progresso continuam protegidas.
- Validação de propriedade dos exercícios ao registrar carga.
- Validações adicionais de autenticação, notificações, metas, cupons e pagamentos.
- JWT permanece somente no cookie HttpOnly.
- Preparação para deploy no Render.
- `prisma:deploy` disponível no backend.

## Rodar localmente

### 1. Backend

Abra um terminal:

```bash
cd backend
npm install
copy .env.example .env
```

No Linux/macOS, use `cp .env.example .env`.

Edite `backend/.env` e configure pelo menos:

```env
DATABASE_URL="SUA_CONNECTION_STRING_DO_POSTGRES"
JWT_SECRET="uma-chave-secreta-forte"
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
PUBLIC_API_URL="http://localhost:4000"
```

Depois:

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
npm start
```

Para criar os alunos de demonstração, coloque temporariamente no `.env`:

```env
SEED_DEMO=true
```

e rode:

```bash
npm run seed
```

Depois pode voltar para:

```env
SEED_DEMO=false
```

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
copy .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

O `.env` deve conter:

```env
VITE_API_URL=http://localhost:4000/api
```

Depois:

```bash
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente:

`http://localhost:5173`

## Usuários de teste

Aluno 1:

- Email: `aluno1@teste.com`
- Senha: `Aluno@123`

Admin:

- Email: `lucas@lucasfalcotraining.com`
- Senha: `Admin@123`

## Vídeos

Para desenvolvimento local, mantenha:

```env
PUBLIC_API_URL=http://localhost:4000
```

O arquivo enviado pelo admin ficará em:

```text
backend/uploads/videos/
```

Não apague essa pasta se quiser manter os vídeos.

## Deploy

Consulte `DEPLOY.md` para as instruções de Render + Supabase.

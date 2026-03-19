# Sequência correta — Deploy no Vercel sem erros

Execute na ordem exata abaixo.

---

## 1. Atualizar dependências localmente

```powershell
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
npm install
```

---

## 2. Testar build local

```powershell
npm run build
```

Se aparecer erro, corrija antes de continuar. Se passar, prossiga.

---

## 3. Configurar variáveis no Vercel (antes do deploy)

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique no projeto **Estacionamento** (ou crie se ainda não existir)
4. Vá em **Settings** → **Environment Variables**
5. Adicione estas 3 variáveis:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

6. Clique em **Save** em cada uma

**Onde pegar os valores:** Supabase → Project Settings → API → Project URL, anon key, service_role key

---

## 4. Enviar código para o GitHub

```powershell
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git status
git commit -m "Deploy - Next.js atualizado e configurado"
git push origin main
```

---

## 5. Deploy no Vercel

1. Acesse: https://vercel.com
2. Se o projeto ainda não foi criado:
   - **Add New** → **Project**
   - Importe **allessandrolyra/Estacionamento**
   - **Configure as variáveis** (Passo 3) antes de clicar em Deploy
3. Se o projeto já existe:
   - O deploy roda automaticamente após o `git push`
   - Ou clique em **Deployments** → **Redeploy** (último deploy)

---

## 6. Conferir o deploy

1. Vercel → **Deployments** → clique no deploy mais recente
2. Status **Ready** = sucesso
3. Clique no link para abrir o site

---

## Resumo — comandos em sequência

```powershell
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
npm install
npm run build
git add .
git commit -m "Deploy - Next.js atualizado e configurado"
git push origin main
```

**Importante:** Configure as variáveis no Vercel (Passo 3) antes de fazer o push.

---

## Checklist

- [ ] `npm install` executado
- [ ] `npm run build` passou sem erro
- [ ] Variáveis configuradas no Vercel (Settings → Environment Variables)
- [ ] `git push` executado
- [ ] Deploy concluído com sucesso (Ready)

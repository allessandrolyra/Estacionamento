# Comandos completos — Projeto no ar (GitHub + Web)

**Objetivo:** Colocar o sistema de estacionamento no ar usando GitHub e plano gratuito.

---

## Visão geral

| Etapa | Ferramenta | Custo |
|-------|------------|-------|
| Código + CI | GitHub | Grátis |
| Hospedagem | Vercel | Grátis |
| Banco + Auth | Supabase | Grátis |

---

## Parte 1 — Git e GitHub

### 1.1 Abrir o terminal na pasta do projeto

```powershell
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
```

### 1.2 Inicializar Git (se ainda não tiver)

```powershell
git init
```

### 1.3 Configurar usuário (primeira vez)

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

### 1.4 Adicionar arquivos e fazer commit

```powershell
git add .
git status
git commit -m "Projeto completo - Estacionamento Next.js + Supabase"
```

### 1.5 Conectar ao repositório e enviar

```powershell
git remote add origin https://github.com/allessandrolyra/Estacionamento.git
git branch -M main
git push -u origin main
```

---

## Parte 2 — Configurar GitHub (no navegador)

### 2.1 Criar os Secrets

1. Acesse: https://github.com/allessandrolyra/Estacionamento/settings/secrets/actions
2. Clique em **New repository secret**
3. Crie estes 3 secrets:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role (para gestão de usuários) |

---

## Parte 3 — Deploy na Vercel (site no ar)

### 3.1 Conectar o repositório

1. Acesse: https://vercel.com
2. Faça login com **GitHub**
3. Clique em **Add New** → **Project**
4. Selecione **allessandrolyra/Estacionamento**
5. Clique em **Import**

### 3.2 Configurar variáveis de ambiente

Na tela de import, em **Environment Variables**, adicione:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sua URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sua anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Sua service_role key |

### 3.3 Deploy

Clique em **Deploy**. Em 1–2 minutos o site estará no ar.

### 3.4 URL do site

Após o deploy: `https://estacionamento-xxx.vercel.app` (ou domínio customizado).

---

## Parte 4 — Comandos resumidos (copiar e colar)

```powershell
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git init
git add .
git commit -m "Projeto completo - Estacionamento Next.js + Supabase"
git remote add origin https://github.com/allessandrolyra/Estacionamento.git
git branch -M main
git push -u origin main
```

Depois: configurar Secrets no GitHub e conectar o projeto na Vercel.

---

## Parte 5 — Atualizações futuras

Sempre que alterar o código:

```powershell
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git commit -m "Descrição da alteração"
git push origin main
```

- **GitHub Actions:** roda CI (lint + build)
- **Vercel:** faz deploy automático do site

---

## Checklist final

- [ ] Código no GitHub
- [ ] Secrets configurados no GitHub
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente na Vercel
- [ ] Deploy concluído
- [ ] Site acessível na URL da Vercel
- [ ] Primeiro admin criado (`npm run seed:admin` local ou no Supabase Dashboard)

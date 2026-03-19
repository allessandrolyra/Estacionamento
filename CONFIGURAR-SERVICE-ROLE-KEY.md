# Passo a passo — Configurar SUPABASE_SERVICE_ROLE_KEY no Vercel

**Objetivo:** Resolver o erro "Erro ao listar usuários" em Admin > Gestão de usuários.

---

## Passo 1 — Obter a chave no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Selecione o projeto do **Estacionamento**
3. No menu lateral, clique em **Project Settings** (ícone de engrenagem)
4. Clique em **API** no submenu
5. Na seção **Project API keys**, localize **service_role**
6. Clique em **Reveal** para exibir a chave
7. Clique no ícone de **copiar** para copiar a chave completa  
   (a chave começa com `eyJ...` e é longa)

---

## Passo 2 — Adicionar a variável no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Selecione o projeto **Estacionamento** (ou o nome do seu projeto)
3. Clique em **Settings** (Configurações)
4. No menu lateral, clique em **Environment Variables**
5. Em **Key**, digite exatamente:
   ```
   SUPABASE_SERVICE_ROLE_KEY
   ```
6. Em **Value**, cole a chave copiada do Supabase (a que começa com `eyJ...`)
7. Marque as três opções:
   - Production
   - Preview
   - Development
8. Clique em **Save**

---

## Passo 3 — Fazer o redeploy

1. Ainda no Vercel, vá em **Deployments**
2. Clique nos três pontinhos (⋮) do último deploy
3. Clique em **Redeploy**
4. Confirme em **Redeploy**
5. Aguarde o deploy finalizar (1–2 minutos)

---

## Passo 4 — Testar

1. Acesse o site (URL da Vercel)
2. Faça login como Admin
3. Vá em **Admin** → **Usuários**
4. A lista de usuários deve carregar sem erro

---

## Resumo visual

```
Supabase                          Vercel
─────────                         ──────
Project Settings  →  API  →       Settings  →  Environment Variables
service_role [Reveal] [Copy]  →   Key: SUPABASE_SERVICE_ROLE_KEY
                                  Value: [colar chave]
                                  Save  →  Redeploy
```

---

## Importante

- **Nunca** compartilhe a `service_role` — ela dá acesso total ao projeto
- **Não** use essa chave no frontend — apenas no servidor (Vercel)
- A chave fica oculta nas variáveis de ambiente do Vercel

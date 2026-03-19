# Resolver lista de usuários — Passo a passo definitivo

**Problema:** "Erro ao listar usuários" ou "Database error finding users"

**Solução:** Usar função SQL em vez da API Admin do Supabase.

---

## Passo 1 — Executar o SQL no Supabase

1. Acesse [supabase.com](https://supabase.com) → seu projeto
2. Clique em **SQL Editor** no menu lateral
3. Clique em **New query**
4. Abra o arquivo `supabase/FUNCAO-LISTAR-USUARIOS.sql` do projeto
5. **Copie todo o conteúdo** e cole no editor
6. Clique em **Run** (ou Ctrl+Enter)
7. Deve aparecer **Success** em verde

---

## Passo 2 — Conferir se a função foi criada

1. No Supabase, vá em **Database** → **Functions**
2. Procure por `get_users_for_admin`
3. Se aparecer, a função foi criada corretamente

---

## Passo 3 — Testar no site

1. Acesse o site (Vercel)
2. Faça login como Admin
3. Vá em **Admin** → **Usuários**
4. A lista de usuários deve carregar

---

## O que mudou

| Antes | Depois |
|-------|--------|
| Usava `auth.admin.listUsers()` (API) | Usa função SQL `get_users_for_admin()` |
| Dependia de `SUPABASE_SERVICE_ROLE_KEY` | Não precisa da service_role para listar |
| Erro "Database error finding users" | Lista funciona via SQL direto |

---

## Observação

- **Listar usuários:** usa a função SQL (não precisa de service_role)
- **Criar, excluir, alterar senha:** ainda usam a API Admin (precisam de `SUPABASE_SERVICE_ROLE_KEY` no Vercel)

Se criar/excluir usuários der erro, configure a `SUPABASE_SERVICE_ROLE_KEY` conforme `CONFIGURAR-SERVICE-ROLE-KEY.md`.

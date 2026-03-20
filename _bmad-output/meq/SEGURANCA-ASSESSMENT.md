# Avaliação de Segurança — Sistema de Estacionamento

**Time MEQ** | Documento para suporte ao time de segurança

---

## 1. Objetivo

Este documento descreve as medidas de segurança implementadas e identifica pontos para revisão pelo time de segurança. Use-o como base para auditoria e validação contra invasões.

---

## 2. Medidas de Segurança Implementadas

### 2.1 Autenticação

| Item | Implementação |
|------|---------------|
| **Provedor** | Supabase Auth (JWT, sessões) |
| **Login** | `signInWithPassword` — email + senha |
| **Sessão** | Cookies HTTP-only via `@supabase/ssr` |
| **Logout** | `signOut` + redirecionamento para `/login` |

### 2.2 Autorização (controle de acesso)

| Item | Implementação |
|------|---------------|
| **Perfis** | `admin` e `operador` em `user_metadata.role` |
| **Middleware** | `lib/supabase/middleware.ts` — protege todas as rotas exceto `/login` |
| **Rotas não autenticadas** | Redirecionadas para `/login` |
| **Rotas `/admin/*`** | Apenas `role === "admin"` — operador é redirecionado para `/dashboard` |
| **Layouts** | `dashboard/layout.tsx` e `admin/layout.tsx` — `getUser()` + redirect se não autenticado |

### 2.3 Row Level Security (RLS) — Supabase

| Tabela | Política | Descrição |
|--------|----------|-----------|
| `config` | `config_all` | Apenas `authenticated` — SELECT, INSERT, UPDATE, DELETE |
| `mensalistas` | `mensalistas_all` | Apenas `authenticated` |
| `entradas` | `entradas_all` | Apenas `authenticated` |
| `preco_regimes` | `preco_regimes_authenticated` | Apenas `authenticated` |
| `pagamentos_mensal` | `pagamentos_mensal_authenticated` | Apenas `authenticated` |

**Nota:** Política `config_anon_read` foi removida na migration 007 — não há leitura anônima em tabelas sensíveis.

### 2.4 Funções sensíveis (SECURITY DEFINER)

| Função | Proteção |
|--------|----------|
| `get_users_for_admin()` | Verifica `auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'` — retorna erro se não for admin |
| `registrar_entrada_atomica()` | Executável apenas por `authenticated` |

### 2.5 Gestão de usuários (Admin)

| Ação | Requisito |
|------|-----------|
| Listar usuários | `get_users_for_admin()` — apenas admin |
| Criar usuário | `supabase.auth.admin.createUser()` — usa `SUPABASE_SERVICE_ROLE_KEY` (server-side) |
| Alterar role | `auth.admin.updateUserById()` — server-side |
| Excluir usuário | Impede exclusão do último admin |

### 2.6 Chaves e variáveis

| Variável | Uso | Exposta ao cliente? |
|----------|-----|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase | Sim (necessário para cliente) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API (criar usuário, etc.) | **Não** — apenas server-side |

---

## 3. Riscos Identificados e Recomendações

### 3.1 Para o time de segurança validar

| # | Área | Situação atual | Recomendação |
|---|------|----------------|---------------|
| 1 | **Política RLS permissiva** | `USING (true) WITH CHECK (true)` — qualquer usuário autenticado acessa todos os dados | Avaliar se é aceitável para o domínio (todos os usuários são internos) ou se há necessidade de isolamento por unidade/estacionamento |
| 2 | **Role no client** | `user_metadata.role` é definido pelo admin e enviado no JWT | O JWT é assinado pelo Supabase; alterar role exige acesso ao Supabase Auth ou admin. Validar se há vetores de escalação de privilégio |
| 3 | **Service role no servidor** | Usada em `app/admin/usuarios/actions.ts` | Nunca exposta ao cliente. Garantir que `.env.local` e variáveis Vercel não vazem |
| 4 | **Senha padrão** | `Admin@123` documentada no README | **Crítico:** Trocar imediatamente em produção. Considerar remover do README ou deixar apenas "troque após primeiro login" |
| 5 | **Rate limiting** | Não implementado no login | Considerar Supabase Auth rate limit ou middleware (Vercel/Cloudflare) |
| 6 | **CORS / Headers** | Next.js padrão | Validar headers de segurança (CSP, HSTS, X-Frame-Options) |
| 7 | **Input validation** | Validação básica em formulários | Revisar sanitização de inputs (placa, valores) para SQL injection e XSS |
| 8 | **HTTPS** | Vercel fornece HTTPS por padrão | Confirmar que não há mixed content |

### 3.2 Checklist de ações imediatas

- [ ] **Trocar senha do admin** em produção (se ainda for `Admin@123`)
- [ ] Confirmar que `SUPABASE_SERVICE_ROLE_KEY` não está em repositório ou logs
- [ ] Revisar políticas RLS no Supabase (Dashboard → Authentication → Policies)
- [ ] Validar que migrations 001–010 estão aplicadas (incluindo 004 RLS e 007 remoção anon)

---

## 4. Arquivos Relevantes para Auditoria

| Arquivo | Função |
|---------|--------|
| `middleware.ts` | Proteção de rotas, verificação de role |
| `lib/supabase/middleware.ts` | Lógica de sessão e redirecionamento |
| `lib/supabase/admin.ts` | Cliente com service_role (server-only) |
| `app/admin/usuarios/actions.ts` | CRUD de usuários (usa admin client) |
| `supabase/migrations/004_rls_policies.sql` | Políticas RLS |
| `supabase/migrations/005_function_list_users.sql` | Função `get_users_for_admin` |
| `supabase/migrations/007_ajustes_wagner.sql` | Remoção anon, função atômica |
| `.env.local.example` | Variáveis esperadas (sem valores reais) |

---

## 5. Próximos Passos (com time de segurança)

1. **Revisão deste documento** — Validar precisão e completude
2. **Teste de penetração** — Login, escalação de privilégio, acesso a dados
3. **Revisão de RLS** — Decidir se políticas mais restritivas são necessárias
4. **Política de senhas** — Supabase Auth permite configurar requisitos (comprimento, complexidade)
5. **Logs e monitoramento** — Considerar logging de ações sensíveis (criação de usuário, alteração de config)

---

## 6. Contato

**Time MEQ** — Para dúvidas sobre implementação, consulte `HISTORICO-MEQ.md` ou os agentes Marco, Wagner, Felipe.

---

*Documento criado para suporte à avaliação de segurança. Atualize após auditoria.*

# Ajustes para Admin — Time MEQ

## Problemas resolvidos no código

1. **Dashboard Admin** — Tratamento de erro e uso das classes de estilo
2. **Menu Mapa** — Link "Mapa de Vagas" adicionado no menu Admin
3. **Usuários** — Mensagem de erro mais clara quando `SUPABASE_SERVICE_ROLE_KEY` não está configurado

---

## O que VOCÊ precisa fazer no Supabase

### 1. Executar SQL de políticas RLS (Dashboard em branco)

Se o Dashboard Admin não carrega ou fica em branco:

1. Supabase → **SQL Editor** → **New query**
2. Copie o conteúdo de `supabase/APLICAR-RLS-POLICIES.sql`
3. Execute (Run)

### 2. Configurar SUPABASE_SERVICE_ROLE_KEY no Vercel (Lista de usuários)

Se aparece "Database error finding users" em Admin > Usuários:

1. Vercel → seu projeto → **Settings** → **Environment Variables**
2. Adicione:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** copie de Supabase → Project Settings → API → **service_role** (secret)
3. Marque Production, Preview, Development
4. **Redeploy** o projeto (Deployments → ⋮ → Redeploy)

---

## Funcionalidade do Dashboard Admin

| Card | Informação |
|------|------------|
| **Total vagas** | Capacidade total do estacionamento |
| **Disponíveis** | Vagas livres no momento |
| **Ocupadas** | Vagas em uso |
| **Faturamento hoje** | Valor arrecadado com saídas de rotativos no dia |
| **Entradas ativas** | Tabela com placa, tipo e horário de entrada dos veículos estacionados |

---

## Checklist

- [ ] Executar `APLICAR-RLS-POLICIES.sql` no Supabase
- [ ] Configurar `SUPABASE_SERVICE_ROLE_KEY` no Vercel
- [ ] Fazer redeploy no Vercel
- [ ] Testar login como Admin
- [ ] Verificar Dashboard, Mapa, Usuários

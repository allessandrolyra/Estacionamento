# Sistema de Gerenciamento de Estacionamento

Sistema web para controle de entrada/saída, vagas e mensalistas. Stack: Next.js + Supabase + Vercel (100% free tier).

## Acesso online

**Aplicação em produção:** [https://estacionamento-ivory.vercel.app/](https://estacionamento-ivory.vercel.app/)

Loging: admin@local.env

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute em ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_vaga_numero.sql`
3. **Primeiro usuário Admin** — escolha uma opção:

   **Opção A — SQL (recomendado para site online):**
   - Supabase → SQL Editor → abra `supabase/CRIAR-ADMIN-SQL.sql`
   - Cole o conteúdo e execute (Run)
   - Login: `admin@estacionamento.local` | Senha: `Admin@123`

   **Opção B — Script Node (local):**
   ```bash
   npm run seed:admin-padrao
   ```
   Cria o mesmo admin padrão. Requer `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`.

### 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

A `SUPABASE_SERVICE_ROLE_KEY` é necessária para criar o primeiro admin e para a gestão de usuários no painel.

### 3. Instalação e execução

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

### 4. Deploy (Vercel)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático em cada push

**Comandos:** veja `DEPLOY.md` — sempre que houver alterações, os comandos de deploy estão lá.

## Estrutura de rotas

- `/login` — Login
- `/dashboard` — Operador: vagas, entrada, saída
- `/dashboard/mapa` — Mapa de vagas em tempo real
- `/admin/dashboard` — Admin: dashboard
- `/admin/mensalistas` — Cadastro de mensalistas
- `/admin/relatorios` — Relatórios e exportação CSV
- `/admin/fechamento` — Fechamento de caixa e impressão
- `/admin/historico` — Consulta por placa
- `/admin/config` — Configuração de tarifas e regimes de preço
- `/admin/usuarios` — Gestão de usuários (listar, criar, alterar permissões)
- `/admin/mapa` — Mapa de vagas (admin)

## Segurança

Documento de avaliação para o time de segurança: `_bmad-output/meq/SEGURANCA-ASSESSMENT.md`

**Importante:** Troque a senha do admin padrão após o primeiro login em produção.

## Roadmap

Veja `ROADMAP.md` — fases planejadas e escopo detalhado (Fechamento de caixa, Múltiplas tabelas, Convênios, etc.).

## Documentação

Documentação MEQ (Time MEQ) em `_bmad-output/meq/planning/`:

- **[Índice](_bmad-output/meq/planning/index.md)** — Navegação da documentação
- [Product Brief](_bmad-output/meq/planning/product-brief-estacionamento.md)
- [PRD](_bmad-output/meq/planning/prd-estacionamento.md)
- [Arquitetura](_bmad-output/meq/planning/architecture-estacionamento.md)
- [Epics e Stories](_bmad-output/meq/planning/epics-stories-estacionamento.md)

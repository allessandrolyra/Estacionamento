# Histórico MEQ — Sistema de Estacionamento

**Time MEQ** | Documentação de sessão para retomada de trabalho

---

## 1. Contexto do Projeto

| Item | Valor |
|------|-------|
| **Projeto** | Sistema de Gerenciamento de Estacionamento |
| **Pasta** | `c:\01. Foursys\06. BMAD Cursor\estacionamento` |
| **Stack** | Next.js 14 + Supabase + Vercel (100% free tier) |
| **Repositório** | https://github.com/allessandrolyra/Estacionamento.git |
| **Branch** | `main` |
| **Acesso online** | [https://estacionamento-ivory.vercel.app/](https://estacionamento-ivory.vercel.app/) |

---

## 2. Time MEQ — Agentes

| Agente | Papel | Área |
|--------|-------|------|
| **Marco** | Orquestrador Master | Coordenação, deploy |
| **Paula** | Product Developer | Requisitos, PRD, Epics/Stories |
| **Wagner** | Arquiteto de Software | Arquitetura, stack |
| **Sally** | UX Designer | UI/UX, design |
| **Felipe** | Full-Stack Developer | Implementação |
| **Diana** | Especialista Banco de Dados | Modelagem, schemas |
| **Igor** | Especialista Integração | APIs, contratos |
| **Quinn** | QA Engineer | Testes, qualidade |
| **Davi** | DevOps Engineer | CI/CD, deploy |

---

## 3. O Que Foi Realizado (Changelog)

### 3.1 Planejamento (documentação)

- **Product Brief** — Visão, problema, solução
- **PRD** — Requisitos funcionais e não funcionais
- **Arquitetura** — Stack, estrutura, decisões técnicas (Wagner)
- **Epics e Stories** — Backlog (Paula)
- **Revisão modelo de dados** — Diana

### 3.2 Migrations Supabase (em ordem)

| # | Arquivo | Descrição |
|---|---------|-----------|
| 001 | `001_initial_schema.sql` | Schema inicial |
| 002 | `002_add_vaga_numero.sql` | Campo vaga_numero |
| 003 | `003_seed_admin_padrao.sql` | Admin padrão |
| 004 | `004_rls_policies.sql` | RLS |
| 005 | `005_function_list_users.sql` | Função list_users |
| 006 | `006_tipo_pagamento.sql` | Tipo de pagamento |
| 007 | `007_ajustes_wagner.sql` | Ajustes Wagner |
| 008 | `008_preco_regimes.sql` | Regimes de preço |
| 009 | `009_realtime_entradas.sql` | Realtime |
| **010** | **`010_mensalistas_cobranca.sql`** | **Valor mensalidade, tabela `pagamentos_mensal`** |

### 3.3 Cobrança de mensalistas (Migration 010)

- **Config:** campo `valor_mensalidade` (padrão R$ 200)
- **Mensalistas:** campo `valor_mensalidade` individual (opcional)
- **Tabela `pagamentos_mensal`:** id, mensalista_id, referencia, valor, forma_pagamento, pago_em
- **Serviço:** `lib/services/mensalista-cobranca-service.ts`
  - `registrarPagamento(mensalistaId, referencia, valor, formaPagamento)` — registra e estende validade
  - `calcularStatusValidade(validadeAte)` — em_dia / vence_em_breve / vencido
  - `obterValorMensalidadePadrao()` — lê da config

### 3.4 Funcionalidades implementadas

- **Config:** campo "Valor mensalidade padrão (R$)"
- **Mensalistas:** valor individual, status (em dia / vence em X dias / vencido), botão "Registrar pagamento"
- **Dashboard admin:** alerta para mensalistas com validade em até 7 dias
- **Relatórios:** pagamentos de mensalistas na tabela, CSV, PDF
- **Fechamento:** tabela de pagamentos de mensalistas
- **Feedback inline:** componente `feedback-message.tsx` em várias telas

### 3.5 Gráficos e forma de pagamento (última sessão)

**Requisito:** Pagamentos de mensalistas devem aparecer nos gráficos **por forma de pagamento** (Dinheiro, Crédito, Débito, PIX, Boleto). O total de cada forma deve incluir rotativo + mensalistas.

**Implementação em `lib/services/relatorio-service.ts`:**

- Cada pagamento de mensalista entra na categoria da sua `forma_pagamento`
- Dinheiro = rotativo dinheiro + mensalistas dinheiro
- Cartão Débito = rotativo débito + mensalistas débito
- Cartão Crédito = rotativo crédito + mensalistas crédito
- PIX = rotativo PIX + mensalistas PIX
- Boleto = rotativo boleto + mensalistas boleto
- Quantidade por forma = saídas rotativas + pagamentos mensalistas naquela forma
- Pagamentos sem forma definida → categoria "Outros"
- Linha "Mensalista (isento na saída)" mantida (quantidade, valor 0)

---

## 4. Arquivos Principais

| Arquivo | Função |
|---------|--------|
| `lib/services/relatorio-service.ts` | `buscarRelatorio`, `exportarCSVCompleto`, gráficos por forma de pagamento |
| `lib/services/mensalista-cobranca-service.ts` | `registrarPagamento`, `calcularStatusValidade` |
| `app/admin/relatorios/relatorios-client.tsx` | Gráficos, PDF, tabela de pagamentos |
| `app/admin/fechamento/fechamento-client.tsx` | Fechamento com pagamentos de mensalistas |
| `app/admin/mensalistas/mensalistas-client.tsx` | CRUD, status, registro de pagamento |
| `app/admin/config/config-client.tsx` | Valor mensalidade padrão |
| `components/ui/feedback-message.tsx` | Mensagens de feedback inline |

---

## 5. Como Continuar Amanhã

### 5.1 Acesso online

**Produção:** [https://estacionamento-ivory.vercel.app/](https://estacionamento-ivory.vercel.app/)

### 5.2 Abrir o projeto

```
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
```

### 5.3 Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

### 5.4 Deploy (quando houver alterações)

```bash
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git commit -m "feat: [descreva a alteração]"
git push origin main
```

Vercel faz deploy automático em cada push.

### 5.5 Migrations pendentes no Supabase

Se a migration 010 não foi aplicada, execute no SQL Editor do Supabase:

```
supabase/migrations/010_mensalistas_cobranca.sql
```

---

## 6. Documentação de Planejamento

| Documento | Caminho |
|-----------|---------|
| Índice | `_bmad-output/meq/planning/index.md` |
| Product Brief | `_bmad-output/meq/planning/product-brief-estacionamento.md` |
| PRD | `_bmad-output/meq/planning/prd-estacionamento.md` |
| Arquitetura | `_bmad-output/meq/planning/architecture-estacionamento.md` |
| Epics e Stories | `_bmad-output/meq/planning/epics-stories-estacionamento.md` |
| Revisão Diana | `_bmad-output/meq/planning/modelo-dados-diana-review.md` |
| **Segurança** | `_bmad-output/meq/SEGURANCA-ASSESSMENT.md` — para o time de segurança |

---

## 7. Últimos Commits (referência)

- `fix(relatorios): mensalistas distribuidos por forma de pagamento nos graficos`
- `fix(relatorios): mensalidades aparecem nos graficos sem duplicacao`

---

## 8. Itens em Aberto / Próximos Passos

- Validar em produção se os gráficos refletem corretamente os pagamentos de mensalistas
- Verificar se a migration 010 está aplicada no Supabase de produção
- Continuar epics/stories pendentes conforme `epics-stories-estacionamento.md`

---

*Documento gerado para retomada de trabalho. Atualize este arquivo ao concluir novas entregas.*

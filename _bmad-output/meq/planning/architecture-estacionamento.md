# Arquitetura — Sistema de Gerenciamento de Estacionamento

**Versão:** 1.0  
**Data:** 2025-03-19  
**Time MEQ**

---

## 1. Visão geral

Sistema web full-stack com Next.js 14 (App Router), Supabase (PostgreSQL + Auth + Realtime) e deploy na Vercel.

---

## 2. Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Estilização | CSS (inline, classes utilitárias) |
| Ícones | Lucide React |
| Backend | Supabase (PostgreSQL, Auth, Realtime) |
| Deploy | Vercel |

---

## 3. Estrutura de pastas

```
estacionamento/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   ├── dashboard/           # Operador
│   │   ├── page.tsx
│   │   ├── dashboard-client.tsx
│   │   ├── mapa/
│   │   └── logout-button.tsx
│   └── admin/              # Admin
│       ├── layout.tsx
│       ├── dashboard/
│       ├── mensalistas/
│       ├── relatorios/
│       ├── fechamento/
│       ├── historico/
│       ├── config/
│       ├── usuarios/
│       └── mapa/
├── components/
│   ├── layout/
│   │   ├── dashboard-layout-client.tsx
│   │   └── admin-layout-client.tsx
│   └── ui/
│       ├── breadcrumb.tsx
│       ├── session-actions.tsx
│       └── auto-refresh.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── admin.ts
│   ├── services/
│   │   ├── entrada-service.ts
│   │   ├── preco-service.ts
│   │   ├── relatorio-service.ts
│   │   ├── mapa-service.ts
│   │   ├── historico-service.ts
│   │   ├── mensalista-service.ts
│   │   └── vaga-service.ts
│   ├── types.ts
│   └── utils/
│       └── placa.ts
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        ├── 002_add_vaga_numero.sql
        ├── ...
        └── 009_realtime_entradas.sql
```

---

## 4. Modelo de dados

### 4.1 Entidades principais

| Tabela | Descrição |
|--------|-----------|
| `config` | total_vagas, valor_hora, fracao_minima_minutos (fallback) |
| `entradas` | placa, tipo, entrada_em, saida_em, valor_pago, vaga_numero, tipo_pagamento |
| `mensalistas` | nome, placa, validade_ate, ativo |
| `preco_regimes` | nome, dia_semana, hora_inicio, hora_fim, valor_hora, fracao_minutos |

### 4.2 Tipos

- `tipo_veiculo`: rotativo, mensalista
- `tipo_pagamento`: dinheiro, cartao_debito, cartao_credito, pix

### 4.3 Índices

- `entradas`: placa ativa (única), entrada_em, saida_em
- `mensalistas`: placa, validade_ate + ativo
- `preco_regimes`: ativo + ordem

---

## 5. Serviços

| Serviço | Responsabilidade |
|---------|------------------|
| `entrada-service` | getVagasDisponiveis, getMapaVagas, registrarEntrada, calcularSaida, registrarSaida |
| `preco-service` | obterRegimeVigente, obterParametrosPreco, calcularValorRotativo |
| `relatorio-service` | buscarRelatorio, exportarCSV |
| `mapa-service` | fetchMapaCompleto (agregação para mapa) |
| `historico-service` | buscarHistoricoPorPlaca |
| `mensalista-service` | listarMensalistas, criarMensalista, atualizarMensalista |
| `vaga-service` | getVagas |

---

## 6. Segurança

- **Row Level Security (RLS):** habilitado em todas as tabelas
- **Políticas:** usuários autenticados podem ler/escrever conforme perfil
- **Auth:** Supabase Auth com email/senha
- **Perfis:** admin/operador via `auth.users.raw_user_meta_data`

---

## 7. Realtime

- **Canal:** `postgres_changes` na tabela `entradas`
- **Uso:** mapa em tempo real e lista de entradas ativas no dashboard
- **Migration:** `009_realtime_entradas.sql` habilita publicação

---

## 8. Fluxos principais

### Entrada

1. Usuário informa placa, tipo, vaga (opcional)
2. Validação de placa
3. Se mensalista: verifica validade
4. Se rotativo: verifica vaga disponível
5. Insere em `entradas`

### Saída

1. Usuário informa placa
2. Busca entrada ativa
3. Se mensalista: registra saída sem valor
4. Se rotativo: obtém regime vigente, calcula valor, exibe preview
5. Usuário confirma: registra saida_em, valor_pago, tipo_pagamento

---

## 9. Migrations

| # | Arquivo | Descrição |
|---|---------|-----------|
| 001 | initial_schema | config, mensalistas, entradas |
| 002 | add_vaga_numero | vaga_numero em entradas |
| 003 | seed_admin_padrao | Admin padrão |
| 004 | rls_policies | Políticas RLS |
| 005 | function_list_users | Função listar usuários |
| 006 | tipo_pagamento | Enum e coluna tipo_pagamento |
| 007 | ajustes_wagner | Ajustes diversos |
| 008 | preco_regimes | Tabela de regimes |

---

## 10. Deploy

- **Vercel:** conectado ao repositório
- **Variáveis:** NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- **Documentação:** `DEPLOY.md`, `COMANDOS-DEPLOY-COMPLETO.md`

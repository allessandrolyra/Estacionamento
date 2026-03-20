# Deploy — Sistema de Estacionamento

## Regra do Marco

**Marco disponibiliza o comando** para você executar — ao final de cada fase ou quando houver atualizações necessárias e autorizadas no sistema. Combinado.

---

## Comando para você executar (copie e rode)

```bash
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git commit -m "feat: [descreva a alteração]"
git push origin main
```

---

## Deploy desta fase (Fase 4 — Múltiplas tabelas de preço)

```bash
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git commit -m "feat: Fase 4 - Múltiplas tabelas de preço (comercial, noturno, fim de semana)"
git push origin main
```

**Antes:** executar migration 008 no Supabase SQL Editor.

---

## Deploy anterior (Design visual e responsivo)

```bash
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git commit -m "feat: design visual - config centralizado, responsivo, touch targets"
git push origin main
```

---

## Deploy anterior (Histórico — Fase 2)

```bash
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git commit -m "feat: Fase 2 Histórico - busca por placa"
git push origin main
```

---

## Deploy anterior (Relatórios — Fase 1)

```bash
git commit -m "feat: Fase 1 Relatórios - filtros, gráficos, exportação CSV"
```

---

## Migrations no Supabase

Se ainda não aplicou, execute no SQL Editor do Supabase (em ordem):

1. `supabase/migrations/006_tipo_pagamento.sql`
2. `supabase/migrations/007_ajustes_wagner.sql`
3. `supabase/migrations/008_preco_regimes.sql`

---

## Conferir deploy

1. Vercel → Deployments → aguardar **Ready**
2. Testar em produção

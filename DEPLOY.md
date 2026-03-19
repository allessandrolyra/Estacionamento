# Deploy — Sistema de Estacionamento

## Comandos padrão (copiar e colar)

```bash
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git commit -m "feat: [descreva a alteração]"
git push origin main
```

---

## Deploy desta fase (Histórico — Fase 2)

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

---

## Conferir deploy

1. Vercel → Deployments → aguardar **Ready**
2. Testar em produção

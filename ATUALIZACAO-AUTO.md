# Atualização automática — Consulta do time

**Objetivo:** Manter informações sempre atuais (ex.: a cada 30 segundos)

---

## Situação atual

| Tela | Atualização | Observação |
|------|-------------|------------|
| **Operações** (dashboard) | ✅ Realtime (Supabase) | Atualiza na hora quando entradas mudam |
| **Mapa de vagas** | ⚠️ Realtime + `window.location.reload()` | Funciona, mas recarrega a página inteira |
| **Painel Admin** | ❌ Só no carregamento | Sem atualização automática |
| **Relatórios / Fechamento** | ❌ Manual | Usuário escolhe período e busca |

---

## Opinião do time

### Sally (UX)
- **30 segundos** é um bom intervalo: não cansa o usuário e evita dados muito desatualizados
- Evitar **reload completo** (como no mapa): preferir atualizar só os dados
- Opcional: indicador discreto “Atualizado às 14:32” para dar confiança

### Winston (Arquiteto)
- **Realtime (Supabase)** é o ideal quando funciona
- **Polling a cada 30s** como complemento ou fallback
- **Mapa:** trocar `window.location.reload()` por busca de dados e atualização de estado
- **Admin:** converter para client component ou usar `router.refresh()` a cada 30s

### John (PM)
- Prioridade: **Operações** (já tem Realtime) > **Mapa** > **Painel Admin**
- Relatórios e Fechamento: manter atualização manual (depende de filtros)

### Quinn (QA)
- Realtime pode falhar (rede, Supabase)
- Polling garante atualização mesmo sem Realtime
- Sugestão: **Realtime + polling** (polling como backup)

---

## Propostas de implementação

### Opção 1 — Polling a cada 30s (simples)
- `setInterval` de 30s em cada tela que precisa
- Operações: manter Realtime e adicionar polling como fallback
- Mapa: trocar reload por `router.refresh()` ou refetch
- Admin: `router.refresh()` a cada 30s

### Opção 2 — Hook reutilizável
- `useAutoRefresh(intervaloMs)` que chama callback a cada X segundos
- Usar em Operações, Mapa e Admin
- Fácil de ajustar o intervalo depois

### Opção 3 — Realtime em tudo
- Expandir Realtime para Mapa e Admin
- Mapa: refetch de dados em vez de reload
- Admin: converter para client e usar Realtime

---

## Recomendação do time

**Opção 2 (hook) + ajustes pontuais:**

1. **Operações** — Manter Realtime + polling a cada 30s como fallback
2. **Mapa** — Trocar `window.location.reload()` por refetch/`router.refresh()` e adicionar polling de 30s
3. **Painel Admin** — `router.refresh()` a cada 30s (ou converter para client com Realtime)
4. **Relatórios / Fechamento** — Manter manual (filtros definidos pelo usuário)

---

## Implementado

1. **Operações** — Mantido Realtime (já existia)
2. **Mapa** — Realtime com refetch (substituído `window.location.reload()` por `fetchMapaCompleto()`)
3. **Painel Admin** — `AutoRefresh` a cada 30s (`router.refresh()`)
4. **Relatórios / Fechamento** — Mantido manual

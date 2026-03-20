# Fase 4 — Sprint: Múltiplas tabelas de preço

## Organização do time

| Papel | Responsável | Foco |
|-------|-------------|------|
| **PM** | John | Validar regras, priorizar critérios de aceite |
| **Arquiteto** | Winston | Modelo de dados (preco_regimes), estratégia de cálculo |
| **Dev** | Amelia | Migration, entrada-service, config UI |
| **QA** | Quinn | Testes de cálculo, cenários comerciais/noturno/fim de semana |
| **Marco** | Marco | Disponibilizar comando de deploy ao final |

---

## Epics

### Epic 1: Modelo de dados e migration

**Winston + Amelia**

- [x] Definir schema `preco_regimes` (nome, dia_semana, hora_inicio, hora_fim, valor_hora, fracao_min)
- [x] Migration 008: criar tabela e popular padrões (comercial, noturno, fim_semana)
- [x] Manter `config.valor_hora` como fallback (compatibilidade)

### Epic 2: Lógica de cálculo

**Winston + Amelia**

- [x] Função `obterRegimeVigente(saida_em)` — retorna regime aplicável
- [x] `preco-service`: obterParametrosPreco, calcularValorRotativo
- [x] Integrar em `calcularSaida` e `registrarSaida`

### Epic 3: Interface Config

**Amelia**

- [x] Tela Config: listar regimes existentes
- [x] Formulário para editar valor_hora e fracao_min por regime
- [x] Manter campos atuais (total_vagas, valor padrão) para fallback

### Epic 4: Validação e testes

**Quinn**

- [ ] Cenário: entrada comercial, saída comercial → valor comercial
- [ ] Cenário: entrada noturno, saída noturno → valor noturno
- [ ] Cenário: cruza comercial→noturno → cálculo proporcional
- [ ] Cenário: sábado/domingo → valor fim de semana
- [ ] Relatórios e fechamento com valores corretos

---

## Stories (ordem sugerida)

1. **S4.1** — Migration preco_regimes (Winston/Amelia)
2. **S4.2** — Função obter_regime_vigente (Amelia)
3. **S4.3** — Integrar cálculo em entrada-service (Amelia)
4. **S4.4** — UI Config: regimes (Amelia)
5. **S4.5** — Testes manuais e validação (Quinn)

---

## Deploy (Marco)

Ao final da fase, disponibilizar:

```bash
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git commit -m "feat: Fase 4 - Múltiplas tabelas de preço (comercial, noturno, fim de semana)"
git push origin main
```

**Lembrete:** Executar migration 008 no Supabase SQL Editor antes de testar em produção.

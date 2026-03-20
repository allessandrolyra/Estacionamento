# Fase 5 — Sprint: Convênios

## Organização do time

| Papel | Responsável | Foco |
|-------|-------------|------|
| **PM** | John | Validar regras, priorizar critérios de aceite |
| **Arquiteto** | Winston | Modelo convenios + convenio_placas, prioridade mensalista > convênio > rotativo |
| **Dev** | Amelia | Migration, entrada-service, página Convênios |
| **QA** | Quinn | Testes: placa com convênio, desconto, gratuidade, validade |
| **Marco** | Marco | Disponibilizar comando de deploy ao final |

---

## Epics

### Epic 1: Modelo de dados e migration

**Winston + Amelia**

- [ ] Tabela `convenios` (nome, desconto_percentual, validade_ate, ativo)
- [ ] Tabela `convenio_placas` (convenio_id, placa, ativo)
- [ ] Migration 009
- [ ] RLS e índices

### Epic 2: Lógica de desconto na saída

**Amelia**

- [ ] Função `obterConvenioPlaca(placa)` — retorna convênio ativo se existir
- [ ] Em `calcularSaida` e `registrarSaida`: se convênio → valor = valor * (1 - desconto/100)
- [ ] Prioridade: mensalista (isento) > convênio (desconto) > rotativo (valor cheio)

### Epic 3: Interface Admin Convênios

**Amelia**

- [ ] Página `/admin/convenios` — listar convênios
- [ ] CRUD convênio (nome, desconto, validade)
- [ ] Vincular/desvincular placas por convênio
- [ ] Link no menu admin

### Epic 4: Validação

**Quinn**

- [ ] Placa com convênio 0% → gratuidade
- [ ] Placa com convênio 50% → metade do valor
- [ ] Convênio fora da validade → valor cheio
- [ ] Placa sem convênio → valor cheio

---

## Stories (ordem sugerida)

1. **S5.1** — Migration convenios + convenio_placas (Winston/Amelia)
2. **S5.2** — Lógica obterConvenioPlaca e aplicar desconto (Amelia)
3. **S5.3** — Página Admin Convênios (Amelia)
4. **S5.4** — Vincular placas (Amelia)
5. **S5.5** — Testes e validação (Quinn)

---

## Deploy (Marco)

Ao final da fase, disponibilizar:

```bash
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git commit -m "feat: Fase 5 - Convênios (desconto/gratuidade por empresa)"
git push origin main
```

**Lembrete:** Executar migration 009 no Supabase SQL Editor antes de testar em produção.

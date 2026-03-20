# Roadmap — Sistema de Estacionamento

## Processo

**Marco:** disponibiliza o comando de deploy para você executar — ao final de cada fase ou quando houver atualizações necessárias e autorizadas. Ver `DEPLOY.md`.

---

## Visão geral

| Fase | Funcionalidade | Status | Esforço |
|------|----------------|--------|---------|
| 1 | Relatórios | ✅ Concluído | — |
| 2 | Consulta por Placa | ✅ Concluído | — |
| 3 | Fechamento de caixa + Relatório impressão + Ajuste vagas | ✅ Concluído | — |
| 4 | Múltiplas tabelas de preço | ✅ Concluído | — |
| 5 | Convênios | 📋 Planejado | Médio |
| 6 | Checklist de avarias | 📋 Planejado | Baixo |
| 7 | NF-e | 📋 Planejado | Alto |

---

## Fase 3 — Fechamento de caixa (detalhada)

### 3.1 Objetivo

Permitir que o operador/admin faça fechamento de caixa ao final do turno/dia e gere relatório para impressão.

### 3.2 Funcionalidades

#### Fechamento de caixa

| Item | Descrição |
|------|-----------|
| **Local** | Nova página `/admin/fechamento` ou seção em Relatórios |
| **Filtros** | Data (padrão: hoje), opcional: período customizado |
| **Resumo** | Total recebido, quantidade de saídas, valor médio |
| **Por tipo** | Dinheiro, Débito, Crédito, PIX (valores e quantidades) |
| **Lista** | Entradas que geraram receita no período |

#### Relatório para impressão

| Item | Descrição |
|------|-----------|
| **Botão** | "Imprimir" na tela de fechamento |
| **Layout** | Página otimizada para impressão (sem nav, margens adequadas) |
| **Conteúdo** | Cabeçalho (nome do estacionamento, data), resumo, tabela de entradas |
| **Formato** | CSS `@media print` ou nova janela com `window.print()` |

#### Ajuste: Vagas disponíveis

| Item | Descrição |
|------|-----------|
| **Problema** | Garantir que o seletor mostre apenas vagas livres |
| **Solução** | Recarregar lista ao abrir formulário de entrada; label "Vaga (apenas disponíveis)" |

### 3.3 Interface

- **Menu admin:** link "Fechamento de caixa"
- **Operador:** link "Fechamento" no dashboard (acesso rápido)
- **Impressão:** botão que abre relatório em nova aba/janela com layout para impressão

### 3.4 Regras de negócio

- Período padrão: dia atual
- Incluir apenas entradas com `saida_em` preenchido e `valor_pago` > 0 (rotativos)
- Mensalistas: incluir na contagem de saídas, valor = 0

### 3.5 Critérios de aceite

- [ ] Admin acessa Fechamento de caixa pelo menu
- [ ] Operador acessa Fechamento pelo dashboard
- [ ] Filtro por data (hoje ou customizado)
- [ ] Resumo exibe total, quantidade, valor médio
- [ ] Resumo por tipo de pagamento
- [ ] Botão "Imprimir" gera relatório formatado
- [ ] Seletor de vaga mostra apenas vagas disponíveis
- [ ] Label do seletor: "Vaga (apenas disponíveis)"

### 3.6 Estimativa

| Tarefa | Esforço |
|--------|---------|
| Página Fechamento de caixa | 2h |
| Layout para impressão | 1–2h |
| Ajuste seletor de vagas | 0,5h |
| **Total** | **3,5–4,5h** |

---

## Fase 4 — Múltiplas tabelas de preço (detalhada)

### 4.1 Objetivo

Permitir diferentes valores conforme horário (comercial vs noturno) e dia da semana (fim de semana).

### 4.2 Funcionalidades

| Item | Descrição |
|------|-----------|
| **Tabelas de preço** | Comercial (ex: 6h–22h), Noturno (22h–6h), Fim de semana |
| **Configuração** | Admin define valor_hora e fracao_min por regime |
| **Cálculo** | Ao dar saída, sistema aplica o regime vigente no momento (ou proporcional se cruzar períodos) |
| **Compatibilidade** | Manter valor atual como padrão; migração suave |

### 4.3 Regras de negócio

- **Comercial:** segunda–sexta, 6h–22h
- **Noturno:** segunda–sexta, 22h–6h
- **Fim de semana:** sábado e domingo (valor único ou comercial/noturno)
- **Prioridade:** se houver sobreposição, usar a mais específica
- **Fração mínima:** pode variar por regime (ex: noturno 30 min)

### 4.4 Critérios de aceite

- [ ] Admin configura tabelas de preço em Config
- [ ] Cálculo de saída usa regime correto (comercial/noturno/fim de semana)
- [ ] Relatórios e fechamento refletem valores corretos
- [ ] Sistema funciona sem tabelas customizadas (fallback para valor único)

### 4.5 Estimativa

| Tarefa | Esforço |
|--------|---------|
| Migration: tabela preco_regimes | 1h |
| Lógica de cálculo por regime | 2–3h |
| Tela Config: CRUD regimes | 2h |
| Testes e ajustes | 1–2h |
| **Total** | **6–8h** |

---

## Fases futuras (resumo)

### Fase 5 — Convênios

- Cadastro de empresas/convênios
- Desconto ou gratuidade para placas vinculadas

### Fase 6 — Checklist de avarias

- Registro de danos ao veículo na entrada/saída
- Fotos opcionais

### Fase 7 — NF-e

- Integração com prefeitura para emissão de nota fiscal

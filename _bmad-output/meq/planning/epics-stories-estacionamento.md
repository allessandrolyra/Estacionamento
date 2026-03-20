# Epics e Stories — Sistema de Gerenciamento de Estacionamento

**Versão:** 1.0  
**Data:** 2025-03-19  
**Time MEQ**

---

## Epics concluídas

### Epic 1: Relatórios
| Story | Descrição | Status |
|-------|-----------|--------|
| S1.1 | Relatório por período com filtros | ✅ |
| S1.2 | Exportação CSV | ✅ |

### Epic 2: Consulta por Placa
| Story | Descrição | Status |
|-------|-----------|--------|
| S2.1 | Página de histórico por placa | ✅ |
| S2.2 | Lista de entradas/saídas da placa | ✅ |

### Epic 3: Fechamento de Caixa
| Story | Descrição | Status |
|-------|-----------|--------|
| S3.1 | Página de fechamento com filtro por data | ✅ |
| S3.2 | Resumo (total, quantidade, valor médio) | ✅ |
| S3.3 | Resumo por tipo de pagamento | ✅ |
| S3.4 | Relatório para impressão | ✅ |
| S3.5 | Seletor de vagas mostra apenas disponíveis | ✅ |

### Epic 4: Múltiplas Tabelas de Preço
| Story | Descrição | Status |
|-------|-----------|--------|
| S4.1 | Migration preco_regimes | ✅ |
| S4.2 | Regimes comercial, noturno, fim_semana | ✅ |
| S4.3 | Cálculo por regime vigente na saída | ✅ |
| S4.4 | Tela Config: CRUD regimes | ✅ |

### Epic 5: Design e UX
| Story | Descrição | Status |
|-------|-----------|--------|
| S5.1 | Sidebar para operador e admin | ✅ |
| S5.2 | Menu responsivo e ícones | ✅ |
| S5.3 | Estados vazios e breadcrumb | ✅ |
| S5.4 | Botões Sair / Trocar usuário | ✅ |
| S5.5 | Mapa em tempo real (Realtime) | ✅ |
| S5.6 | Painel Admin: refresh automático | ✅ |

---

## Epics planejadas

### Epic 6: Convênios
| Story | Descrição | Status |
|-------|-----------|--------|
| S6.1 | Migration convenios + convenio_placas | 📋 |
| S6.2 | CRUD convênios (nome, desconto, validade) | 📋 |
| S6.3 | Vincular placas a convênios | 📋 |
| S6.4 | Aplicar desconto na saída | 📋 |

### Epic 7: Checklist de Avarias
| Story | Descrição | Status |
|-------|-----------|--------|
| S7.1 | Registro de avarias na entrada/saída | 📋 |
| S7.2 | Fotos opcionais | 📋 |

### Epic 8: NF-e
| Story | Descrição | Status |
|-------|-----------|--------|
| S8.1 | Integração com provedor de NF-e | 📋 |
| S8.2 | Emissão de nota fiscal | 📋 |

---

## Mapeamento de rotas

| Rota | Epic | Descrição |
|------|------|-----------|
| `/login` | — | Login |
| `/dashboard` | E5 | Operador: entrada, saída |
| `/dashboard/mapa` | E5 | Mapa de vagas |
| `/admin/dashboard` | E5 | Dashboard admin |
| `/admin/mensalistas` | — | Mensalistas |
| `/admin/relatorios` | E1 | Relatórios |
| `/admin/fechamento` | E3 | Fechamento de caixa |
| `/admin/historico` | E2 | Consulta por placa |
| `/admin/config` | E4 | Config e regimes |
| `/admin/usuarios` | — | Gestão de usuários |
| `/admin/mapa` | E5 | Mapa admin |

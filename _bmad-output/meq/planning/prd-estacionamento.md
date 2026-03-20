# PRD — Sistema de Gerenciamento de Estacionamento

**Versão:** 1.0  
**Data:** 2025-03-19  
**Time MEQ**

---

## 1. Visão geral

Documento de requisitos do produto para o sistema de gerenciamento de estacionamento.

---

## 2. Requisitos funcionais

### 2.1 Autenticação e perfis

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | Login com email e senha via Supabase Auth | P0 |
| RF-02 | Perfil Admin: acesso total (config, usuários, relatórios, fechamento) | P0 |
| RF-03 | Perfil Operador: entrada, saída, mapa, fechamento | P0 |
| RF-04 | Admin pode criar usuários e definir perfil (admin/operador) | P0 |

### 2.2 Entrada e saída

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-05 | Registrar entrada com placa, tipo (rotativo/mensalista) e vaga opcional | P0 |
| RF-06 | Validar placa (ABC-1234 ou ABC1D23) | P0 |
| RF-07 | Mensalista: não cobrar; validar placa e validade | P0 |
| RF-08 | Rotativo: calcular valor ao sair conforme regime vigente | P0 |
| RF-09 | Registrar saída com tipo de pagamento (dinheiro, débito, crédito, PIX) | P0 |
| RF-10 | Preview de valor antes de confirmar saída | P0 |
| RF-11 | Seletor de vaga mostra apenas vagas disponíveis | P0 |

### 2.3 Vagas e mapa

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-12 | Configurar total de vagas (admin) | P0 |
| RF-13 | Mapa visual de vagas (ocupadas/livres) em tempo real | P0 |
| RF-14 | Atualização automática do mapa sem reload (Realtime) | P0 |

### 2.4 Regimes de preço

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-15 | Regime Comercial: seg–sex, 6h–22h | P0 |
| RF-16 | Regime Noturno: seg–sex, 22h–6h | P0 |
| RF-17 | Regime Fim de semana: sáb–dom | P0 |
| RF-18 | Admin configura valor_hora e fracao_min por regime | P0 |
| RF-19 | Fallback para config (valor único) se não houver regime | P0 |

### 2.5 Relatórios e fechamento

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-20 | Relatório por período com filtros (data, tipo) | P0 |
| RF-21 | Exportar relatório em CSV | P0 |
| RF-22 | Fechamento de caixa: total, quantidade, valor médio | P0 |
| RF-23 | Fechamento por tipo de pagamento | P0 |
| RF-24 | Relatório impressão (layout para impressão) | P0 |

### 2.6 Consulta e histórico

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-25 | Consulta por placa: histórico de entradas/saídas | P0 |

### 2.7 Mensalistas

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-26 | CRUD de mensalistas (nome, placa, validade) | P0 |

### 2.8 Gestão de usuários

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-27 | Listar usuários | P0 |
| RF-28 | Criar usuário (email, senha, perfil) | P0 |
| RF-29 | Alterar perfil (admin/operador) | P0 |

---

## 3. Requisitos não funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RNF-01 | Responsivo (mobile e desktop) | P0 |
| RNF-02 | RLS no Supabase para segurança | P0 |
| RNF-03 | Deploy em Vercel (free tier) | P0 |
| RNF-04 | Sem perda de dados em transações críticas | P0 |

---

## 4. Regras de negócio

- **Placa:** formato ABC-1234 (antigo) ou ABC1D23 (Mercosul)
- **Prioridade:** mensalista > rotativo
- **Cálculo:** frações de tempo conforme regime vigente (ex: 15 ou 30 min)
- **Fechamento:** incluir apenas entradas com saida_em e valor_pago > 0; mensalistas contam na quantidade, valor = 0

---

## 5. Roadmap futuro

- **Fase 5:** Convênios
- **Fase 6:** Checklist de avarias
- **Fase 7:** NF-e

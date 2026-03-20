# Product Brief — Sistema de Gerenciamento de Estacionamento

**Versão:** 1.0  
**Data:** 2025-03-19  
**Time MEQ**

---

## 1. Visão do produto

Sistema web para controle de entrada/saída de veículos em estacionamentos, com gestão de vagas, mensalistas, múltiplas tabelas de preço e relatórios operacionais.

---

## 2. Problema

Estacionamentos precisam de uma solução simples e acessível para:

- Registrar entrada e saída de veículos
- Controlar vagas disponíveis
- Gerenciar mensalistas
- Aplicar tarifas diferenciadas (comercial, noturno, fim de semana)
- Gerar relatórios e fechamento de caixa
- Consultar histórico por placa

---

## 3. Solução proposta

Aplicação web responsiva com:

- **Operador:** entrada, saída, mapa de vagas, consulta por placa, fechamento
- **Admin:** dashboard, mensalistas, relatórios, configuração de tarifas e regimes, gestão de usuários
- **Stack:** Next.js 14 + Supabase + Vercel (100% free tier)

---

## 4. Público-alvo

| Persona | Descrição |
|---------|-----------|
| **Operador** | Funcionário que registra entrada/saída no dia a dia |
| **Administrador** | Responsável por configuração, relatórios e gestão |

---

## 5. Funcionalidades principais

| Funcionalidade | Status |
|----------------|--------|
| Entrada/saída de veículos | ✅ |
| Mapa de vagas em tempo real | ✅ |
| Mensalistas | ✅ |
| Múltiplas tabelas de preço (comercial, noturno, fim de semana) | ✅ |
| Tipos de pagamento (dinheiro, débito, crédito, PIX) | ✅ |
| Relatórios e exportação CSV | ✅ |
| Fechamento de caixa e impressão | ✅ |
| Consulta por placa (histórico) | ✅ |
| Gestão de usuários (admin/operador) | ✅ |

---

## 6. Escopo fora do MVP

- Convênios (empresas com desconto)
- Checklist de avarias
- NF-e (integração com prefeitura)

---

## 7. Métricas de sucesso

- Uso diário pelos operadores
- Relatórios e fechamento utilizados
- Zero perda de dados de entradas/saídas

---

## 8. Restrições

- Deploy em free tier (Vercel + Supabase)
- Sem integração com hardware (catracas, câmeras)
- Acesso via navegador (desktop e mobile)

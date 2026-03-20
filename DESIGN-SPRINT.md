# Design Sprint — Melhorias de visualização e menu

**Prioridade:** Design da página, menu, visualização geral  
**Status:** ✅ Concluído

**Atualização:** Sidebar padronizada para operador — mesmo layout que admin.  
**Fase 5 (Convênios):** adiada

---

## Brainstorm do time

### Sally (UX Designer)

**Menu e navegação**
- Menu admin está muito longo e horizontal — em mobile vira scroll infinito
- Sugestão: **menu colapsável** ou **dropdown por categoria** (ex: "Operações" > Entrada/Saída, "Relatórios" > Relatórios/Fechamento/Histórico)
- Separar visualmente: Operações (uso diário) vs Configuração (uso esporádico)
- Ícones nos itens do menu para reconhecimento rápido
- Breadcrumb nas páginas internas

**Visualização das páginas**
- Dashboard operador: formulários de Entrada e Saída lado a lado — em mobile empilhar ou usar abas
- Cards com sombra suave e hover para feedback
- Hierarquia visual mais clara: título da página > seções > conteúdo
- Espaçamento consistente (design tokens já existem, revisar uso)
- Estados vazios mais amigáveis (ilustração ou mensagem clara)

**Acessibilidade e usabilidade**
- Contraste de cores (WCAG) — verificar textos em #64748b
- Touch targets mínimos 44px em mobile
- Feedback visual em ações (loading, sucesso, erro)
- Modo escuro opcional?

---

### Winston (Arquiteto)

**Estrutura do layout**
- Header fixo com altura reduzida em scroll (opcional)
- Sidebar em desktop para admin (menu vertical) — mais escalável que nav horizontal
- Conteúdo principal com `max-width` para leitura confortável em telas grandes
- Footer com versão ou links úteis (opcional)

**Componentes reutilizáveis**
- Padronizar cards (dash-form-card, dash-stat-card)
- Sistema de tabs para agrupar conteúdo
- Modal para ações secundárias (ex: confirmar exclusão)

---

### John (PM)

**Priorização**
1. **Menu** — impacto alto, dor imediata em mobile
2. **Dashboard operador** — tela mais usada, precisa ser clara
3. **Tabelas** (entradas ativas, relatórios) — melhorar legibilidade
4. **Páginas admin** — consistência visual

**Métricas de sucesso**
- Operador encontra "Entrada" e "Saída" em < 2 segundos
- Admin navega entre Relatórios e Fechamento sem confusão
- Mobile: uso sem zoom ou scroll horizontal

---

## Ideias consolidadas (para implementar)

| # | Melhoria | Esforço | Impacto |
|---|---------|---------|---------|
| 1 | Menu responsivo: hamburger em mobile, dropdown por categoria | Médio | Alto |
| 2 | Ícones no menu (Lucide ou similar) | Baixo | Médio |
| 3 | Sidebar admin em desktop (menu vertical) | Médio | Alto |
| 4 | Dashboard operador: layout em abas ou empilhado em mobile | Baixo | Alto |
| 5 | Cards com hover e hierarquia visual | Baixo | Médio |
| 6 | Estados vazios com ilustração/mensagem | Baixo | Médio |
| 7 | Breadcrumb nas páginas | Baixo | Baixo |
| 8 | Revisão de contraste e touch targets | Baixo | Alto (a11y) |

---

## Sugestão do time: implementar tudo

**John (PM):** Sim, é possível. Priorizar por impacto e dependências:
1. Sidebar + menu responsivo (base para ícones)
2. Ícones no menu
3. Dashboard mobile (já empilha; adicionar abas opcionais)
4. Cards hover + estados vazios + breadcrumb + a11y (rápidos)

**Winston (Arquiteto):** Ordem sugerida: estrutura (sidebar/nav) → refinamentos (ícones, hover, empty states). Evitar retrabalho.

**Sally (UX):** Concordo. Implementar em uma única iteração — itens de baixo esforço somam pouco tempo e o ganho visual é grande.

---

## Próximos passos

1. ~~Validar prioridades com o usuário~~
2. Implementar todos os itens
3. Testar em mobile/desktop

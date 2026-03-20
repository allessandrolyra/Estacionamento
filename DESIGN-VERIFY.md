# Verificação Design — Tela de Operações

**Marco:** Time, verifiquem a tela de operações — ainda está com a visão antiga?

---

## Checklist para o time

### Sally (UX)
- [ ] **Rota /dashboard** — Ao acessar Operações, o header mostra ícones e hamburger no mobile?
- [ ] **Conteúdo** — Os cards (Entrada, Saída, Entradas ativas) têm hover e hierarquia visual?
- [ ] **Mobile** — O menu hamburger abre o drawer corretamente?
- [ ] **Estados vazios** — "Nenhuma entrada ativa" usa o novo estilo (dash-empty-state)?

### Winston (Arquiteto)
- [ ] **Layout** — Dashboard usa `DashboardLayoutClient` (header + main)?
- [ ] **Admin vs Operações** — Admin tem sidebar; Operações tem header. É intencional?
- [ ] **Navegação** — Admin clica "Operações" → vai para /dashboard → perde sidebar. Esperado?

### Amelia (Dev)
- [ ] **Build** — `npm run build` passa?
- [ ] **Cache** — Usuário fez hard refresh (Ctrl+Shift+R) após deploy?
- [ ] **Rotas** — /dashboard e /dashboard/mapa usam o mesmo layout?

### Quinn (QA)
- [ ] **Desktop** — Header com links e ícones visíveis?
- [ ] **Mobile** — Hamburger visível, drawer abre ao clicar?
- [ ] **Operador** — Sem link Admin, vê Estacionamento + Mapa?
- [ ] **Admin** — Vê Estacionamento + Mapa + Fechamento + Admin?

---

## Possíveis causas da "visão antiga"

1. **Cache do navegador** — Hard refresh ou limpar cache
2. **Deploy não aplicado** — Verificar se o último commit foi enviado
3. **Rota diferente** — Operações = /dashboard (não /admin/dashboard)
4. **Expectativa** — Operações usa header (não sidebar); Admin usa sidebar

---

## Ajustes aplicados

- Título "Operações" no topo do conteúdo
- Breadcrumb na tela de operações
- Garantir que o layout do dashboard esteja aplicado corretamente

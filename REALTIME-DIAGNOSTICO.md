# Diagnóstico: Entradas ativas não atualizam em realtime

**Problema:** Ao dar entrada, o carro não aparece em "Entradas ativas" sem refresh.

---

## Análise do time

### Winston (Arquiteto)
O Supabase Realtime usa **Logical Replication** do PostgreSQL. Por padrão, as tabelas **não** estão na publicação `supabase_realtime`. Sem isso, as alterações não são transmitidas via WebSocket.

**Solução:** Adicionar a tabela `entradas` à publicação:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE entradas;
```

### Quinn (QA)
- O código do dashboard está correto — usa `postgres_changes` em `entradas`
- O callback chama `carregarEntradasAtivas()` e `recarregarVagasDisponiveis()`
- Se o evento não chega, o callback nunca roda

### Sally (UX)
- O usuário espera ver a entrada imediatamente
- Fallback: enquanto Realtime não funciona, podemos adicionar `carregarEntradasAtivas()` após sucesso no `handleEntrada` (já resolve para o próprio usuário)

---

## Causa raiz

A tabela `entradas` **não estava** na publicação `supabase_realtime`. O Supabase só transmite eventos de tabelas explicitamente adicionadas.

---

## Solução aplicada

**Migration 009:** `ALTER PUBLICATION supabase_realtime ADD TABLE entradas;`

**Executar no Supabase SQL Editor** (ou via migration):
```
supabase/migrations/009_realtime_entradas.sql
```

---

## Fallback no código (opcional)

Como reforço, chamar `carregarEntradasAtivas()` após registrar entrada com sucesso — assim o usuário que fez a ação vê a atualização mesmo se Realtime falhar:

```ts
if (r.ok) {
  carregarEntradasAtivas();  // atualiza imediatamente para quem registrou
  recarregarVagasDisponiveis();
  // ...
}
```

Isso não substitui o Realtime (outros operadores em outras abas não veriam), mas melhora a experiência de quem registrou.

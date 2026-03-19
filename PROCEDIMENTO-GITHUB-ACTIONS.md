# Procedimento — GitHub Actions (Free)

**Projeto:** Sistema de Gerenciamento de Estacionamento  
**Objetivo:** Configurar CI (build + lint) no GitHub Actions usando o plano gratuito

---

## O que é o GitHub Actions Free?

- **Repositórios públicos:** 2.000 minutos/mês gratuitos (ou mais, conforme plano)
- **Repositórios privados:** 2.000 minutos/mês gratuitos
- **O que você terá:** Build e lint automáticos a cada push/PR na branch `main`

---

## Passo 1 — Verificar se o workflow existe

O projeto já está em `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Node.js 20
      - npm ci
      - npm run lint
      - npm run build
```

---

## Passo 2 — Criar repositório no GitHub (se ainda não estiver)

1. Acesse [github.com](https://github.com)
2. Crie o repositório: [allessandrolyra/Estacionamento](https://github.com/allessandrolyra/Estacionamento)
3. Envie o código com push:

```powershell
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git add .
git commit -m "Add GitHub Actions CI workflow"
git push origin main
```

---

## Passo 3 — Configurar Secrets no GitHub

O build precisa das variáveis do Supabase. Sem elas, o build pode falhar.

1. Abra o repositório: [github.com/allessandrolyra/Estacionamento](https://github.com/allessandrolyra/Estacionamento)
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Crie os secrets abaixo:

| Nome do Secret | Valor | Onde pegar |
|----------------|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase → Project Settings → API → anon public |

**Importante:** Use os nomes exatos. O workflow usa `secrets.NEXT_PUBLIC_SUPABASE_URL` e `secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## Passo 4 — Habilitar o GitHub Actions

1. No repositório, vá para **Actions**
2. Se aparecer "Get started with GitHub Actions", clique em **Enable**
3. O workflow já está em `.github/workflows/ci.yml` — será detectado automaticamente

---

## Passo 5 — Rodar o workflow

1. Faça um push ou abra um Pull Request:

```powershell
git add .
git commit -m "Trigger CI"
git push origin main
```

2. Vá em **Actions** no GitHub
3. Clique no workflow **CI** (ou no job mais recente)
4. Acompanhe a execução

---

## Passo 6 — Interpretar o resultado

| Status | Significado |
|--------|-------------|
| ✅ Verde | Build e lint passaram |
| ❌ Vermelho | Erro em lint ou build — verifique os logs |

---

## Passo 7 — Ver logs em caso de erro

1. **Actions** → clique no workflow que falhou
2. Clique no job **build**
3. Expanda o step que falhou

Exemplos comuns:
- **Lint falhou:** ajuste o código conforme o ESLint
- **Build falhou:** verifique se os secrets estão corretos
- **Secrets não definidos:** configure os secrets no Passo 3

---

## Resumo do fluxo

```
Push/PR → GitHub Actions → npm ci → lint → build → ✅ ou ❌
```

---

## Limites do plano Free

| Repositório | Minutos/mês |
|-------------|-------------|
| Público | 2.000 (ou mais) |
| Privado | 2.000 |

O workflow deste projeto usa cerca de 2–3 minutos por execução. Com 2.000 minutos, dá para centenas de execuções por mês.

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL is not defined` | Crie o secret no Settings → Secrets |
| `npm ci` falha | Verifique se há `package-lock.json`; se não, rode `npm install` e faça commit |
| Workflow não aparece | Confirme que o arquivo está em `.github/workflows/ci.yml` e que foi commitado |

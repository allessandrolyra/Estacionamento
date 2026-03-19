# Procedimento — Subir o site no GitHub

**Projeto:** Sistema de Gerenciamento de Estacionamento  
**Equipe:** MEQ  
**Objetivo:** Publicar o código no GitHub para versionamento e deploy (ex.: Vercel)

---

## Pré-requisitos

- [ ] Conta no [GitHub](https://github.com)
- [ ] Git instalado no computador ([baixar](https://git-scm.com/downloads))
- [ ] Projeto funcionando localmente (`npm run dev`)

---

## Passo 1 — Verificar se o Git está instalado

Abra o PowerShell ou terminal e execute:

```powershell
git --version
```

Se aparecer a versão (ex.: `git version 2.43.0`), prossiga. Caso contrário, instale o Git.

---

## Passo 2 — Repositório no GitHub

Repositório já criado: [allessandrolyra/Estacionamento](https://github.com/allessandrolyra/Estacionamento)

URL para os comandos: `https://github.com/allessandrolyra/Estacionamento.git`

---

## Passo 3 — Verificar o arquivo .gitignore

O projeto já possui `.gitignore` para evitar que arquivos sensíveis sejam enviados. Confira se contém pelo menos:

```
# Dependencies
node_modules/

# Environment
.env
.env.local
.env*.local

# Next.js
.next/
out/

# Build
dist/
build/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

**Importante:** Nunca commite `.env.local` — ele contém chaves secretas.

---

## Passo 4 — Inicializar o Git no projeto (se ainda não estiver)

No PowerShell, navegue até a pasta do projeto:

```powershell
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
```

Verifique se já existe um repositório Git:

```powershell
git status
```

- Se aparecer **"not a git repository"**, inicialize:
  ```powershell
  git init
  ```
- Se aparecer arquivos listados, o Git já está configurado. Pule para o Passo 5.

---

## Passo 5 — Configurar usuário Git (primeira vez)

Se ainda não configurou seu nome e email no Git:

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

Use o mesmo email da sua conta GitHub.

---

## Passo 6 — Adicionar os arquivos ao staging

```powershell
git add .
```

Verifique o que será commitado (não deve aparecer `.env.local`):

```powershell
git status
```

---

## Passo 7 — Fazer o primeiro commit

```powershell
git commit -m "Initial commit - Sistema de estacionamento Next.js + Supabase"
```

---

## Passo 8 — Conectar ao repositório remoto do GitHub

```powershell
git remote add origin https://github.com/allessandrolyra/Estacionamento.git
```

Para verificar:

```powershell
git remote -v
```

---

## Passo 9 — Renomear branch para main (se necessário)

O GitHub usa `main` como branch padrão. Verifique sua branch atual:

```powershell
git branch
```

Se estiver em `master`, renomeie:

```powershell
git branch -M main
```

---

## Passo 10 — Enviar o código para o GitHub

```powershell
git push -u origin main
```

- Na primeira vez, o Git pode pedir login no GitHub (janela do navegador ou credenciais).
- Se usar autenticação por token, use o token como senha.

---

## Passo 11 — Confirmar no GitHub

1. Atualize a página do repositório no navegador.
2. Verifique se todos os arquivos aparecem.
3. Confirme que **não** há `.env.local` na lista (segurança).

---

## Resumo dos comandos (sequência completa)

```powershell
cd "c:\01. Foursys\06. BMAD Cursor\estacionamento"
git init
git add .
git status
git commit -m "Initial commit - Sistema de estacionamento Next.js + Supabase"
git remote add origin https://github.com/allessandrolyra/Estacionamento.git
git branch -M main
git push -u origin main
```

---

## Próximos passos (opcional) — Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub.
2. **Add New** → **Project**.
3. Importe o repositório [allessandrolyra/Estacionamento](https://github.com/allessandrolyra/Estacionamento).
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (se usar gestão de usuários)
5. Clique em **Deploy**.
6. Após o deploy, o site ficará em `https://estacionamento-xxx.vercel.app`.

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `git: command not found` | Instale o Git e reinicie o terminal |
| `Permission denied (publickey)` | Configure SSH ou use HTTPS com token |
| `failed to push` | Verifique se a URL do remote está correta: `git remote -v` |
| `.env.local` aparece no status | Adicione `.env.local` ao `.gitignore` e remova do staging: `git reset HEAD .env.local` |

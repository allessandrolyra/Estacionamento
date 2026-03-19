/**
 * Script para criar o primeiro usuário Admin no Supabase.
 * Execute: node scripts/seed-admin.js
 *
 * Requer .env.local com:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Ou defina as variáveis antes de rodar:
 *   $env:NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   node scripts/seed-admin.js
 */

const fs = require("fs");
const path = require("path");

// Carrega .env.local se existir
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    });
}

const { createClient } = require("@supabase/supabase-js");
const readline = require("readline");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Erro: Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
    console.error("Copie do Supabase: Project Settings > API > Project URL e service_role (secret)");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((r) => rl.question(q, r));

  console.log("\n=== Criar primeiro usuário Admin ===\n");
  const email = await ask("Email: ");
  const password = await ask("Senha: ");
  rl.close();

  if (!email || !password) {
    console.error("Email e senha são obrigatórios.");
    process.exit(1);
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password: password.trim(),
    email_confirm: true,
    user_metadata: { role: "admin" },
  });

  if (error) {
    console.error("Erro ao criar usuário:", error.message);
    if (error.message.includes("already been registered")) {
      console.error("O email já existe. Use outro ou altere a role no Supabase Dashboard.");
    }
    process.exit(1);
  }

  console.log("\n✅ Admin criado com sucesso!");
  console.log("   Email:", data.user.email);
  console.log("   Role: admin");
  console.log("\nAcesse http://localhost:3000/login e faça login.");
}

main();

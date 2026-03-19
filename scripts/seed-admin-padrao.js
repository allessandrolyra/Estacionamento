/**
 * Script para criar o usuário Admin PADRÃO no Supabase.
 * Execute: npm run seed:admin-padrao
 *
 * Credenciais padrão (troque a senha após o primeiro login):
 *   Email: admin@estacionamento.local
 *   Senha: Admin@123
 *
 * Requer .env.local com:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const fs = require("fs");
const path = require("path");

// Credenciais padrão do Admin principal
const ADMIN_PADRAO = {
  email: "admin@estacionamento.local",
  senha: "Admin@123",
};

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

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Erro: Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
    console.error("Copie do Supabase: Project Settings > API > Project URL e service_role (secret)");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  console.log("\n=== Criar Admin Padrão ===\n");
  console.log("Email:", ADMIN_PADRAO.email);
  console.log("Senha:", ADMIN_PADRAO.senha);
  console.log("\n(Altere a senha após o primeiro login em Admin > Usuários)\n");

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_PADRAO.email,
    password: ADMIN_PADRAO.senha,
    email_confirm: true,
    user_metadata: { role: "admin" },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      console.error("⚠ O admin padrão já existe.");
      console.error("  Use:", ADMIN_PADRAO.email);
      console.error("  Senha: a que você definiu (ou redefina no Supabase Dashboard)");
      console.error("\n  Para redefinir: Supabase > Authentication > Users > [usuário] > Send password recovery");
    } else {
      console.error("Erro ao criar usuário:", error.message);
    }
    process.exit(1);
  }

  console.log("✅ Admin padrão criado com sucesso!");
  console.log("   Email:", data.user.email);
  console.log("   Role: admin");
  console.log("\nAcesse o site e faça login. Depois altere a senha em Admin > Usuários.");
}

main();

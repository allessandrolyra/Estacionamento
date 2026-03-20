"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FeedbackMessage } from "@/components/ui/feedback-message";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [trocarMsg, setTrocarMsg] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setTrocarMsg(searchParams.get("trocar") === "1");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    const { data } = await supabase.auth.getUser();
    const role = data.user?.user_metadata?.role;
    if (role === "admin") router.push("/admin/dashboard");
    else router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-card">
        <h1>Estacionamento</h1>
        {trocarMsg && (
          <p className="login-trocar-msg">Faça login com outro usuário</p>
        )}
        <div className="login-field">
          <label>Email</label>
          <input
            type="email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="login-field">
          <label>Senha</label>
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <FeedbackMessage message={error} type="error" />
        <button type="submit" className="login-btn">Entrar</button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="login-page">
        <div className="login-card">
          <h1>Estacionamento</h1>
          <p style={{ color: "var(--color-muted)" }}>Carregando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

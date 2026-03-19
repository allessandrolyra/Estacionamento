"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validarPlaca, normalizarPlaca } from "@/lib/utils/placa";

interface Mensalista {
  id: string;
  nome: string;
  placa: string;
  validade_ate: string;
  ativo: boolean;
}

export function MensalistasClient({ initial }: { initial: Mensalista[] }) {
  const [mensalistas, setMensalistas] = useState(initial);
  useEffect(() => {
    setMensalistas(initial);
  }, [initial]);
  const [nome, setNome] = useState("");
  const [placa, setPlaca] = useState("");
  const [validade, setValidade] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const placaNorm = normalizarPlaca(placa);
    if (!validarPlaca(placaNorm)) {
      setMsg("Placa inválida. Use formato ABC-1234 ou ABC1D23");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("mensalistas").insert({
      nome,
      placa: placaNorm,
      validade_ate: validade,
      ativo: true,
    });
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg("Cadastrado!");
    setNome("");
    setPlaca("");
    setValidade("");
    router.refresh();
  }

  async function handleInativar(id: string) {
    const supabase = createClient();
    await supabase.from("mensalistas").update({ ativo: false }).eq("id", id);
    router.refresh();
  }

  return (
    <div>
      <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Novo mensalista</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem" }}>Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem" }}>Placa</label>
            <input
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              required
              maxLength={8}
              style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem" }}>Validade</label>
            <input
              type="date"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              required
              style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <button type="submit" style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Cadastrar
          </button>
        </form>
      </div>

      <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Lista</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Nome</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Placa</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Validade</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mensalistas.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.5rem" }}>{m.nome}</td>
                <td style={{ padding: "0.5rem" }}>{m.placa}</td>
                <td style={{ padding: "0.5rem" }}>{m.validade_ate}</td>
                <td style={{ padding: "0.5rem" }}>{m.ativo ? "Ativo" : "Inativo"}</td>
                <td style={{ padding: "0.5rem" }}>
                  {m.ativo && (
                    <button
                      onClick={() => handleInativar(m.id)}
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Inativar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mensalistas.length === 0 && <p style={{ padding: "1rem", color: "#666" }}>Nenhum mensalista</p>}
      </div>

      {msg && <p style={{ marginTop: "1rem", padding: "0.5rem", background: "#f0fdf4", borderRadius: "4px" }}>{msg}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { createUser, updateUserRole, type Role } from "./actions";

interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export function UsuariosClient({ users }: { users: User[] }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("operador");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("password", password);
      fd.set("role", role);
      await createUser(fd);
      setMsg("Usuário criado com sucesso!");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao criar usuário.");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeRole(userId: string, newRole: Role) {
    setMsg("");
    try {
      await updateUserRole(userId, newRole);
      setMsg("Permissão atualizada!");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao atualizar.");
    }
  }

  return (
    <div className="admin-usuarios">
      <div className="admin-usuarios-card">
        <h2>Novo usuário</h2>
        <form onSubmit={handleCreate}>
          <div className="admin-usuarios-field">
            <label>Email</label>
            <input
              type="email"
              className="dash-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="admin-usuarios-field">
            <label>Senha (mín. 6 caracteres)</label>
            <input
              type="password"
              className="dash-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="admin-usuarios-field">
            <label>Permissão</label>
            <select
              className="dash-input"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="operador">Operador</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="dash-btn dash-btn-entrada" disabled={loading}>
            {loading ? "Criando..." : "Criar usuário"}
          </button>
        </form>
      </div>

      <div className="admin-usuarios-card">
        <h2>Usuários do sistema</h2>
        <table className="admin-usuarios-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Permissão</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>
                  <span className={`admin-usuarios-badge admin-usuarios-badge-${u.role}`}>
                    {u.role === "admin" ? "Admin" : "Operador"}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                <td>
                  <select
                    className="admin-usuarios-select"
                    value={u.role}
                    onChange={(e) => handleChangeRole(u.id, e.target.value as Role)}
                  >
                    <option value="operador">Operador</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="admin-usuarios-empty">Nenhum usuário cadastrado.</p>
        )}
      </div>

      {msg && (
        <p className={`dash-msg ${msg.includes("Erro") ? "error" : "success"}`}>{msg}</p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { createUser, updateUserRole, deleteUser, resetUserPassword, type Role } from "./actions";
import { FeedbackMessage } from "@/components/ui/feedback-message";

interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface Props {
  users: User[];
  currentUserId: string;
}

export function UsuariosClient({ users, currentUserId }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);

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

  async function handleDelete(userId: string, userEmail: string) {
    if (userId === currentUserId) {
      setMsg("Você não pode excluir sua própria conta.");
      return;
    }
    if (!confirm(`Excluir o usuário ${userEmail}? Esta ação não pode ser desfeita.`)) return;
    setMsg("");
    try {
      await deleteUser(userId, users);
      setMsg("Usuário excluído.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  async function handleResetPassword(userId: string) {
    const senha = prompt("Nova senha (mín. 6 caracteres):");
    if (!senha || senha.length < 6) {
      if (senha !== null) setMsg("Senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setMsg("");
    setResettingId(userId);
    try {
      await resetUserPassword(userId, senha);
      setMsg("Senha alterada com sucesso!");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao alterar senha.");
    } finally {
      setResettingId(null);
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
          <FeedbackMessage
            message={msg}
            type={/Erro|não pode|Senha deve/.test(msg) ? "error" : "success"}
          />
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
                  <div className="admin-usuarios-actions">
                    <select
                      className="admin-usuarios-select"
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value as Role)}
                    >
                      <option value="operador">Operador</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="button"
                      className="admin-usuarios-btn admin-usuarios-btn-senha"
                      onClick={() => handleResetPassword(u.id)}
                      disabled={resettingId === u.id}
                      title="Redefinir senha"
                    >
                      🔑
                    </button>
                    <button
                      type="button"
                      className="admin-usuarios-btn admin-usuarios-btn-excluir"
                      onClick={() => handleDelete(u.id, u.email)}
                      disabled={u.id === currentUserId}
                      title={u.id === currentUserId ? "Não é possível excluir sua própria conta" : "Excluir usuário"}
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="admin-usuarios-empty">Nenhum usuário cadastrado.</p>
        )}
      </div>
    </div>
  );
}

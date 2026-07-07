/** @format */

"use client";
import { type FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import type { AdminUserListItem } from "@/lib/admin-users";

type UserRole = AdminUserListItem["role"];
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const roleLabels: Record<UserRole, string> = {
  CLIENT: "Cliente",
  BARBER: "Barbeiro",
  ADMIN: "Administrador",
};

const roleOptions: Array<{ value: "ALL" | UserRole; label: string }> = [
  { value: "ALL", label: "Todos os tipos" },
  { value: "CLIENT", label: "Clientes" },
  { value: "BARBER", label: "Barbeiros" },
  { value: "ADMIN", label: "Administradores" },
];

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "Todos os status" },
  { value: "ACTIVE", label: "Ativos" },
  { value: "INACTIVE", label: "Inativos" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function emptyForm(user?: AdminUserListItem) {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? ("CLIENT" as UserRole),
    active: user?.active ?? true,
  };
}

export default function UserManager({
  currentUserId,
  initialUsers,
}: {
  currentUserId: string;
  initialUsers: AdminUserListItem[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedUserId, setSelectedUserId] = useState(
    initialUsers[0]?.id ?? "",
  );
  const [editingUserId, setEditingUserId] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const editingUser = users.find((user) => user.id === editingUserId) ?? null;

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        (user.phone?.toLowerCase().includes(normalizedSearch) ?? false);
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? user.active : !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, search, statusFilter, users]);

  async function reloadUsers() {
    const response = await fetch("/api/admin/users");
    const data = (await response.json()) as {
      users?: AdminUserListItem[];
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error ?? "Erro ao atualizar a listagem.");
    }

    setUsers(data.users ?? []);
  }

  function startEditing(user: AdminUserListItem) {
    setEditingUserId(user.id);
    setSelectedUserId(user.id);
    setForm(emptyForm(user));
    setError("");
    setMessage("");
  }

  function stopEditing() {
    setEditingUserId("");
    setForm(emptyForm());
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUserId) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as {
        user?: AdminUserListItem;
        error?: string;
      };

      if (!response.ok || !data.user) {
        throw new Error(data.error ?? "Erro ao salvar usuário.");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === data.user?.id ? data.user : user,
        ),
      );
      setSelectedUserId(data.user.id);
      stopEditing();
      setMessage("Usuário atualizado com sucesso.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao salvar usuário.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeOrDeactivateUser(user: AdminUserListItem) {
    const actionLabel = user.linkedRecordsCount > 0 ? "desativar" : "excluir";
    const confirmed = window.confirm(
      `Deseja ${actionLabel} ${user.name}? Esta ação refletirá na listagem.`,
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as {
        action?: "deleted" | "deactivated";
        user?: AdminUserListItem;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao excluir ou desativar usuário.");
      }

      if (data.action === "deleted") {
        setUsers((currentUsers) =>
          currentUsers.filter((currentUser) => currentUser.id !== user.id),
        );
        if (selectedUserId === user.id) setSelectedUserId("");
      } else if (data.user) {
        setUsers((currentUsers) =>
          currentUsers.map((currentUser) =>
            currentUser.id === data.user?.id ? data.user : currentUser,
          ),
        );
        setSelectedUserId(data.user.id);
      }

      if (editingUserId === user.id) stopEditing();

      setMessage(
        data.action === "deleted"
          ? "Usuário excluído com sucesso."
          : "Usuário desativado porque possui vínculos no sistema.",
      );
      await reloadUsers();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao excluir ou desativar usuário.",
      );
    }
  }

  const activeUsers = users.filter((user) => user.active).length;
  const inactiveUsers = users.length - activeUsers;

  return (
    <main className="min-h-screen bg-[#222220] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto grid w-full max-w-7xl gap-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wide text-[#b9ff62]">
              Área administrativa
            </span>
            <h1 className="mt-2 text-2xl font-black uppercase">
              Gerenciamento de usuários
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Consulte cadastros, edite perfis e controle usuários ativos.
            </p>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-white/10 bg-[#171717] p-4">
            <p className="text-[10px] font-black uppercase text-white/40">
              Total
            </p>
            <p className="mt-2 text-2xl font-black">{users.length}</p>
          </div>
          <div className="rounded-md border border-[#b9ff62]/20 bg-[#171717] p-4">
            <p className="text-[10px] font-black uppercase text-[#b9ff62]">
              Ativos
            </p>
            <p className="mt-2 text-2xl font-black">{activeUsers}</p>
          </div>
          <div className="rounded-md border border-red-400/20 bg-[#171717] p-4">
            <p className="text-[10px] font-black uppercase text-red-200">
              Inativos
            </p>
            <p className="mt-2 text-2xl font-black">{inactiveUsers}</p>
          </div>
        </section>

        {message && (
          <div className="rounded-md border border-[#b9ff62]/30 bg-[#b9ff62]/10 px-4 py-3 text-sm text-[#d8ff9d]">
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <section className="rounded-md border border-white/10 bg-[#171717] p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
            <div className="grid gap-2">
              <label
                htmlFor="user-search"
                className="text-xs font-bold uppercase">
                Busca
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  id="user-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nome, e-mail ou telefone"
                  className="h-11 w-full rounded-md border border-white/10 bg-[#101010] pl-10 pr-3 text-sm outline-none focus:border-[#b9ff62]"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="role-filter"
                className="text-xs font-bold uppercase">
                Tipo
              </label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as "ALL" | UserRole)
                }
                className="h-11 rounded-md border border-white/10 bg-[#101010] px-3 text-sm outline-none focus:border-[#b9ff62]">
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="status-filter"
                className="text-xs font-bold uppercase">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-11 rounded-md border border-white/10 bg-[#101010] px-3 text-sm outline-none focus:border-[#b9ff62]">
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
              }}
              title="Limpar filtros"
              className="flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-xs font-black uppercase text-white/70 hover:border-white/20 hover:text-white">
              <RotateCcw size={16} />
              Limpar
            </button>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <section className="overflow-hidden rounded-md border border-white/10 bg-[#171717]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-black uppercase">
                Usuários cadastrados
              </h2>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-5 text-sm text-white/45">
                Nenhum usuário encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-230 text-left text-xs">
                  <thead className="bg-[#101010] text-[10px] uppercase tracking-wider text-white/40">
                    <tr>
                      <th className="px-5 py-3">Nome</th>
                      <th className="px-5 py-3">Contato</th>
                      <th className="px-5 py-3">Tipo</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Cadastro</th>
                      <th className="px-5 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => {
                      const isSelf = user.id === currentUserId;
                      const isEditing = user.id === editingUserId;
                      const statusClassName = user.active
                        ? "bg-[#b9ff62]/10 text-[#b9ff62]"
                        : "bg-red-400/10 text-red-200";

                      return (
                        <tr
                          key={user.id}
                          className={`text-white/65 ${
                            isEditing ? "bg-[#b9ff62]/5" : ""
                          }`}>
                          <td className="px-5 py-4">
                            <span className="block font-black text-white">
                              {user.name}
                            </span>
                            {isSelf && (
                              <span className="mt-1 inline-block rounded bg-white/10 px-2 py-1 text-[10px] font-black uppercase text-white/60">
                                Você
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="block text-white">
                              {user.email}
                            </span>
                            <span className="text-[10px] text-white/35">
                              {user.phone || "Sem telefone"}
                            </span>
                          </td>
                          <td className="px-5 py-4">{roleLabels[user.role]}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded px-2 py-1 text-[10px] font-black uppercase ${statusClassName}`}>
                              {user.active ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedUserId(user.id)}
                                title="Visualizar usuário"
                                className="grid size-9 place-items-center rounded-md border border-white/10 text-white/70 hover:border-white/20 hover:text-white">
                                <Eye size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditing(user)}
                                title="Editar usuário"
                                className="grid size-9 place-items-center rounded-md bg-[#b9ff62] text-black">
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => removeOrDeactivateUser(user)}
                                title={
                                  isSelf
                                    ? "Você não pode desativar a si mesmo"
                                    : user.linkedRecordsCount > 0
                                      ? "Desativar usuário"
                                      : "Excluir usuário"
                                }
                                className="grid size-9 place-items-center rounded-md border border-red-400/40 text-red-200 disabled:cursor-not-allowed disabled:opacity-35">
                                {user.linkedRecordsCount > 0 ? (
                                  <UserX size={16} />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="grid gap-5">
            <section className="rounded-md border border-white/10 bg-[#171717] p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black uppercase">Visualização</h2>
                  <p className="mt-1 text-xs text-white/45">
                    Dados principais do cadastro selecionado.
                  </p>
                </div>
                {selectedUser && (
                  <button
                    type="button"
                    onClick={() => startEditing(selectedUser)}
                    title="Editar usuário selecionado"
                    className="grid size-9 place-items-center rounded-md bg-[#b9ff62] text-black">
                    <Pencil size={16} />
                  </button>
                )}
              </div>

              {selectedUser ? (
                <dl className="grid gap-4 text-sm">
                  <div>
                    <dt className="text-[10px] font-black uppercase text-white/35">
                      Nome
                    </dt>
                    <dd className="mt-1 font-bold text-white">
                      {selectedUser.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-black uppercase text-white/35">
                      E-mail
                    </dt>
                    <dd className="mt-1 text-white/75">{selectedUser.email}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-[10px] font-black uppercase text-white/35">
                        Tipo
                      </dt>
                      <dd className="mt-1 text-white/75">
                        {roleLabels[selectedUser.role]}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase text-white/35">
                        Status
                      </dt>
                      <dd className="mt-1 text-white/75">
                        {selectedUser.active ? "Ativo" : "Inativo"}
                      </dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-[10px] font-black uppercase text-white/35">
                      Telefone
                    </dt>
                    <dd className="mt-1 text-white/75">
                      {selectedUser.phone || "Não informado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-black uppercase text-white/35">
                      Cadastro
                    </dt>
                    <dd className="mt-1 text-white/75">
                      {formatDate(selectedUser.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-black uppercase text-white/35">
                      Vínculos
                    </dt>
                    <dd className="mt-1 text-white/75">
                      {selectedUser.linkedRecordsCount} registro(s)
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-white/45">
                  Selecione um usuário para visualizar.
                </p>
              )}
            </section>

            <section className="rounded-md border border-white/10 bg-[#171717] p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black uppercase">
                    Editar informações
                  </h2>
                  <p className="mt-1 text-xs text-white/45">
                    Nome, contato, tipo e status do usuário.
                  </p>
                </div>
                {editingUserId && (
                  <button
                    type="button"
                    onClick={stopEditing}
                    title="Cancelar edição"
                    className="grid size-9 place-items-center rounded-md border border-white/10 text-white/70 hover:text-white">
                    <X size={16} />
                  </button>
                )}
              </div>

              {editingUser ? (
                <form onSubmit={saveUser} className="grid gap-4">
                  <div className="grid gap-2">
                    <label
                      htmlFor="edit-name"
                      className="text-xs font-bold uppercase">
                      Nome
                    </label>
                    <input
                      id="edit-name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          name: event.target.value,
                        }))
                      }
                      className="h-11 rounded-md border border-white/10 bg-[#101010] px-3 text-sm outline-none focus:border-[#b9ff62]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="edit-email"
                      className="text-xs font-bold uppercase">
                      E-mail
                    </label>
                    <input
                      id="edit-email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          email: event.target.value,
                        }))
                      }
                      className="h-11 rounded-md border border-white/10 bg-[#101010] px-3 text-sm outline-none focus:border-[#b9ff62]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="edit-phone"
                      className="text-xs font-bold uppercase">
                      Telefone
                    </label>
                    <input
                      id="edit-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          phone: event.target.value,
                        }))
                      }
                      className="h-11 rounded-md border border-white/10 bg-[#101010] px-3 text-sm outline-none focus:border-[#b9ff62]"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label
                        htmlFor="edit-role"
                        className="text-xs font-bold uppercase">
                        Tipo
                      </label>
                      <select
                        id="edit-role"
                        value={form.role}
                        disabled={editingUser.id === currentUserId}
                        onChange={(event) =>
                          setForm((currentForm) => ({
                            ...currentForm,
                            role: event.target.value as UserRole,
                          }))
                        }
                        className="h-11 rounded-md border border-white/10 bg-[#101010] px-3 text-sm outline-none focus:border-[#b9ff62] disabled:opacity-55">
                        <option value="CLIENT">Cliente</option>
                        <option value="BARBER">Barbeiro</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label
                        htmlFor="edit-status"
                        className="text-xs font-bold uppercase">
                        Status
                      </label>
                      <select
                        id="edit-status"
                        value={form.active ? "ACTIVE" : "INACTIVE"}
                        disabled={editingUser.id === currentUserId}
                        onChange={(event) =>
                          setForm((currentForm) => ({
                            ...currentForm,
                            active: event.target.value === "ACTIVE",
                          }))
                        }
                        className="h-11 rounded-md border border-white/10 bg-[#101010] px-3 text-sm outline-none focus:border-[#b9ff62] disabled:opacity-55">
                        <option value="ACTIVE">Ativo</option>
                        <option value="INACTIVE">Inativo</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex h-11 items-center gap-2 rounded-md bg-[#b9ff62] px-5 text-sm font-black text-black disabled:opacity-60">
                      <CheckCircle2 size={16} />
                      {saving ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={stopEditing}
                      className="h-11 rounded-md border border-white/10 px-5 text-sm font-bold text-white/75 hover:text-white">
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-white/45">
                  Selecione editar em um usuário.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Shield, Trash2, UserCog } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PermissionMatrix, { createEmptyPermissions } from "@/components/admin/PermissionMatrix";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  createTeamMember,
  deleteTeamMember,
  fetchTeamMembers,
  updateTeamMember,
  type TeamMemberPayload,
} from "@/lib/admin-api";
import { normalizePermissions } from "@/lib/permissions";
import type { TeamPermissions } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export default function AdminTeamPage() {
  const router = useRouter();
  const { isOwner, loading: authLoading } = useAuth();
  const [members, setMembers] = useState<TeamMemberPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    email: "",
    displayName: "",
    password: "",
    permissions: createEmptyPermissions(),
  });

  const [editForm, setEditForm] = useState({
    displayName: "",
    password: "",
    permissions: createEmptyPermissions(),
    active: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchTeamMembers();
      setMembers(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Laden fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isOwner) {
      router.replace("/admin/start");
    }
  }, [authLoading, isOwner, router]);

  useEffect(() => {
    if (isOwner) {
      load().catch(console.error);
    }
  }, [isOwner, load]);

  const startEdit = (member: TeamMemberPayload) => {
    if (member.role !== "team") return;
    setEditingId(member.id);
    setEditForm({
      displayName: member.displayName,
      password: "",
      permissions: normalizePermissions(member.permissions),
      active: member.active,
    });
    setShowCreate(false);
    setMessage("");
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await createTeamMember(createForm);
      setCreateForm({
        email: "",
        displayName: "",
        password: "",
        permissions: createEmptyPermissions(),
      });
      setShowCreate(false);
      setMessage("Team-Zugang erstellt.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erstellen fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateTeamMember({
        userId: editingId,
        displayName: editForm.displayName,
        permissions: editForm.permissions,
        active: editForm.active,
        ...(editForm.password ? { password: editForm.password } : {}),
      });
      setEditingId(null);
      setMessage("Team-Zugang aktualisiert.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: TeamMemberPayload) => {
    if (member.role !== "team") return;
    if (!window.confirm(`Zugang von ${member.displayName} wirklich löschen?`)) return;
    setSaving(true);
    setError("");
    try {
      await deleteTeamMember(member.id);
      if (editingId === member.id) setEditingId(null);
      setMessage("Team-Zugang gelöscht.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isOwner) {
    return (
      <div className="flex items-center justify-center py-20 text-stone">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Laden…
      </div>
    );
  }

  const teamMembers = members.filter((m) => m.role === "team");
  const owners = members.filter((m) => m.role === "admin");

  return (
    <div>
      <AdminPageHeader
        title="Team & Rechte"
        description="Teamzugänge anlegen und Sicht- sowie Schreibrechte pro Modul vergeben"
      />

      {message && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          type="button"
          onClick={() => {
            setShowCreate((v) => !v);
            setEditingId(null);
            setError("");
          }}
        >
          <Plus className="w-4 h-4" />
          Neuer Team-Zugang
        </Button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-cream border border-wood/10 rounded-xl p-5 sm:p-6 mb-8 space-y-5"
        >
          <h2 className="font-display text-xl text-wood-dark">Neuen Zugang erstellen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Input
              label="Name"
              value={createForm.displayName}
              onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
              required
            />
            <Input
              label="E-Mail"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
            />
            <Input
              label="Startpasswort"
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
            />
          </div>
          <PermissionMatrix
            value={createForm.permissions}
            onChange={(permissions) => setCreateForm({ ...createForm, permissions })}
          />
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Wird erstellt…" : "Zugang erstellen"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      )}

      {editingId && (
        <form
          onSubmit={handleUpdate}
          className="bg-linen border border-forest/20 rounded-xl p-5 sm:p-6 mb-8 space-y-5"
        >
          <h2 className="font-display text-xl text-wood-dark">Zugang bearbeiten</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Input
              label="Name"
              value={editForm.displayName}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              required
            />
            <Input
              label="Neues Passwort (optional)"
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-wood-dark">
            <input
              type="checkbox"
              checked={editForm.active}
              onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
              className="h-4 w-4 accent-forest"
            />
            Zugang aktiv
          </label>
          <PermissionMatrix
            value={editForm.permissions}
            onChange={(permissions: TeamPermissions) =>
              setEditForm({ ...editForm, permissions })
            }
          />
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Speichern…" : "Änderungen speichern"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
              Abbrechen
            </Button>
          </div>
        </form>
      )}

      <section className="mb-8">
        <h2 className="font-display text-lg text-wood-dark mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-forest" />
          Haupt-Admin
        </h2>
        <div className="bg-cream border border-wood/10 rounded-xl divide-y divide-wood/10">
          {owners.map((owner) => (
            <div key={owner.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-wood-dark">{owner.displayName}</p>
                <p className="text-sm text-stone">{owner.email}</p>
              </div>
              <span className="text-xs uppercase tracking-wide text-forest bg-forest/10 px-2 py-1 rounded-full">
                Vollzugriff
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-wood-dark mb-3 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-forest" />
          Team-Zugänge
        </h2>
        {loading ? (
          <p className="text-stone text-sm py-8 text-center">Team wird geladen…</p>
        ) : teamMembers.length === 0 ? (
          <p className="text-stone text-sm py-8 text-center bg-cream border border-wood/10 rounded-xl">
            Noch keine Team-Zugänge angelegt.
          </p>
        ) : (
          <div className="bg-cream border border-wood/10 rounded-xl divide-y divide-wood/10">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-wood-dark">{member.displayName}</p>
                  <p className="text-sm text-stone break-all">{member.email}</p>
                  <p className="text-xs text-stone mt-1">
                    {member.active ? "Aktiv" : "Deaktiviert"} ·{" "}
                    {
                      Object.values(normalizePermissions(member.permissions)).filter(
                        (p) => p.read
                      ).length
                    }{" "}
                    Module mit Lesezugriff
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button type="button" variant="secondary" onClick={() => startEdit(member)}>
                    Rechte
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDelete(member)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    aria-label="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

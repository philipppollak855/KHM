"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (form.password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(form.email, form.password, form.name);
      router.push("/konto");
    } catch {
      setError("Registrierung fehlgeschlagen. Möglicherweise existiert die E-Mail bereits.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <PageHeader label="Kundenbereich" title="Registrieren" description="Werden Sie Teil der KHM-Familie" />

      <form onSubmit={handleSubmit} className="bg-linen border border-wood/10 p-8 space-y-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="E-Mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input label="Passwort" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <Input label="Passwort bestätigen" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registrieren..." : "Konto erstellen"}
        </Button>
      </form>

      <p className="text-center mt-6 text-sm text-stone">
        Bereits registriert?{" "}
        <Link href="/login" className="text-forest hover:underline">Anmelden</Link>
      </p>
    </div>
  );
}

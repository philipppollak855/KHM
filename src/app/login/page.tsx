"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/konto";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push(redirect);
    } catch {
      setError("Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Daten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <PageHeader label="Kundenbereich" title="Anmelden" description="Willkommen zurück bei KHM" />

      <form onSubmit={handleSubmit} className="bg-linen border border-wood/10 p-8 space-y-4">
        <Input label="E-Mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Passwort" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Anmelden..." : "Anmelden"}
        </Button>
      </form>

      <p className="text-center mt-6 text-sm text-stone">
        Noch kein Konto?{" "}
        <Link href="/register" className="text-forest hover:underline">Jetzt registrieren</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

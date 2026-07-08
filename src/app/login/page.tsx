"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-wood-dark mb-2">
          Anmelden
        </h1>
        <p className="text-wood/60">Willkommen zurück bei KHM</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-cream rounded-2xl p-8 border border-wood/10 shadow-md space-y-4"
      >
        <Input
          label="E-Mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Passwort"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Anmelden..." : "Anmelden"}
        </Button>
      </form>

      <p className="text-center mt-6 text-sm text-wood/60">
        Noch kein Konto?{" "}
        <Link href="/register" className="text-forest font-medium hover:underline">
          Jetzt registrieren
        </Link>
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

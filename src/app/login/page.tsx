"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getLoginRedirect } from "@/lib/auth-redirect";
import { isStandalonePwa } from "@/lib/pwa-history";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";
import CompanyLogo from "@/components/branding/CompanyLogo";
import { useCompanyBranding } from "@/context/CompanyBrandingContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect");
  const { login, user, loading: authLoading } = useAuth();
  const { company } = useCompanyBranding();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(
        getLoginRedirect(user, explicitRedirect, { pwa: isStandalonePwa() })
      );
    }
  }, [authLoading, user, explicitRedirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const loggedInUser = await login(email, password);
      router.push(
        getLoginRedirect(loggedInUser, explicitRedirect, { pwa: isStandalonePwa() })
      );
    } catch {
      setError("Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Daten.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-stone">
        Weiterleitung…
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="flex justify-center mb-8">
        <CompanyLogo variant="full" size="lg" />
      </div>
      <PageHeader
        label="Kundenbereich"
        title="Anmelden"
        description={`Willkommen zurück bei ${company.name}`}
      />

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

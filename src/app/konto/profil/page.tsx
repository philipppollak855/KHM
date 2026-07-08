"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ProfilPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    street: "",
    zip: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName || "",
        phone: user.phone || "",
        street: user.address?.street || "",
        zip: user.address?.zip || "",
        city: user.address?.city || "",
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    try {
      await updateDoc(doc(db, "users", user.id), {
        displayName: form.displayName,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          zip: form.zip,
          country: "Österreich",
        },
      });
      setMessage("Profil erfolgreich gespeichert.");
    } catch {
      setMessage("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/konto"
        className="inline-flex items-center gap-1 text-forest text-sm mb-6 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Zurück zum Konto
      </Link>

      <h1 className="font-display text-4xl font-bold text-wood-dark mb-8">
        Mein Profil
      </h1>

      <form
        onSubmit={handleSave}
        className="bg-cream rounded-2xl p-8 border border-wood/10 shadow-sm space-y-4"
      >
        <Input label="E-Mail" value={user.email} disabled />
        <Input
          label="Name"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
        />
        <Input
          label="Telefon"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <hr className="border-wood/10" />
        <p className="text-sm font-medium text-wood-dark">Adresse</p>
        <Input
          label="Straße"
          value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="PLZ"
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
          />
          <Input
            label="Ort"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>
        {message && (
          <p className={`text-sm ${message.includes("Fehler") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Speichern..." : "Speichern"}
        </Button>
      </form>
    </div>
  );
}

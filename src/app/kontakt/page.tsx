"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { createContactInquiry } from "@/lib/firestore";
import { useCompanyBranding } from "@/context/CompanyBrandingContext";
import { useSiteContent } from "@/context/SiteContentContext";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";

export default function ContactPage() {
  const { company } = useCompanyBranding();
  const { content } = useSiteContent();
  const { contact } = content;
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addressText = `${company.name}\n${company.street}\n${company.zip} ${company.city}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createContactInquiry(form);
      setSent(true);
    } catch {
      setError(contact.form.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        label={contact.header.label}
        title={contact.header.title}
        description={contact.header.description}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          {[
            { icon: MapPin, title: "Adresse", text: addressText },
            { icon: Mail, title: "E-Mail", text: company.email },
            { icon: Phone, title: "Telefon", text: company.phone },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 border border-forest/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-forest" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-lg text-wood-dark mb-1">{title}</h3>
                <p className="text-stone text-sm whitespace-pre-line">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 p-8 text-center">
            <p className="text-green-800 font-medium text-lg mb-2">
              {contact.form.successTitle}
            </p>
            <p className="text-green-700 text-sm">{contact.form.successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-linen border border-wood/10 p-8 space-y-4">
            <Input
              label={contact.form.nameLabel}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label={contact.form.emailLabel}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label={contact.form.subjectLabel}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
            <Textarea
              label={contact.form.messageLabel}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              <Send className="w-4 h-4" />
              {loading ? contact.form.loadingLabel : contact.form.submitLabel}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

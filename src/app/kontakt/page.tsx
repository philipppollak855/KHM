"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader label="Kontakt" title="Schreiben Sie uns" description="Wir freuen uns auf Ihre Nachricht aus dem Schneebergland." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          {[
            { icon: MapPin, title: "Adresse", text: "Kevin's Handmade Manufactur\nWerkstattgasse 1\n2734 Puchberg am Schneeberg" },
            { icon: Mail, title: "E-Mail", text: "info@khm-handmade.at" },
            { icon: Phone, title: "Telefon", text: "+43 000 000 000" },
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
            <p className="text-green-800 font-medium text-lg mb-2">Nachricht gesendet!</p>
            <p className="text-green-700 text-sm">Vielen Dank. Wir melden uns bald bei Ihnen.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-linen border border-wood/10 p-8 space-y-4">
            <Input label="Name" required />
            <Input label="E-Mail" type="email" required />
            <Input label="Betreff" required />
            <Textarea label="Nachricht" required />
            <Button type="submit" className="w-full">
              <Send className="w-4 h-4" />
              Nachricht senden
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

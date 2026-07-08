"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <h1 className="font-display text-4xl font-bold text-wood-dark mb-4">
          Kontakt
        </h1>
        <p className="text-wood/60">
          Wir freuen uns auf Ihre Nachricht
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-forest" />
            </div>
            <div>
              <h3 className="font-semibold text-wood-dark">Adresse</h3>
              <p className="text-wood/60 text-sm">
                Kevin&apos;s Handmade Manufactur<br />
                Schneebergland<br />
                Niederösterreich, Österreich
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-forest" />
            </div>
            <div>
              <h3 className="font-semibold text-wood-dark">E-Mail</h3>
              <p className="text-wood/60 text-sm">info@khm-handmade.at</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-forest" />
            </div>
            <div>
              <h3 className="font-semibold text-wood-dark">Telefon</h3>
              <p className="text-wood/60 text-sm">+43 000 000 000</p>
            </div>
          </div>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <p className="text-green-800 font-medium text-lg mb-2">
              Nachricht gesendet!
            </p>
            <p className="text-green-700 text-sm">
              Vielen Dank für Ihre Nachricht. Wir melden uns bald bei Ihnen.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-cream rounded-2xl p-8 border border-wood/10 shadow-sm space-y-4"
          >
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

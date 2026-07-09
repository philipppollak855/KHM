"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { adjustProductStock } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

interface StockInboundButtonProps {
  productId: string;
  productName: string;
  defaultQuantity?: number;
  label?: string;
  size?: "sm" | "md";
  onSuccess?: () => void;
}

export default function StockInboundButton({
  productId,
  productName,
  defaultQuantity = 10,
  label = "Nachbestellen",
  size = "sm",
  onSuccess,
}: StockInboundButtonProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(defaultQuantity.toString());
  const [loading, setLoading] = useState(false);

  const handleInbound = async () => {
    if (!user) return;
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      alert("Bitte eine gültige Menge eingeben.");
      return;
    }
    setLoading(true);
    try {
      await adjustProductStock(
        productId,
        qty,
        "reorder",
        user.id,
        `Nachbestellung: ${productName}`
      );
      onSuccess?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Einbuchung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-16 rounded border border-wood/20 bg-linen px-2 py-1.5 text-sm"
        aria-label={`Menge für ${productName}`}
      />
      <Button
        size={size}
        onClick={handleInbound}
        disabled={loading}
        className="whitespace-nowrap"
      >
        <PackagePlus className="w-4 h-4" />
        {loading ? "..." : label}
      </Button>
    </div>
  );
}

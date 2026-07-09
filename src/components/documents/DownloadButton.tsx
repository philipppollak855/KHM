"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Button from "@/components/ui/Button";

interface DownloadButtonProps {
  label: string;
  onClick: () => void | Promise<void>;
  size?: "sm" | "md";
}

export default function DownloadButton({ label, onClick, size = "sm" }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");
    try {
      await onClick();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        size={size}
        variant="outline"
        onClick={handleClick}
        type="button"
        disabled={loading}
      >
        <Download className="w-4 h-4" />
        {loading ? "Lädt…" : label}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

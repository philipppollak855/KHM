import { Download } from "lucide-react";
import Button from "@/components/ui/Button";

interface DownloadButtonProps {
  label: string;
  onClick: () => void;
  size?: "sm" | "md";
}

export default function DownloadButton({ label, onClick, size = "sm" }: DownloadButtonProps) {
  return (
    <Button size={size} variant="outline" onClick={onClick} type="button">
      <Download className="w-4 h-4" />
      {label}
    </Button>
  );
}

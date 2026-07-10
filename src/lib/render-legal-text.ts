import type { CompanySettings } from "@/lib/types";
import { applyLegalPlaceholders } from "@/lib/legal-content";

export type LegalBlock =
  | { type: "h2"; key: number; text: string }
  | { type: "h3"; key: number; text: string }
  | { type: "p"; key: number; text: string };

export function parseLegalBody(body: string, company: CompanySettings): LegalBlock[] {
  const text = applyLegalPlaceholders(body, company);
  const blocks = text.split("\n\n").filter((block) => block.trim());

  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return { type: "h2", key: index, text: trimmed.slice(3) };
    }
    if (trimmed.startsWith("### ")) {
      return { type: "h3", key: index, text: trimmed.slice(4) };
    }
    return { type: "p", key: index, text: trimmed };
  });
}

export function splitInlineBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g);
}

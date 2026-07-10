"use client";

import { Fragment } from "react";
import type { LegalDocumentContent } from "@/lib/legal-content";
import { useCompanyBranding } from "@/context/CompanyBrandingContext";
import { parseLegalBody, splitInlineBold } from "@/lib/render-legal-text";

function InlineText({ text }: { text: string }) {
  const parts = splitInlineBold(text);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

interface Props {
  document: LegalDocumentContent;
}

export default function LegalDocumentView({ document }: Props) {
  const { company } = useCompanyBranding();
  const blocks = parseLegalBody(document.body, company);

  return (
    <article className="prose-legal max-w-3xl">
      <p className="text-xs text-stone mb-8">
        Stand:{" "}
        {new Date(document.lastUpdated).toLocaleDateString("de-AT", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="space-y-5 text-stone leading-relaxed">
        {blocks.map((block) => {
          if (block.type === "h2") {
            return (
              <h2
                key={block.key}
                className="font-display text-2xl font-light text-wood-dark pt-4 first:pt-0"
              >
                <InlineText text={block.text} />
              </h2>
            );
          }
          if (block.type === "h3") {
            return (
              <h3 key={block.key} className="font-display text-xl font-light text-wood-dark pt-2">
                <InlineText text={block.text} />
              </h3>
            );
          }
          return (
            <p key={block.key} className="whitespace-pre-line text-[15px]">
              <InlineText text={block.text} />
            </p>
          );
        })}
      </div>
    </article>
  );
}

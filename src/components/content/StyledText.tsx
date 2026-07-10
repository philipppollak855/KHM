import { Fragment } from "react";

interface StyledTextProps {
  text: string;
  className?: string;
  italicClassName?: string;
}

/** Rendert Text mit *kursiv*-Markierung und Zeilenumbrüchen (\n). */
export default function StyledText({
  text,
  className,
  italicClassName = "italic",
}: StyledTextProps) {
  const lines = text.split("\n");

  return (
    <span className={className}>
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {line.split(/(\*[^*]+\*)/g).map((part, partIndex) => {
            if (part.startsWith("*") && part.endsWith("*")) {
              return (
                <span key={partIndex} className={italicClassName}>
                  {part.slice(1, -1)}
                </span>
              );
            }
            return <Fragment key={partIndex}>{part}</Fragment>;
          })}
        </Fragment>
      ))}
    </span>
  );
}

import { type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export default function Textarea({
  label,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-wood-dark">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-lg border-2 border-wood/20 bg-cream px-4 py-2.5 text-wood-dark placeholder:text-wood/40 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-colors resize-y min-h-[100px] ${className}`}
        {...props}
      />
    </div>
  );
}

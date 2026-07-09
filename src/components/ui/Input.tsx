import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-wood-dark">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border-2 border-wood/20 bg-linen px-4 py-2.5 text-wood-dark placeholder:text-wood/40 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

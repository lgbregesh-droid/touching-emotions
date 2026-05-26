import { useId } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { ValidationKey } from "@/utils/validation";

type BaseProps = {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
  error?: ValidationKey | null;
  className?: string;
  rounded?: "xl" | "lg" | "md";
};

const ROUNDED = { xl: "rounded-xl", lg: "rounded-lg", md: "rounded-md" };

function ErrorMsg({ id, error }: { id: string; error: ValidationKey | null | undefined }) {
  const { t } = useLanguage();
  if (!error) return null;
  const txt: string = t.validation[error] || "";
  return (
    <div
      id={id}
      role="alert"
      className="mt-1 text-[12px] animate-in fade-in duration-200"
      style={{ color: "#C4622D" }}
    >
      {txt}
    </div>
  );
}

function fieldClass(error: ValidationKey | null | undefined, rounded: "xl" | "lg" | "md" = "xl", extra = "") {
  const r = ROUNDED[rounded];
  const border = error ? "border-[#C4622D]" : "border-[#E0D8CC] focus:border-[#BA9B78]";
  return `w-full px-4 py-3 ${r} border ${border} bg-white text-[#4A3D30] outline-none transition ${extra}`;
}

export function ValidatedInput({
  label, required, value, onChange, onBlur, error, type = "text", rounded = "xl", placeholder,
}: BaseProps & { type?: string; placeholder?: string }) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <label className="block" htmlFor={id}>
      <span className="block text-sm text-[#4A3D30] mb-1.5">{label}{required && <span className="text-[#BA9B78]"> *</span>}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errId : undefined}
        className={fieldClass(error, rounded)}
      />
      <ErrorMsg id={errId} error={error} />
    </label>
  );
}

export function ValidatedTextarea({
  label, required, value, onChange, onBlur, error, rows = 5, maxLength = 1000, showCounter = true, rounded = "xl",
}: BaseProps & { rows?: number; maxLength?: number; showCounter?: boolean }) {
  const id = useId();
  const errId = `${id}-err`;
  const len = value.length;
  const warn = len > maxLength * 0.9;
  return (
    <label className="block" htmlFor={id}>
      <span className="block text-sm text-[#4A3D30] mb-1.5">{label}{required && <span className="text-[#BA9B78]"> *</span>}</span>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errId : undefined}
        className={fieldClass(error, rounded)}
      />
      {showCounter && (
        <div className="mt-1 text-[11px] text-end" style={{ color: warn ? "#C4622D" : "#A0907A" }}>
          {len}/{maxLength}
        </div>
      )}
      <ErrorMsg id={errId} error={error} />
    </label>
  );
}

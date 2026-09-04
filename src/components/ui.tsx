import type { ReactNode } from "react";
import "./ui.css";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Button({
  children,
  onClick,
  variant = "default",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "password" | "number";
  mono?: boolean;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className={`field-input ${mono ? "mono" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle ${checked ? "toggle-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" />
      </button>
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select className="field-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Tag({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: "neutral" | "success" | "info" | "accent" | "danger";
}) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="empty-state">
      {icon}
      <p className="empty-title">{title}</p>
      {hint && <p className="empty-hint">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-state">
      <p>{message}</p>
      {onRetry && (
        <Button variant="ghost" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ height = 16, width = "100%" }: { height?: number; width?: string | number }) {
  return <div className="skeleton" style={{ height, width }} />;
}

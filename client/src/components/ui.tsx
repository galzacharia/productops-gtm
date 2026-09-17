import clsx from "clsx";
import type { ReactNode, SelectHTMLAttributes } from "react";

export function Badge({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A compact inline <select> used in table cells and the drawer. */
export function InlineSelect({
  value,
  onChange,
  options,
  placeholder = "—",
  className,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        "w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm",
        "focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand",
        className,
      )}
      {...rest}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

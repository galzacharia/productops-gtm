import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

/**
 * A controlled text field / textarea that keeps local state while editing and
 * commits (persists) on blur or Enter. Keeps inline editing snappy without a
 * save-on-every-keystroke round-trip.
 */
export function EditableText({
  value,
  onCommit,
  placeholder,
  multiline,
  className,
}: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const dirty = useRef(false);

  // Sync when the upstream value changes and we're not mid-edit.
  useEffect(() => {
    if (!dirty.current) setDraft(value);
  }, [value]);

  const commit = () => {
    dirty.current = false;
    if (draft !== value) onCommit(draft);
  };

  const base = clsx(
    "w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm",
    "placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand",
    className,
  );

  if (multiline) {
    return (
      <textarea
        value={draft}
        placeholder={placeholder}
        rows={3}
        onChange={(e) => {
          dirty.current = true;
          setDraft(e.target.value);
        }}
        onBlur={commit}
        className={clsx(base, "resize-y")}
      />
    );
  }

  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => {
        dirty.current = true;
        setDraft(e.target.value);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") {
          dirty.current = false;
          setDraft(value);
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={base}
    />
  );
}

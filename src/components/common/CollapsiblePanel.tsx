import { useState, type ReactNode } from "react";

const STORAGE_PREFIX = "tt-panel-";

function readOpen(storageKey: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    /* private mode / disabled storage — fall through */
  }
  return fallback;
}
// TODO: how to write to localStorage in a way that doesn't throw in private mode?
function writeOpen(storageKey: string, open: boolean): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + storageKey, open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function CollapsiblePanel({
  title,
  storageKey,
  defaultOpen = true,
  accent,
  headerRight,
  children,
}: {
  title: string;
  storageKey: string;
  defaultOpen?: boolean;
  accent?: "amber";
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(() => readOpen(storageKey, defaultOpen));

  const toggle = () => {
    setOpen((v) => {
      writeOpen(storageKey, !v);
      return !v;
    });
  };

  const titleColor = accent === "amber" ? "text-amber-400" : "text-white";
  const shell =
    accent === "amber"
      ? "bg-slate-800 rounded-lg border border-amber-700/40"
      : "bg-slate-800 rounded-lg";

  return (
    <div className={shell}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          onClick={toggle}
          className="flex items-center gap-2 text-left"
          aria-expanded={open}
        >
          <span className={`text-xs text-slate-500 transition-transform ${open ? "rotate-90" : ""}`}>
            ▶
          </span>
          <span className={`text-lg font-semibold ${titleColor}`}>{title}</span>
        </button>
        <div className="flex items-center gap-2 shrink-0">{headerRight}</div>
      </div>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

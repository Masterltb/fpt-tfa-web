import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A panel anchored to the element that opened it. Not a modal: the task needs
 * neither interruption nor protected focus, so the page stays visible and live.
 * Closes on Escape, on outside click, and returns focus to its trigger.
 */
export function Popover({
  open,
  onClose,
  children,
  className,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };

    document.addEventListener("keydown", onKey);
    // `click` (not mousedown) so the trigger's own toggle resolves first.
    document.addEventListener("click", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDown);
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-labelledby={labelledBy}
      className={cn(
        "absolute right-0 top-[calc(100%+6px)] z-40 w-[min(21rem,calc(100vw-2.5rem))]",
        "rounded-card border border-line bg-surface p-4",
        "shadow-[0_4px_10px_rgba(15,23,42,0.06),0_20px_44px_-16px_rgba(15,23,42,0.28)]",
        "settle",
        className,
      )}
    >
      {children}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloseIcon } from "./icons";
import type { ActivityEvent } from "@/lib/activity-events";

interface ActivityToastProps {
  event: ActivityEvent;
  onDismiss: () => void;
  duration?: number;
}

const PRIORITY_BORDER: Record<ActivityEvent["priority"], string> = {
  high: "border-l-amber-500",
  medium: "border-l-charcoal",
  low: "border-l-black/20",
};

const PRIORITY_DOT: Record<ActivityEvent["priority"], string> = {
  high: "bg-amber-500",
  medium: "bg-charcoal",
  low: "bg-black/30",
};

export function ActivityToast({ event, onDismiss, duration = 5000 }: ActivityToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Defer one frame so the enter transition fires
    const enter = requestAnimationFrame(() => setVisible(true));

    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 350);
    }, duration);

    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(hide);
    };
  }, [duration, onDismiss]);

  function dismiss(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setVisible(false);
    setTimeout(onDismiss, 350);
  }

  return (
    <div
      aria-live="polite"
      className={[
        // Layout — bottom-center on mobile, bottom-right on desktop
        "fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-[60]",
        // Enter / exit transition
        "transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <Link
        href={event.href}
        onClick={() => dismiss()}
        className={[
          "flex items-start gap-3 bg-white border border-black/10 border-l-4 shadow-lg p-4",
          "hover:shadow-xl transition-shadow",
          PRIORITY_BORDER[event.priority],
        ].join(" ")}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[12px] font-semibold text-charcoal">
            {event.avatarChar.toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[event.priority]}`} />
            <p className="text-[12px] font-medium text-charcoal truncate">{event.title}</p>
          </div>
          <p className="text-[11px] text-warm-gray leading-relaxed">{event.message}</p>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Dismiss notification"
          className="flex-shrink-0 p-0.5 hover:opacity-50 transition-opacity mt-0.5"
        >
          <CloseIcon className="h-3.5 w-3.5 text-warm-gray" />
        </button>
      </Link>

      {/* Progress bar */}
      <div className="h-0.5 bg-black/5 overflow-hidden">
        <div
          className="h-full bg-black/15 origin-left"
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

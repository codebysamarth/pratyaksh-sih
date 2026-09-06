import React from "react";
import clsx from "clsx";

interface CyberBadgeProps {
  children: React.ReactNode;
  variant?: "cyan" | "crimson" | "amber" | "emerald" | "violet" | "slate";
  pulse?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const CyberBadge: React.FC<CyberBadgeProps> = ({
  children,
  variant = "cyan",
  pulse = false,
  size = "sm",
  className,
}) => {
  const variantStyles = {
    cyan: "bg-blue-50 text-blue-700 border-blue-200/80",
    crimson: "bg-rose-50 text-rose-700 border-rose-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    violet: "bg-slate-100 text-slate-800 border-slate-200",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
  };

  const dotStyles = {
    cyan: "bg-blue-600",
    crimson: "bg-rose-600",
    amber: "bg-amber-600",
    emerald: "bg-emerald-600",
    violet: "bg-slate-700",
    slate: "bg-slate-500",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded-md border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        variantStyles[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={clsx(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              dotStyles[variant]
            )}
          />
          <span
            className={clsx(
              "relative inline-flex rounded-full h-1.5 w-1.5",
              dotStyles[variant]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
};

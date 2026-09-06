import React from "react";
import clsx from "clsx";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "red" | "none";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = "none",
  ...props
}) => {
  return (
    <div
      className={clsx(
        "rounded-lg bg-white border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200",
        glow === "red" && "border-rose-300 ring-1 ring-rose-200 shadow-[0_2px_8px_rgba(225,29,72,0.06)]",
        glow === "cyan" && "border-blue-300 ring-1 ring-blue-200 shadow-[0_2px_8px_rgba(37,99,235,0.06)]",
        glow === "none" && "hover:border-[#CBD5E1]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

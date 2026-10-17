import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm shadow-emerald-600/20 active:bg-emerald-800",
    secondary: "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 focus:ring-emerald-400 active:bg-emerald-200",
    outline: "border border-slate-200 hover:bg-slate-50 text-slate-700 focus:ring-slate-400 active:bg-slate-100",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm shadow-rose-600/20 active:bg-rose-800",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          <span>{children}</span>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        </>
      )}
    </button>
  );
};

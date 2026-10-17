import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, "-")}` : undefined);

    return (
      <div className="space-y-1 text-right w-full" dir="rtl">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700">
            {label}
            {props.required && <span className="text-rose-500 mr-1">*</span>}
          </label>
        )}

        <div className="relative rounded-xl">
          {icon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            className={`w-full py-2.5 px-3.5 rounded-xl border bg-white text-slate-900 text-sm transition focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
              icon ? "pr-10" : ""
            } ${
              error
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900"
                : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
            } ${className}`}
            {...props}
          />
        </div>

        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

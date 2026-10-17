import React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, children, className = "", id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.replace(/\s+/g, "-")}` : undefined);

    return (
      <div className="space-y-1 text-right w-full" dir="rtl">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-slate-700">
            {label}
            {props.required && <span className="text-rose-500 mr-1">*</span>}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={`w-full py-2.5 px-3 rounded-xl border bg-white text-slate-800 text-sm transition focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
              : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
          } ${className}`}
          {...props}
        >
          {options
            ? options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

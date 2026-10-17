import React from "react";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div
    className={`bg-white rounded-2xl border border-slate-100 shadow-sm transition ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`p-4 border-b border-slate-50 ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`p-4 border-t border-slate-50 bg-slate-50/50 rounded-b-2xl ${className}`} {...props}>
    {children}
  </div>
);

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-4 max-w-sm mx-auto shadow-sm">
    <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
      <Icon className="w-8 h-8 text-emerald-600" />
    </div>

    <div className="space-y-1">
      <h3 className="text-base font-extrabold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>

    {actionLabel && onAction && (
      <Button variant="primary" size="sm" onClick={onAction} className="mx-auto">
        {actionLabel}
      </Button>
    )}
  </div>
);

import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

export const ProfileCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex gap-4 animate-pulse">
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-200 flex-shrink-0" />
    <div className="flex-1 space-y-3">
      <div className="h-4 bg-slate-200 rounded-md w-1/3" />
      <div className="h-3 bg-slate-200 rounded-md w-1/2" />
      <div className="h-12 bg-slate-100 rounded-xl w-full" />
      <div className="flex gap-2">
        <div className="h-4 bg-slate-200 rounded-md w-16" />
        <div className="h-4 bg-slate-200 rounded-md w-20" />
      </div>
    </div>
  </div>
);

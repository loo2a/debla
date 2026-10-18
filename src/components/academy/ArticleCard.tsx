import React from "react";
import type { AcademyArticle, ArticleCategory } from "../../types";
import { Clock, Star, CheckCircle, BookOpen } from "lucide-react";

const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  communication: "التواصل",
  conflict: "إدارة الخلافات",
  finance: "المسؤوليات المالية",
  expectations: "توقعات الحياة",
  rights: "الحقوق والواجبات",
  health: "الصحة النفسية",
};

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  communication: "bg-blue-50 text-blue-700 border-blue-200",
  conflict: "bg-rose-50 text-rose-700 border-rose-200",
  finance: "bg-amber-50 text-amber-700 border-amber-200",
  expectations: "bg-purple-50 text-purple-700 border-purple-200",
  rights: "bg-emerald-50 text-emerald-700 border-emerald-200",
  health: "bg-teal-50 text-teal-700 border-teal-200",
};

interface ArticleCardProps {
  article: AcademyArticle;
  onClick: (article: AcademyArticle) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const catColor = CATEGORY_COLORS[article.category] ?? "bg-slate-50 text-slate-600 border-slate-200";
  const catLabel = CATEGORY_LABELS[article.category] ?? article.category;

  return (
    <button
      onClick={() => onClick(article)}
      className={`w-full text-right bg-white rounded-2xl border transition duration-200 hover:shadow-md active:scale-[0.98] overflow-hidden ${
        article.isRead
          ? "border-emerald-200 opacity-90"
          : "border-slate-100 hover:border-emerald-200"
      }`}
      dir="rtl"
    >
      <div className="p-4 space-y-3">
        {/* Category badge + read check */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${catColor}`}>
            {catLabel}
          </span>
          {article.isRead && (
            <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              تمت القراءة
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-sm leading-snug">{article.title}</h3>

        {/* Summary */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{article.summary}</p>

        {/* Footer meta */}
        <div className="flex items-center gap-3 pt-1">
          <span className="flex items-center gap-1 text-slate-400 text-[10px]">
            <Clock className="w-3 h-3" />
            {article.readingTimeMin} دقائق
          </span>
          <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
            <Star className="w-3 h-3 fill-amber-400" />
            +{article.pointsReward} نقطة
          </span>
          {article.userRating && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < article.userRating! ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                />
              ))}
            </span>
          )}
        </div>
      </div>

      {/* Read progress bar */}
      {article.isRead && (
        <div className="h-0.5 bg-emerald-400 w-full" />
      )}
    </button>
  );
};

export { CATEGORY_LABELS, CATEGORY_COLORS, BookOpen };

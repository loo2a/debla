import React, { useState, useEffect, useCallback } from "react";
import type { AcademyArticle, ArticleCategory } from "../types";
import { ArticleCard, CATEGORY_LABELS, CATEGORY_COLORS } from "../components/academy/ArticleCard";
import { ArticleReader } from "../components/academy/ArticleReader";
import { useApp } from "../lib/store";
import { GraduationCap, Star, BookOpen, ChevronLeft, Award, Sparkles } from "lucide-react";
import { MarriageReadinessQuizModal } from "../components/academy/MarriageReadinessQuizModal";

const ALL_CATEGORIES: ArticleCategory[] = [
  "communication",
  "conflict",
  "finance",
  "expectations",
  "rights",
  "health",
];

export const AcademyPage: React.FC = () => {
  const {
    academyArticles,
    fetchAcademyArticles,
    markArticleRead,
    rateArticle,
    currentUser,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | "all">("all");
  const [openArticle, setOpenArticle] = useState<AcademyArticle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    void fetchAcademyArticles().finally(() => setIsLoading(false));
  }, [fetchAcademyArticles]);

  // Filter articles
  const filtered = selectedCategory === "all"
    ? academyArticles
    : academyArticles.filter(a => a.category === selectedCategory);

  const readCount = academyArticles.filter(a => a.isRead).length;
  const totalPoints = currentUser?.academyPoints ?? 0;
  const progressPct = academyArticles.length > 0
    ? Math.round((readCount / academyArticles.length) * 100)
    : 0;

  const handleRead = useCallback(async (articleId: string) => {
    return markArticleRead(articleId);
  }, [markArticleRead]);

  const handleRate = useCallback(async (articleId: string, rating: number) => {
    await rateArticle(articleId, rating);
  }, [rateArticle]);

  // Article reader view
  if (openArticle) {
    return (
      <ArticleReader
        article={openArticle}
        onBack={() => setOpenArticle(null)}
        onRead={async (id) => {
          const result = await handleRead(id);
          // Update local article state to reflect read status
          setOpenArticle(prev => prev ? { ...prev, isRead: true } : null);
          return result;
        }}
        onRate={handleRate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24" dir="rtl">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-700 text-white px-5 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h1 className="font-extrabold text-base">أكاديمية الاستعداد للزواج</h1>
            <p className="text-emerald-200 text-xs">مقالات موثّقة لحياة زوجية أسعد</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-100">
              {readCount} من {academyArticles.length} مقال تمت قراءته
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              {totalPoints} نقطة
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <p className="text-emerald-200 text-[10px]">
              {progressPct === 100
                ? "🎉 أتممت قراءة جميع المقالات! أنت مستعد"
                : progressPct >= 50
                ? "ممتاز! أكملت أكثر من النصف"
                : "ابدأ رحلتك نحو حياة زوجية ناجحة"}
            </p>
            {currentUser?.isMarriageCertified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                <Award className="w-3 h-3 fill-slate-950" />
                حاصل على الشارة
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Certificate / Quiz Action Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-3xl p-4 text-slate-950 shadow-md flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="space-y-1 text-right">
            <div className="flex items-center gap-1.5 font-black text-xs">
              <Award className="w-4 h-4 fill-slate-950" />
              <span>{currentUser?.isMarriageCertified ? "شهادة اجتياز دورة المقبلين على الزواج 🎓" : "شهادة اجتياز دورة المقبلين على الزواج"}</span>
            </div>
            <p className="text-[11px] text-slate-900 font-medium leading-snug">
              {currentUser?.isMarriageCertified
                ? `مبارك! أنت حاصل على شارة «مؤهل للزواج وواعٍ بالمسؤولية» بنتيجة ${currentUser.marriageExamScore || 100}%.`
                : "اجتز اختباراً تفاعلياً قصيراً (5 أسئلة) واحصل على شارة «مؤهل للزواج وواعٍ بالمسؤولية» على بروفايلك."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowQuizModal(true)}
            className="px-3.5 py-2.5 bg-slate-950 text-amber-300 hover:text-white rounded-2xl text-xs font-black shrink-0 transition shadow-sm cursor-pointer flex items-center gap-1"
          >
            <span>{currentUser?.isMarriageCertified ? "عرض الشارة" : "بدء الاختبار"}</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-xl border transition duration-150 ${
              selectedCategory === "all"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
            }`}
          >
            الكل ({academyArticles.length})
          </button>
          {ALL_CATEGORIES.map(cat => {
            const count = academyArticles.filter(a => a.category === cat).length;
            if (count === 0) return null;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-xl border transition duration-150 ${
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                }`}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Article list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 font-medium">لا توجد مقالات في هذا القسم</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={setOpenArticle}
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-emerald-700 leading-relaxed">
            المحتوى مراجَع بعناية ومستند إلى مصادر علمية وشرعية موثّقة.
            <br />
            نقاطك تُضاف تلقائياً عند إتمام القراءة.
          </p>
        </div>
      </div>

      {/* Quiz Modal */}
      <MarriageReadinessQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
      />
    </div>
  );
};

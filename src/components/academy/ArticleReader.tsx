import React, { useState, useEffect, useRef } from "react";
import type { AcademyArticle } from "../../types";
import { ArrowRight, Star, CheckCircle, BookOpen, Loader2, ExternalLink } from "lucide-react";
import { useApp } from "../../lib/store";
import { useUIStore } from "../../stores/uiStore";

// Minimal markdown renderer (bold, headers, lists, tables, blockquotes)
function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, idx) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={idx}>{p.slice(2, -2)}</strong>;
      }
      // handle inline code
      if (p.startsWith("`") && p.endsWith("`")) {
        return <code key={idx} className="bg-slate-100 px-1 rounded text-[11px]">{p.slice(1, -1)}</code>;
      }
      return p;
    });
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      nodes.push(<h2 key={i} className="font-extrabold text-slate-800 text-base mt-5 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      nodes.push(<h3 key={i} className="font-bold text-slate-700 text-sm mt-4 mb-1.5">{line.slice(4)}</h3>);
    } else if (line.startsWith("|")) {
      // Table
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter(l => !l.match(/^\|[-| :]+\|$/));
      nodes.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-3 rounded-xl border border-slate-200">
          <table className="w-full text-xs text-right">
            {rows.map((row, ri) => {
              const cells = row.split("|").filter(Boolean).map(c => c.trim());
              const Tag = ri === 0 ? "th" : "td";
              return (
                <tr key={ri} className={ri % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                  {cells.map((cell, ci) => (
                    <Tag key={ci} className={`px-3 py-2 ${ri === 0 ? "font-bold text-slate-700 bg-emerald-50" : "text-slate-600"}`}>
                      {parseBold(cell)}
                    </Tag>
                  ))}
                </tr>
              );
            })}
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1 pr-4">
          {items.map((item, ii) => (
            <li key={ii} className="text-sm text-slate-700 leading-relaxed flex gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>{parseBold(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1 pr-4">
          {items.map((item, ii) => (
            <li key={ii} className="text-sm text-slate-700 leading-relaxed flex gap-2">
              <span className="text-emerald-600 font-bold min-w-4">{ii + 1}.</span>
              <span>{parseBold(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith("> ")) {
      nodes.push(
        <blockquote key={i} className="border-r-4 border-emerald-400 bg-emerald-50/50 pr-4 py-2 my-3 rounded-l-lg text-sm text-slate-700 italic leading-relaxed">
          {parseBold(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim() === "") {
      nodes.push(<div key={i} className="h-2" />);
    } else {
      nodes.push(
        <p key={i} className="text-sm text-slate-700 leading-relaxed">
          {parseBold(line)}
        </p>
      );
    }
    i++;
  }
  return <>{nodes}</>;
}

interface ArticleReaderProps {
  article: AcademyArticle;
  onBack: () => void;
  onRead: (articleId: string) => Promise<{ pointsAwarded: number; alreadyRead: boolean }>;
  onRate: (articleId: string, rating: number) => Promise<void>;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ article, onBack, onRead, onRate }) => {
  const { addToast } = useUIStore();
  const [isMarking, setIsMarking] = useState(false);
  const [isRead, setIsRead] = useState(article.isRead ?? false);
  const [selectedRating, setSelectedRating] = useState<number>(article.userRating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRating, setIsRating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleMarkRead = async () => {
    if (isMarking || isRead) return;
    setIsMarking(true);
    try {
      const { pointsAwarded, alreadyRead } = await onRead(article.id);
      setIsRead(true);
      if (!alreadyRead && pointsAwarded > 0) {
        addToast(`🌟 أحسنت! اكتسبت ${pointsAwarded} نقطة على قراءة هذا المقال`, "success");
      } else {
        addToast("✅ تم تسجيل القراءة", "success");
      }
    } catch {
      addToast("تعذّر تسجيل القراءة، حاول مجدداً", "error");
    } finally {
      setIsMarking(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!isRead) {
      addToast("اقرأ المقال أولاً لتتمكن من تقييمه", "info");
      return;
    }
    if (isRating) return;
    setIsRating(true);
    try {
      await onRate(article.id, rating);
      setSelectedRating(rating);
      addToast("شكراً على تقييمك! رأيك يُحسّن جودة المحتوى 💚", "success");
    } catch {
      addToast("تعذّر حفظ التقييم، حاول مجدداً", "error");
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition duration-150"
          aria-label="رجوع"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-slate-800 text-sm leading-tight truncate">{article.title}</h1>
        </div>
        {isRead && (
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
        )}
      </div>

      {/* Article body */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Meta */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
          <h2 className="font-extrabold text-slate-800 text-lg leading-snug">{article.title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{article.summary}</p>
          <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {article.readingTimeMin} دقائق للقراءة
            </span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              +{article.pointsReward} نقطة
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 leading-relaxed space-y-1">
          {renderMarkdown(article.content)}
        </div>

        {/* Sources */}
        {article.sources.length > 0 && (
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-2">
            <h4 className="font-bold text-emerald-800 text-xs flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              المصادر والمراجع
            </h4>
            <ul className="space-y-1">
              {article.sources.map((src, i) => (
                <li key={i} className="text-xs text-emerald-700 leading-relaxed">
                  [{i + 1}] {src}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rating */}
        {isRead && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">هل وجدت هذا المقال مفيداً؟ قيّمه</p>
            <div className="flex justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={isRating}
                  className="transition duration-100 hover:scale-110"
                  aria-label={`تقييم ${star} نجوم`}
                >
                  <Star
                    className={`w-7 h-7 transition duration-100 ${
                      star <= (hoverRating || selectedRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {selectedRating > 0 && (
              <p className="text-xs text-emerald-600 font-semibold">تقييمك: {selectedRating}/5</p>
            )}
          </div>
        )}

        {/* Mark as read button */}
        {!isRead ? (
          <button
            onClick={handleMarkRead}
            disabled={isMarking}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-4 rounded-2xl transition duration-200 disabled:opacity-60 shadow-sm"
          >
            {isMarking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isMarking ? "جارٍ التسجيل..." : `تمت القراءة — اكسب ${article.pointsReward} نقطة`}
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold text-sm py-4 rounded-2xl border border-emerald-200">
            <CheckCircle className="w-4 h-4" />
            تمت القراءة ✓
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};

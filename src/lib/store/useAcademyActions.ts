import { useCallback } from "react";
import { AcademyArticle, UserProfile } from "../../types";
import { ActionResult } from "./types";
import { supabase } from "../supabase";
import { INITIAL_ACADEMY_ARTICLES } from "../defaultAcademyArticles";

export const useAcademyActions = (
  currentUser: UserProfile | null,
  academyArticles: AcademyArticle[],
  setAcademyArticles: React.Dispatch<React.SetStateAction<AcademyArticle[]>>,
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>,
  saveProfile: (profile: Partial<UserProfile>) => Promise<ActionResult>
) => {
  const fetchAcademyArticles = useCallback(async (): Promise<void> => {
    try {
      const readMap = new Map<string, { rating?: number }>();

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: readsData } = await supabase
          .from("article_reads")
          .select("article_id, rating")
          .eq("user_id", session.user.id);

        (readsData || []).forEach((r: any) => {
          readMap.set(r.article_id, { rating: r.rating });
        });
      }

      const { data: articlesData, error: articlesErr } = await supabase
        .from("academy_articles")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!articlesErr && articlesData && articlesData.length > 0) {
        const formatted: AcademyArticle[] = articlesData.map((row: any) => {
          const readInfo = readMap.get(row.id) || readMap.get(row.slug);
          return {
            id: row.id,
            title: row.title,
            slug: row.slug,
            category: row.category,
            summary: row.summary,
            content: row.content,
            sources: row.sources || [],
            readingTimeMin: row.reading_time_min ?? 5,
            pointsReward: row.points_reward ?? 10,
            displayOrder: row.display_order ?? 0,
            isPublished: row.is_published ?? true,
            createdAt: row.created_at,
            isRead: !!readInfo,
            userRating: readInfo?.rating,
          };
        });
        setAcademyArticles(formatted);
      } else {
        let localReads: Record<string, { rating?: number }> = {};
        try {
          const raw = localStorage.getItem("debla_academy_reads");
          if (raw) localReads = JSON.parse(raw);
        } catch (_) {}

        setAcademyArticles(prev =>
          INITIAL_ACADEMY_ARTICLES.map(art => {
            const readInfo = readMap.get(art.id) || readMap.get(art.slug) || localReads[art.id] || localReads[art.slug];
            return {
              ...art,
              isRead: !!readInfo,
              userRating: readInfo?.rating,
            };
          })
        );
      }
    } catch (err) {
      console.warn("fetchAcademyArticles fallback active:", err);
      setAcademyArticles(INITIAL_ACADEMY_ARTICLES);
    }
  }, [setAcademyArticles]);

  const markArticleRead = useCallback(async (articleId: string): Promise<{ pointsAwarded: number; alreadyRead: boolean }> => {
    let pointsAwarded = 10;
    let alreadyRead = false;

    const target = academyArticles.find(a => a.id === articleId || a.slug === articleId);
    if (target) {
      pointsAwarded = target.pointsReward;
      if (target.isRead) {
        alreadyRead = true;
        return { pointsAwarded: 0, alreadyRead: true };
      }
    }

    try {
      const { data, error } = await supabase.rpc("read_article_rpc", {
        p_article_id: articleId,
      });

      if (!error && data && data.ok) {
        pointsAwarded = Number(data.points_awarded ?? pointsAwarded);
        alreadyRead = Boolean(data.already_read ?? false);
      } else {
        try {
          const raw = localStorage.getItem("debla_academy_reads") || "{}";
          const parsed = JSON.parse(raw);
          parsed[articleId] = { rating: target?.userRating };
          localStorage.setItem("debla_academy_reads", JSON.stringify(parsed));
        } catch (_) {}
      }
    } catch (_) {
      try {
        const raw = localStorage.getItem("debla_academy_reads") || "{}";
        const parsed = JSON.parse(raw);
        parsed[articleId] = { rating: target?.userRating };
        localStorage.setItem("debla_academy_reads", JSON.stringify(parsed));
      } catch (_) {}
    }

    setAcademyArticles(prev =>
      prev.map(a => (a.id === articleId || a.slug === articleId ? { ...a, isRead: true } : a))
    );

    if (!alreadyRead && pointsAwarded > 0) {
      setCurrentUser(prev => prev ? { ...prev, academyPoints: (prev.academyPoints || 0) + pointsAwarded } : prev);
    }

    return { pointsAwarded, alreadyRead };
  }, [academyArticles, setAcademyArticles, setCurrentUser]);

  const rateArticle = useCallback(async (articleId: string, rating: number): Promise<void> => {
    try {
      await supabase.rpc("rate_article_rpc", {
        p_article_id: articleId,
        p_rating: rating,
      });
    } catch (_) {}

    try {
      const raw = localStorage.getItem("debla_academy_reads") || "{}";
      const parsed = JSON.parse(raw);
      parsed[articleId] = { ...(parsed[articleId] || {}), rating };
      localStorage.setItem("debla_academy_reads", JSON.stringify(parsed));
    } catch (_) {}

    setAcademyArticles(prev =>
      prev.map(a => (a.id === articleId || a.slug === articleId ? { ...a, userRating: rating } : a))
    );
  }, [setAcademyArticles]);

  const submitMarriageQuizResult = useCallback(async (scorePercent: number): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };

    const isPassed = scorePercent >= 80;
    const certDate = new Date().toISOString();

    try {
      const { data, error } = await supabase.rpc("submit_marriage_quiz_rpc", {
        p_score: scorePercent,
        p_passed: isPassed,
      });

      if (error) {
        const updateData: Partial<UserProfile> = {
          marriageExamScore: scorePercent,
          ...(isPassed ? {
            isMarriageCertified: true,
            marriageCertificateDate: certDate,
          } : {})
        };
        await saveProfile(updateData);
      } else if (data?.ok) {
        if (isPassed) {
          setCurrentUser(prev => prev ? {
            ...prev,
            isMarriageCertified: true,
            marriageCertificateDate: certDate,
            marriageExamScore: scorePercent,
          } : prev);
        }
      }
    } catch (_) {
      const updateData: Partial<UserProfile> = {
        marriageExamScore: scorePercent,
        ...(isPassed ? {
          isMarriageCertified: true,
          marriageCertificateDate: certDate,
        } : {})
      };
      await saveProfile(updateData);
    }

    return {
      ok: true,
      data: {
        isPassed,
        score: scorePercent,
      }
    };
  }, [currentUser, saveProfile, setCurrentUser]);

  return {
    fetchAcademyArticles,
    markArticleRead,
    rateArticle,
    submitMarriageQuizResult,
  };
};

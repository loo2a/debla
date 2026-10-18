import React, { useRef, useState, useEffect } from "react";
import { ProfileCardSkeleton } from "./Skeleton";

interface LazyCardProps {
  children: React.ReactNode;
}

/**
 * LazyCard — يُؤجّل رسم المحتوى حتى يدخل العنصر منطقة الرؤية
 * يُظهر Skeleton placeholder حتى يصبح مرئياً (تحميل كسول للأداء)
 */
export const LazyCard: React.FC<LazyCardProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // يبدأ التحميل قبل ظهور العنصر بـ 200px
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{visible ? children : <ProfileCardSkeleton />}</div>;
};

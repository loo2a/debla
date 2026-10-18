import { useEffect, useRef } from "react";
import { useUIStore } from "../stores/uiStore";

/**
 * Hook to enable native-like swipe gesture from the right edge of mobile screen (within 10%)
 * to open the RTL navigation drawer (Sidebar), as well as swiping back to close it.
 */
export const useEdgeSwipe = () => {
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const touchStartRef = useRef<{
    startX: number;
    startY: number;
    isRightEdge: boolean;
    startedOpen: boolean;
  } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const screenWidth = window.innerWidth;

      // فحص ما إذا كانت نقطة البداية تقع ضمن الـ 10% الأخيرة من جهة اليمين (الحافة اليمنى)
      const isRightEdge = touch.clientX >= screenWidth * 0.90;

      touchStartRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        isRightEdge,
        startedOpen: isSidebarOpen,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const { startX, startY, isRightEdge, startedOpen } = touchStartRef.current;

      const deltaX = startX - touch.clientX; // موجب عند السحب لليسار
      const deltaY = Math.abs(touch.clientY - startY);

      // الحالة 1: فتح القائمة بالسحب من الحافة اليمنى لليسار
      if (isRightEdge && !startedOpen) {
        // التحقق من أن السحب أفقي بشكل واضح وتجاوز الحد الأدنى (40px)
        if (deltaX > 40 && deltaX > deltaY) {
          setSidebarOpen(true);
          touchStartRef.current = null; // إنهاء التتبع بعد التفعيل
        }
      }

      // الحالة 2: إغلاق القائمة بالسحب لليمين إذا كانت مفتوحة بالفعل
      if (startedOpen) {
        const closeDeltaX = touch.clientX - startX; // موجب عند السحب لليمين
        if (closeDeltaX > 50 && closeDeltaX > deltaY) {
          setSidebarOpen(false);
          touchStartRef.current = null;
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isSidebarOpen, setSidebarOpen]);
};

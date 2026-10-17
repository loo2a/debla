/**
 * دالة مساعدة مركزية لمشاركة التطبيق عبر مختلف المنصات (WhatsApp / Telegram / Native Share)
 */
export async function shareMawadaApp(): Promise<{ success: boolean; method: "native" | "clipboard" | "fallback" }> {
  const title = "تطبيق مودة ورحمة للزواج الإسلامي الشرعي";
  const text = "منصة إسلامية موثوقة للتعارف الجاد بغرض الزواج الشرعي العلني بضوابط الشريعة وميثاق الشرف وحماية تامة للخصوصية.";
  const url = window.location.origin;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: "native" };
    } catch (err: any) {
      if (err.name === "AbortError") {
        return { success: false, method: "native" };
      }
    }
  }

  // Fallback: Clipboard copy
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      return { success: true, method: "clipboard" };
    } catch {
      // Ignored
    }
  }

  // Fallback: Open WhatsApp direct share
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${text}\n${url}`)}`;
  window.open(whatsappUrl, "_blank");
  return { success: true, method: "fallback" };
}

/**
 * أدوات مساعدة لمعالجة وضغط الصور في المتصفح قبل رفعها إلى Supabase Storage
 * تمنع إرهاق السيرفر وتضغط الصور عالية الدقة (5-10 ميجا) إلى أقل من 200 كيلوبايت مع الحفاظ على وضوح الوجه.
 */

export async function compressImage(
  fileOrBase64: File | Blob | string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    let src = "";
    if (typeof fileOrBase64 === "string") {
      src = fileOrBase64;
    } else {
      src = URL.createObjectURL(fileOrBase64);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // حساب الأبعاد المناسبة مع الحفاظ على النسبة والتناسب
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("تعذر إنشاء سياق رسم الصورة Canvas"));
        return;
      }

      // رسم الصورة بالحجم المحسن
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("تعذر ضغط ملف الصورة"));
            return;
          }
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          if (typeof fileOrBase64 !== "string") {
            URL.revokeObjectURL(src);
          }
          resolve({ blob, dataUrl });
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = (err) => {
      reject(new Error("تعذر قراءة ملف الصورة: " + String(err)));
    };

    img.src = src;
  });
}

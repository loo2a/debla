-- ====================================================================
-- مودة ورحمة — إعداد Supabase Storage للصور الشخصية
--   * إنشاء Bucket خاص profile-photos
--   * سياسات RLS صارمة لمنع التلاعب وحماية الخصوصية
--   * دعم ميزة "صورة لا يراها إلا من تقبل اهتمامه"
-- ====================================================================

-- 1) إنشاء الـ Bucket (خاص Private وغير متاح للعامة بدون مصادقة)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  false,
  5242880, -- أقصى حجم 5 ميجابايت (مع ضغط الفرونت إند يكون الحجم أقل من 200 كيلوبايت)
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- 2) سياسات الأمان RLS على جدول storage.objects

-- 2.1 الرفع (Upload): يحق للمستخدم الرفع فقط داخل مجلده الخاص باسم الـ ID الخاص به
create policy "profile_photos_insert_own" on storage.objects for insert to authenticated with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
  -- يشترط أن يكون مشتركاً في باقة التميز لرفع صورة حقيقية
  and exists (
    select 1 from public.profiles where "id" = auth.uid() and "is_premium" = true
  )
);

-- 2.2 الحذف (Delete): يحق للمستخدم حذف صوره فقط
create policy "profile_photos_delete_own" on storage.objects for delete to authenticated using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 2.3 التعديل (Update): التعديل على صوره فقط
create policy "profile_photos_update_own" on storage.objects for update to authenticated using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 2.4 القراءة (Select):
--  - صاحب الصورة دائماً
--  - الأدمن دائماً
--  - العضو من الجنس الآخر بشرط:
--      * عدم وجود حظر
--      * إذا كانت خصوصية الصورة 'public'
--      * أو إذا كانت 'accepted_interest_only' وكان هناك اهتمام متبادل ومقبول
create policy "profile_photos_select" on storage.objects for select to authenticated using (
  bucket_id = 'profile-photos'
  and (
    -- صاحب الصورة
    (storage.foldername(name))[1] = auth.uid()::text
    -- أو أدمن
    or public.is_admin()
    -- أو طرف مصرح له
    or exists (
      select 1 from public.profiles target
      join public.profiles me on me."id" = auth.uid()
      where target."id"::text = (storage.foldername(storage.objects.name))[1]
        and target."gender" <> me."gender"
        and not public.is_blocked_between(auth.uid(), target."id")
        and (
          target."photo_privacy" = 'public'
          or (target."photo_privacy" = 'accepted_interest_only' and public.has_accepted_interest(auth.uid(), target."id"))
        )
    )
  )
);

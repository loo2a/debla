-- ====================================================================
-- مودة ورحمة - الترحيل 05: الإشعارات اللحظية (Push/FCM) والفهرسة الشاملة والبحث المتقدم
-- ====================================================================

-- 1) جدول اشتراكات الإشعارات اللحظية لهواتف أندرويد و FCM
create table if not exists public.push_subscriptions (
  "id"           uuid primary key default gen_random_uuid(),
  "user_id"      uuid not null references public.profiles("id") on delete cascade,
  "fcm_token"    text not null,
  "platform"     text not null default 'android' check ("platform" in ('android', 'ios', 'web')),
  "device_info"  text default '',
  "created_at"   timestamptz not null default now(),
  "updated_at"   timestamptz not null default now(),
  unique ("user_id")
);

-- تفعيل RLS على جدول الإشعارات
alter table public.push_subscriptions enable row level security;

create policy "Users can manage their own push subscription"
  on public.push_subscriptions
  for all
  using (auth.uid() = "user_id")
  with check (auth.uid() = "user_id");

-- 2) فهارس الأداء العالي وفهرسة البحث الشامل (High Performance Indexing)
create index if not exists idx_profiles_fast_discovery 
  on public.profiles ("gender", "is_verified", "is_premium", "residence", "age") 
  where "name" <> '';

create index if not exists idx_profiles_prayers_smoking 
  on public.profiles ("prayers", "is_smoker") 
  where "name" <> '';

create index if not exists idx_profiles_height_weight 
  on public.profiles ("height", "weight");

create index if not exists idx_messages_conversation 
  on public.messages ("senderId", "receiverId", "timestamp" desc);

create index if not exists idx_notifications_user_unread 
  on public.notifications ("userId", "isRead", "timestamp" desc);

create index if not exists idx_interactions_pair 
  on public.interactions ("fromUserId", "toUserId", "type");

-- 3) دالة البحث الشامل المحدثة بكافة الفلاتر (Full-Filter Search RPC)
create or replace function public.search_profiles_rpc(
  p_gender               text default null,
  p_min_age              integer default null,
  p_max_age              integer default null,
  p_residence            text default null,
  p_nationality          text default null,
  p_marital_status       text default null,
  p_religious_commitment text default null,
  p_education            text default null,
  p_prayers              text default null,
  p_smoking              boolean default null,
  p_min_height           integer default null,
  p_max_height           integer default null,
  p_is_verified_only     boolean default false,
  p_hijab_type           text default null,
  p_has_beard            boolean default null,
  p_search_query         text default null,
  p_sort_by              text default 'latest',
  p_page                 integer default 1,
  p_page_size            integer default 12
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_my_gender text;
  v_target_gender text;
  v_offset integer;
  v_total integer;
  v_results json;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  -- تحديد الجنس المطلوب تلقائياً
  select "gender" into v_my_gender from public.profiles where "id" = auth.uid();
  v_target_gender := coalesce(p_gender, case when v_my_gender = 'male' then 'female' else 'male' end);

  v_offset := greatest(0, (coalesce(p_page, 1) - 1) * coalesce(p_page_size, 12));

  -- 1) حساب إجمالي السجلات المطابقة
  select count(*)::integer into v_total
  from public.profiles p
  left join public.profile_sensitive s on s."user_id" = p."id"
  left join public.profile_preferences pref on pref."user_id" = p."id"
  where p."id" <> auth.uid()
    and p."name" <> ''
    and p."gender" = v_target_gender
    and (p_min_age is null or p."age" >= p_min_age)
    and (p_max_age is null or p."age" <= p_max_age)
    and (p_residence is null or p_residence = '' or p."residence" = p_residence)
    and (p_nationality is null or p_nationality = '' or p."nationality" = p_nationality)
    and (p_marital_status is null or p_marital_status = '' or p."marital_status" = p_marital_status or p."maritalStatus" = p_marital_status)
    and (p_religious_commitment is null or p_religious_commitment = '' or p."religious_commitment" = p_religious_commitment)
    and (p_education is null or p_education = '' or p."education" = p_education)
    and (p_prayers is null or p_prayers = '' or p."prayers" = p_prayers)
    and (p_smoking is null or coalesce(p."is_smoker", false) = p_smoking)
    and (p_min_height is null or p."height" >= p_min_height)
    and (p_max_height is null or p."height" <= p_max_height)
    and (not p_is_verified_only or coalesce(p."is_verified", false) = true)
    and (p_hijab_type is null or p_hijab_type = '' or p."hijab_type" = p_hijab_type)
    and (p_has_beard is null or p."has_beard" = p_has_beard)
    and (
      p_search_query is null or p_search_query = '' or
      p."name" ilike '%' || p_search_query || '%' or
      p."profession" ilike '%' || p_search_query || '%' or
      p."about_me" ilike '%' || p_search_query || '%' or
      coalesce(p."aboutMe", '') ilike '%' || p_search_query || '%'
    );

  -- 2) جلب الصفحة المطلوبة مرتبة
  select json_agg(row_to_json(r)) into v_results
  from (
    select 
      p."id",
      p."member_number" as "memberNumber",
      p."name",
      p."gender",
      p."avatar",
      p."profile_image" as "profileImage",
      p."photo_privacy" as "photoPrivacy",
      p."age",
      p."nationality",
      p."residence",
      p."profession",
      p."education",
      p."marital_status" as "maritalStatus",
      p."has_children" as "hasChildren",
      p."children_count" as "childrenCount",
      p."is_smoker" as "isSmoker",
      p."height",
      p."weight",
      p."skin_color" as "skinColor",
      p."body_build" as "bodyBuild",
      p."religious_commitment" as "religiousCommitment",
      p."prayers",
      p."has_beard" as "hasBeard",
      p."hijab_type" as "hijabType",
      p."qa_ima_stance" as "qaImaStance",
      p."mahr_opinion" as "mahrOpinion",
      p."marriage_timeframe" as "marriageTimeframe",
      p."sharia_vision_stance" as "shariaVisionStance",
      p."about_me" as "aboutMe",
      coalesce(pref."partner_specs", p."partner_specs") as "partnerSpecs",
      coalesce(s."income", p."income") as "income",
      coalesce(s."health_status", p."health_status") as "healthStatus",
      coalesce(s."has_disability", p."has_disability") as "hasDisability",
      coalesce(s."chronic_diseases", p."chronic_diseases") as "chronicDiseases",
      p."is_premium" as "isPremium",
      p."is_verified" as "isVerified",
      p."is_online" as "isOnline",
      p."views_count" as "viewsCount",
      p."created_at" as "joinDate"
    from public.profiles p
    left join public.profile_sensitive s on s."user_id" = p."id"
    left join public.profile_preferences pref on pref."user_id" = p."id"
    where p."id" <> auth.uid()
      and p."name" <> ''
      and p."gender" = v_target_gender
      and (p_min_age is null or p."age" >= p_min_age)
      and (p_max_age is null or p."age" <= p_max_age)
      and (p_residence is null or p_residence = '' or p."residence" = p_residence)
      and (p_nationality is null or p_nationality = '' or p."nationality" = p_nationality)
      and (p_marital_status is null or p_marital_status = '' or p."marital_status" = p_marital_status or p."maritalStatus" = p_marital_status)
      and (p_religious_commitment is null or p_religious_commitment = '' or p."religious_commitment" = p_religious_commitment)
      and (p_education is null or p_education = '' or p."education" = p_education)
      and (p_prayers is null or p_prayers = '' or p."prayers" = p_prayers)
      and (p_smoking is null or coalesce(p."is_smoker", false) = p_smoking)
      and (p_min_height is null or p."height" >= p_min_height)
      and (p_max_height is null or p."height" <= p_max_height)
      and (not p_is_verified_only or coalesce(p."is_verified", false) = true)
      and (p_hijab_type is null or p_hijab_type = '' or p."hijab_type" = p_hijab_type)
      and (p_has_beard is null or p."has_beard" = p_has_beard)
      and (
        p_search_query is null or p_search_query = '' or
        p."name" ilike '%' || p_search_query || '%' or
        p."profession" ilike '%' || p_search_query || '%' or
        p."about_me" ilike '%' || p_search_query || '%' or
        coalesce(p."aboutMe", '') ilike '%' || p_search_query || '%'
      )
    order by 
      case when p_sort_by = 'views' then p."views_count" end desc nulls last,
      case when p_sort_by = 'age_asc' then p."age" end asc,
      case when p_sort_by = 'age_desc' then p."age" end desc,
      p."is_premium" desc,
      p."created_at" desc
    limit coalesce(p_page_size, 12)
    offset v_offset
  ) r;

  return json_build_object(
    'results', coalesce(v_results, '[]'::json),
    'total', v_total,
    'page', coalesce(p_page, 1),
    'pageSize', coalesce(p_page_size, 12),
    'totalPages', greatest(1, ceil(v_total::numeric / coalesce(p_page_size, 12)::numeric)::integer)
  );
end;
$$;

-- 4) تحديث سياسات التخزين السحابي لـ Bucket الصور (profile-photos Storage Security)
insert into storage.buckets ("id", "name", "public", "file_size_limit", "allowed_mime_types")
values ('profile-photos', 'profile-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict ("id") do update set
  "file_size_limit" = 5242880,
  "allowed_mime_types" = array['image/jpeg', 'image/png', 'image/webp'];

create policy "Users can upload their own profile photo"
  on storage.objects for insert to authenticated
  with check ("bucket_id" = 'profile-photos' and (storage.foldername("name"))[1] = auth.uid()::text);

create policy "Users can update or delete their own profile photo"
  on storage.objects for update to authenticated
  using ("bucket_id" = 'profile-photos' and (storage.foldername("name"))[1] = auth.uid()::text);

create policy "Users can delete their own profile photo"
  on storage.objects for delete to authenticated
  using ("bucket_id" = 'profile-photos' and (storage.foldername("name"))[1] = auth.uid()::text);

create policy "Users can view profile photos if permitted"
  on storage.objects for select to authenticated
  using ("bucket_id" = 'profile-photos');

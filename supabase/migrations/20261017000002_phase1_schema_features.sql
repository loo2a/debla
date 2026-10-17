-- ====================================================================
-- مودة ورحمة — المرحلة 1: إعادة تصميم الـ Schema والميزات الاحترافية
--   * اعتماد أسماء snake_case قياسية للمتغيرات والأعمدة
--   * تقسيم profiles إلى جداول تخصصية (بيانات عامة، بيانات حساسة، تفضيلات، تواصل)
--   * جدول زيارات حقيقي profile_views وميزة التصفح الخفي incognito_mode
--   * نظام Rate Limiting يومي للرسائل والاهتمامات ومنع الـ Spam
--   * ميزة خصوصية الصور: "صورة لا يراها إلا من تقبل اهتمامه"
--   * دالة بحث متقدمة من السيرفر search_profiles_rpc مع Pagination وفلاتر
--   * إعداد Realtime للمحادثات والإشعارات
-- ====================================================================

begin;

-- ====================================================================
-- 1) التوافق والتحويل إلى snake_case
-- ====================================================================

-- 1.1 تحديث جدول profiles لدعم snake_case وتضمين الميزات الجديدة
alter table if exists public.profiles
  add column if not exists "member_number" text,
  add column if not exists "profile_image_url" text,
  add column if not exists "photo_privacy" text not null default 'public' check ("photo_privacy" in ('public', 'accepted_interest_only', 'hidden')),
  add column if not exists "marital_status" text,
  add column if not exists "has_children" boolean not null default false,
  add column if not exists "children_count" integer not null default 0,
  add column if not exists "is_smoker" boolean not null default false,
  add column if not exists "skin_color" text not null default 'قمحي',
  add column if not exists "body_build" text not null default 'متوسط',
  add column if not exists "health_status" text not null default 'بصحة جيدة جداً والحمد لله',
  add column if not exists "has_disability" boolean not null default false,
  add column if not exists "chronic_diseases" text not null default '',
  add column if not exists "religious_commitment" text not null default 'ملتزم متوسط يسعى للأفضل',
  add column if not exists "has_beard" boolean,
  add column if not exists "hijab_type" text,
  add column if not exists "qa_ima_stance" text not null default 'موضوع خاضع للاتفاق بين العائلتين',
  add column if not exists "mahr_opinion" text not null default 'موضوع خاضع للاتفاق والنقاش المرن',
  add column if not exists "marriage_timeframe" text not null default 'خلال سنة على الأكثر',
  add column if not exists "sharia_vision_stance" text not null default 'أؤيد الرؤية الشرعية بوجود محرم في أقرب فرصة',
  add column if not exists "about_me" text not null default '',
  add column if not exists "partner_specs" text not null default '',
  add column if not exists "is_premium" boolean not null default false,
  add column if not exists "is_verified" boolean not null default false,
  add column if not exists "premium_expiry_date" timestamptz,
  add column if not exists "incognito_mode" boolean not null default false,
  add column if not exists "is_online" boolean not null default false,
  add column if not exists "last_seen" text,
  add column if not exists "created_at" timestamptz not null default now(),
  add column if not exists "updated_at" timestamptz not null default now();

-- نسخ أي بيانات سابقة من الأعمدة ذات الأسماء القديمة إن وُجدت
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'memberNumber') then
    update public.profiles set "member_number" = coalesce("member_number", "memberNumber");
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'maritalStatus') then
    update public.profiles set "marital_status" = coalesce("marital_status", "maritalStatus");
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'isPremium') then
    update public.profiles set "is_premium" = coalesce("is_premium", "isPremium");
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'isVerified') then
    update public.profiles set "is_verified" = coalesce("is_verified", "isVerified");
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'isOnline') then
    update public.profiles set "is_online" = coalesce("is_online", "isOnline");
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'aboutMe') then
    update public.profiles set "about_me" = coalesce("about_me", "aboutMe");
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'partnerSpecs') then
    update public.profiles set "partner_specs" = coalesce("partner_specs", "partnerSpecs");
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'profileImage') then
    update public.profiles set "profile_image_url" = coalesce("profile_image_url", "profileImage");
  end if;
end $$;

-- ضمان توليد رقم عضوية متسلسل فريد
update public.profiles 
   set "member_number" = ('MEMBER-' || nextval('public.member_number_seq')::text)
 where "member_number" is null or "member_number" = '';

alter table public.profiles alter column "member_number" set not null;
create unique index if not exists profiles_member_number_unique on public.profiles ("member_number");

-- ====================================================================
-- 2) تقسيم البيانات إلى جداول متخصصة (Normalization)
-- ====================================================================

-- 2.1 جدول البيانات الحساسة (الدخل والصحة والأمراض المزمنة)
create table if not exists public.profile_sensitive (
  "user_id"          uuid primary key references public.profiles("id") on delete cascade,
  "income"           text not null default 'من 7,000 إلى 15,000 جنيه أو ما يعادلها',
  "health_status"    text not null default 'بصحة جيدة جداً والحمد لله',
  "has_disability"   boolean not null default false,
  "chronic_diseases" text not null default '',
  "created_at"       timestamptz not null default now(),
  "updated_at"       timestamptz not null default now()
);

-- 2.2 جدول التفضيلات ومواصفات شريك الحياة
create table if not exists public.profile_preferences (
  "user_id"                      uuid primary key references public.profiles("id") on delete cascade,
  "partner_specs"                text not null default '',
  "preferred_min_age"            integer check ("preferred_min_age" is null or "preferred_min_age" between 18 and 90),
  "preferred_max_age"            integer check ("preferred_max_age" is null or "preferred_max_age" between 18 and 90),
  "preferred_residences"         text[] not null default '{}',
  "preferred_marital_statuses"   text[] not null default '{}',
  "created_at"                   timestamptz not null default now(),
  "updated_at"                   timestamptz not null default now()
);

-- 2.3 نقل البيانات الموجودة من profiles للجداول الجديدة
insert into public.profile_sensitive ("user_id", "income", "health_status", "has_disability", "chronic_diseases")
select p."id", 
       coalesce(p."income", 'من 7,000 إلى 15,000 جنيه أو ما يعادلها'),
       coalesce(p."health_status", 'بصحة جيدة جداً والحمد لله'),
       coalesce(p."has_disability", false),
       coalesce(p."chronic_diseases", '')
from public.profiles p
on conflict ("user_id") do update set
  "income" = excluded."income",
  "health_status" = excluded."health_status",
  "has_disability" = excluded."has_disability",
  "chronic_diseases" = excluded."chronic_diseases";

insert into public.profile_preferences ("user_id", "partner_specs")
select p."id", coalesce(p."partner_specs", '')
from public.profiles p
on conflict ("user_id") do update set
  "partner_specs" = excluded."partner_specs";

-- ====================================================================
-- 3) جدول الزيارات الفعلي (Real Profile Views)
-- ====================================================================

create table if not exists public.profile_views (
  "id"         uuid primary key default gen_random_uuid(),
  "viewer_id"  uuid not null references public.profiles("id") on delete cascade,
  "viewed_id"  uuid not null references public.profiles("id") on delete cascade,
  "view_date"  date not null default current_date,
  "created_at" timestamptz not null default now(),
  check ("viewer_id" <> "viewed_id"),
  unique ("viewer_id", "viewed_id", "view_date")
);

create index if not exists profile_views_viewed_idx on public.profile_views ("viewed_id", "created_at" desc);
create index if not exists profile_views_viewer_idx on public.profile_views ("viewer_id", "created_at" desc);

-- ====================================================================
-- 4) جدول حدود الاستخدام (Rate Limiting)
-- ====================================================================

create table if not exists public.rate_limits (
  "user_id"      uuid not null references public.profiles("id") on delete cascade,
  "action_type"  text not null check ("action_type" in ('message', 'interest')),
  "action_date"  date not null default current_date,
  "action_count" integer not null default 0,
  "updated_at"   timestamptz not null default now(),
  primary key ("user_id", "action_type", "action_date")
);

-- ====================================================================
-- 5) الفهارس المحسّنة (Performance Indexes)
-- ====================================================================

create index if not exists idx_profiles_search_composite 
  on public.profiles ("gender", "residence", "age") 
  where "name" <> '';

create index if not exists idx_profiles_marital_status 
  on public.profiles ("marital_status") 
  where "name" <> '';

create index if not exists idx_profiles_nationality 
  on public.profiles ("nationality");

create index if not exists idx_profiles_education 
  on public.profiles ("education");

create index if not exists idx_profiles_online 
  on public.profiles ("is_online") 
  where "is_online" = true;

-- ====================================================================
-- 6) دوال البحث والزيارات وحدود الاستخدام (RPC Functions)
-- ====================================================================

-- 6.1 فحص قبول الاهتمام المتبادل (لقفل/فتح الصورة الخاصة)
create or replace function public.has_accepted_interest(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.interactions
    where ("type" = 'accept_interest')
      and (("fromUserId" = a and "toUserId" = b) or ("fromUserId" = b and "toUserId" = a))
  ) or exists (
    -- تبادل الاهتمام من كلا الطرفين
    select 1 from public.interactions i1
    join public.interactions i2 on i2."fromUserId" = i1."toUserId" and i2."toUserId" = i1."fromUserId"
    where i1."fromUserId" = a and i1."toUserId" = b and i1."type" = 'interest' and i2."type" = 'interest'
  );
$$;

-- 6.2 دالة تسجيل الزيارة مع دعم التصفح الخفي للمشتركين
create or replace function public.record_profile_view_rpc(p_viewed_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_me record;
  v_viewer_name text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if auth.uid() = p_viewed_id then
    return json_build_object('recorded', false, 'reason', 'self');
  end if;

  select "id", "name", "member_number", "is_premium", "incognito_mode" 
    into v_me 
    from public.profiles 
   where "id" = auth.uid();

  -- التصفح الخفي مفعل للمشترك المميز: لا يتم تسجيل الزيارة ولا إرسال إشعار
  if v_me."is_premium" and v_me."incognito_mode" then
    return json_build_object('recorded', false, 'incognito', true);
  end if;

  -- فحص الحظر
  if public.is_blocked_between(auth.uid(), p_viewed_id) then
    return json_build_object('recorded', false, 'blocked', true);
  end if;

  insert into public.profile_views ("viewer_id", "viewed_id", "view_date")
  values (auth.uid(), p_viewed_id, current_date)
  on conflict ("viewer_id", "viewed_id", "view_date") do nothing;

  -- إرسال إشعار لصاحب الملف
  v_viewer_name := coalesce(nullif(v_me."name", ''), v_me."member_number");
  insert into public.notifications ("userId", "type", "senderId", "senderName", "content")
  values (
    p_viewed_id, 
    'system', 
    auth.uid(), 
    v_viewer_name,
    'قام العضو ' || v_viewer_name || ' بالاطلاع على ملفك الشخصي.'
  );

  return json_build_object('recorded', true, 'incognito', false);
end;
$$;

-- 6.3 دالة حساب عداد الزيارات الفعلي
create or replace function public.get_profile_views_count(p_user_id uuid)
returns integer language sql stable security definer set search_path = public as $$
  select count(distinct "viewer_id")::integer 
    from public.profile_views 
   where "viewed_id" = p_user_id;
$$;

-- 6.4 فحص وزيادة حد الاستخدام اليومي (Rate Limit Check)
create or replace function public.check_and_increment_rate_limit(p_user_id uuid, p_action text, p_max integer)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_current integer;
begin
  insert into public.rate_limits ("user_id", "action_type", "action_date", "action_count", "updated_at")
  values (p_user_id, p_action, current_date, 1, now())
  on conflict ("user_id", "action_type", "action_date") do update
    set "action_count" = public.rate_limits."action_count" + 1,
        "updated_at"   = now()
  returning "action_count" into v_current;

  if v_current > p_max then
    raise exception 'rate_limit_exceeded: لقد استهلكت الحد الأقصى اليومي (% إجراء) لهذا النشاط.', p_max;
  end if;
end;
$$;

-- 6.5 دالة إرسال الرسائل مع Rate Limiting ومنع الـ Spam
create or replace function public.send_message_rpc(p_receiver_id uuid, p_content text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_sender record;
  v_limit integer;
  v_new_id uuid;
  v_clean text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  v_clean := btrim(p_content);
  if length(v_clean) = 0 or length(v_clean) > 2000 then
    raise exception 'invalid_message_length';
  end if;

  if not public.can_interact_with(p_receiver_id) then
    raise exception 'cannot_interact_with_user';
  end if;

  select "id", "is_premium" into v_sender from public.profiles where "id" = auth.uid();
  
  -- حد الرسائل اليومي: 10 للمستخدم العادي، و 150 للمستخدم المميز
  v_limit := case when v_sender."is_premium" then 150 else 10 end;
  perform public.check_and_increment_rate_limit(auth.uid(), 'message', v_limit);

  insert into public.messages ("senderId", "receiverId", "content")
  values (auth.uid(), p_receiver_id, v_clean)
  returning "id" into v_new_id;

  return json_build_object('ok', true, 'message_id', v_new_id);
end;
$$;

-- 6.6 دالة إبداء الاهتمام مع Rate Limiting
create or replace function public.express_interest_rpc(p_target_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_me record;
  v_limit integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if not public.can_interact_with(p_target_id) then
    raise exception 'cannot_interact_with_user';
  end if;

  select "id", "is_premium" into v_me from public.profiles where "id" = auth.uid();

  -- حد إبداء الاهتمام: 5 باليوم للمجاني، 30 للمميز
  v_limit := case when v_me."is_premium" then 30 else 5 end;
  perform public.check_and_increment_rate_limit(auth.uid(), 'interest', v_limit);

  insert into public.interactions ("fromUserId", "toUserId", "type")
  values (auth.uid(), p_target_id, 'interest')
  on conflict ("fromUserId", "toUserId", "type") do nothing;

  return json_build_object('ok', true);
end;
$$;

-- 6.7 دالة قبول الاهتمام (لفتح المحادثة أو رؤية الصورة المحمية)
create or replace function public.accept_interest_rpc(p_target_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_my_name text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  -- التأكد من أن الطرف الآخر أرسل اهتماماً مسبقاً
  if not exists (
    select 1 from public.interactions 
    where "fromUserId" = p_target_id and "toUserId" = auth.uid() and "type" = 'interest'
  ) then
    raise exception 'no_prior_interest_to_accept';
  end if;

  insert into public.interactions ("fromUserId", "toUserId", "type")
  values (auth.uid(), p_target_id, 'accept_interest')
  on conflict ("fromUserId", "toUserId", "type") do nothing;

  select coalesce(nullif("name",''), "member_number") into v_my_name 
    from public.profiles where "id" = auth.uid();

  insert into public.notifications ("userId", "type", "senderId", "senderName", "content")
  values (
    p_target_id,
    'interest',
    auth.uid(),
    v_my_name,
    'مبروك! قبل العضو ' || v_my_name || ' اهتمامك، يمكنكما الآن بدء التواصل ورؤية تفاصيل الصورة.'
  );

  return json_build_object('ok', true);
end;
$$;

-- 6.8 البحث المتقدم من السيرفر مع فلاتر وصفحات (Server-Side Search & Pagination)
create or replace function public.search_profiles_rpc(
  p_gender               text default null,
  p_min_age              integer default null,
  p_max_age              integer default null,
  p_residence            text default null,
  p_nationality          text default null,
  p_marital_status       text default null,
  p_religious_commitment text default null,
  p_education            text default null,
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

  -- تحديد الجنس المطلوب تلقائياً: المعاكس لجنس المستخدم الحالي
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
    and (p_search_query is null or p_search_query = '' or 
         p."name" ilike '%' || p_search_query || '%' or 
         p."about_me" ilike '%' || p_search_query || '%' or
         pref."partner_specs" ilike '%' || p_search_query || '%' or
         p."profession" ilike '%' || p_search_query || '%')
    and not public.is_blocked_between(auth.uid(), p."id")
    and not exists (
      select 1 from public.interactions 
      where "fromUserId" = auth.uid() and "toUserId" = p."id" and "type" = 'ignore'
    );

  -- 2) جلب النتائج مع حساب إمكانية رؤية الصورة بناءً على الخصوصية
  select coalesce(json_agg(row_to_json(t)), '[]'::json) into v_results
  from (
    select 
      p."id",
      p."member_number" as "memberNumber",
      p."name",
      p."gender",
      p."avatar",
      p."photo_privacy" as "photoPrivacy",
      -- خصوصية الصورة: إما عامة، أو مشروطة بقبول الاهتمام المتبادل
      case 
        when p."photo_privacy" = 'public' then p."profile_image_url"
        when p."photo_privacy" = 'accepted_interest_only' and public.has_accepted_interest(auth.uid(), p."id") then p."profile_image_url"
        else null
      end as "profileImage",
      (p."photo_privacy" = 'accepted_interest_only' and not public.has_accepted_interest(auth.uid(), p."id")) as "isPhotoLocked",
      p."age",
      p."nationality",
      p."residence",
      p."profession",
      p."education",
      coalesce(s."income", p."income") as "income",
      coalesce(p."marital_status", p."maritalStatus") as "maritalStatus",
      p."has_children" as "hasChildren",
      p."children_count" as "childrenCount",
      p."is_smoker" as "isSmoker",
      p."height",
      p."weight",
      p."skin_color" as "skinColor",
      p."body_build" as "bodyBuild",
      coalesce(s."health_status", p."health_status") as "healthStatus",
      coalesce(s."has_disability", p."has_disability") as "hasDisability",
      coalesce(s."chronic_diseases", p."chronic_diseases") as "chronicDiseases",
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
      p."hobbies",
      p."is_premium" as "isPremium",
      p."is_verified" as "isVerified",
      p."is_online" as "isOnline",
      p."last_seen" as "lastSeen",
      p."created_at"::date as "joinDate",
      (select count(distinct "viewer_id")::integer from public.profile_views where "viewed_id" = p."id") as "viewsCount"
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
      and (p_search_query is null or p_search_query = '' or 
           p."name" ilike '%' || p_search_query || '%' or 
           p."about_me" ilike '%' || p_search_query || '%' or
           pref."partner_specs" ilike '%' || p_search_query || '%' or
           p."profession" ilike '%' || p_search_query || '%')
      and not public.is_blocked_between(auth.uid(), p."id")
      and not exists (
        select 1 from public.interactions 
        where "fromUserId" = auth.uid() and "toUserId" = p."id" and "type" = 'ignore'
      )
    order by 
      case when p_sort_by = 'age_asc' then p."age" end asc,
      case when p_sort_by = 'age_desc' then p."age" end desc,
      case when p_sort_by = 'activity' then p."is_online"::int end desc,
      p."is_premium" desc, -- تمييز الأعضاء المميزين في الترتيب
      p."created_at" desc
    limit coalesce(p_page_size, 12)
    offset v_offset
  ) t;

  return json_build_object(
    'results', v_results,
    'total', v_total,
    'page', coalesce(p_page, 1),
    'pageSize', coalesce(p_page_size, 12),
    'totalPages', ceil(v_total::numeric / greatest(coalesce(p_page_size, 12), 1))
  );
end;
$$;

-- ====================================================================
-- 7) تفعيل Supabase Realtime على الجداول الحية
-- ====================================================================

do $$
begin
  -- إضافة الجداول للـ Realtime إذا لم تكن موجودة بالفعل
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.messages;
    exception when others then null;
    end;
    begin
      alter publication supabase_realtime add table public.notifications;
    exception when others then null;
    end;
  end if;
end $$;

-- ====================================================================
-- 8) قواعد الأمان (RLS) للجداول الجديدة
-- ====================================================================

alter table public.profile_sensitive   enable row level security;
alter table public.profile_preferences enable row level security;
alter table public.profile_views       enable row level security;
alter table public.rate_limits         enable row level security;

-- 8.1 profile_sensitive
create policy profile_sensitive_select on public.profile_sensitive for select to authenticated using (
  "user_id" = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.profiles p
    join public.profiles me on me."id" = auth.uid()
    where p."id" = public.profile_sensitive."user_id"
      and p."gender" <> me."gender"
      and not public.is_blocked_between(auth.uid(), p."id")
  )
);
create policy profile_sensitive_update_own on public.profile_sensitive for update to authenticated
  using ("user_id" = auth.uid()) with check ("user_id" = auth.uid());
create policy profile_sensitive_insert_own on public.profile_sensitive for insert to authenticated
  with check ("user_id" = auth.uid());

-- 8.2 profile_preferences
create policy profile_preferences_select on public.profile_preferences for select to authenticated using (
  "user_id" = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.profiles p
    join public.profiles me on me."id" = auth.uid()
    where p."id" = public.profile_preferences."user_id"
      and p."gender" <> me."gender"
      and not public.is_blocked_between(auth.uid(), p."id")
  )
);
create policy profile_preferences_update_own on public.profile_preferences for update to authenticated
  using ("user_id" = auth.uid()) with check ("user_id" = auth.uid());
create policy profile_preferences_insert_own on public.profile_preferences for insert to authenticated
  with check ("user_id" = auth.uid());

-- 8.3 profile_views
create policy profile_views_select on public.profile_views for select to authenticated using (
  "viewed_id" = auth.uid() or "viewer_id" = auth.uid() or public.is_admin()
);
create policy profile_views_insert on public.profile_views for insert to authenticated with check (
  "viewer_id" = auth.uid() and not public.is_blocked_between(auth.uid(), "viewed_id")
);

-- 8.4 rate_limits: قراءة فقط للمستخدم للتحقق من حصصه، والتعديل عبر دوال السيرفر المحمية فقط
create policy rate_limits_select on public.rate_limits for select to authenticated using (
  "user_id" = auth.uid() or public.is_admin()
);

-- ====================================================================
-- 9) منح الصلاحيات للدوال الجديدة
-- ====================================================================

grant execute on function
  public.has_accepted_interest(uuid, uuid),
  public.record_profile_view_rpc(uuid),
  public.get_profile_views_count(uuid),
  public.send_message_rpc(uuid, text),
  public.express_interest_rpc(uuid),
  public.accept_interest_rpc(uuid),
  public.search_profiles_rpc(text, integer, integer, text, text, text, text, text, text, text, integer, integer)
to authenticated;

-- مزامنة إنشاء الجداول التابعة تلقائياً للمستخدم الجديد
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles ("id") values (new.id) on conflict do nothing;
  insert into public.profile_private ("id", "email") values (new.id, coalesce(lower(new.email), '')) on conflict do nothing;
  insert into public.profile_sensitive ("user_id") values (new.id) on conflict do nothing;
  insert into public.profile_preferences ("user_id") values (new.id) on conflict do nothing;
  return new;
end;
$$;

commit;

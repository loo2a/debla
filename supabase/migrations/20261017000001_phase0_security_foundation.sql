-- ====================================================================
-- مودة ورحمة — المرحلة 0: الأساس الأمني
--   * تسجيل دخول حقيقي عبر Supabase Auth (profiles.id = auth.users.id)
--   * فصل البيانات الخاصة (الإيميل/الموبايل) في جدول مستقل
--   * RLS صارمة على كل الجداول + منع تعديل الأعمدة الحساسة من العميل
--   * عمليات الأدمن عبر دوال RPC محمية (لا تعتمد على الإيميل في الواجهة)
--   * الإشعارات تُنشأ من السيرفر فقط (Triggers)
--
-- ⚠️ مخصص لمشروع Supabase جديد (إنتاج). لا تشغّله على المشروع التجريبي
--    القديم قبل حذف جداوله (راجع قسم RESET بالأسفل).
-- ====================================================================

-- --------------------------------------------------------------------
-- RESET (اختياري — يحذف كل البيانات!). أزل التعليق فقط لو متأكد.
-- --------------------------------------------------------------------
-- drop table if exists public.premium_requests, public.success_stories,
--   public.interactions, public.notifications, public.messages,
--   public.profile_private, public.profiles, public.user_roles cascade;
-- drop sequence if exists public.member_number_seq;

begin;

create sequence if not exists public.member_number_seq start 10001;

-- ====================================================================
-- 1) الجداول
-- ====================================================================

-- الأدمن: لا توجد أي سياسة/صلاحية للعميل على هذا الجدول
create table public.user_roles (
  "user_id" uuid primary key references auth.users(id) on delete cascade,
  "role"    text not null check ("role" in ('admin'))
);

-- الملف العام (يظهر للجنس الآخر بعد اكتمال التسجيل)
create table public.profiles (
  "id"                  uuid primary key references auth.users(id) on delete cascade,
  "memberNumber"        text not null unique default ('MEMBER-' || nextval('public.member_number_seq')::text),
  "name"                text not null default '' check (char_length("name") <= 80),
  "gender"              text not null default 'male' check ("gender" in ('male','female')),
  "avatar"              text not null default 'male_1',
  "profileImage"        text check ("profileImage" is null or char_length("profileImage") < 600000),

  "age"                 integer not null default 25 check ("age" between 18 and 90),
  "nationality"         text not null default 'مصر',
  "residence"           text not null default 'مصر',
  "profession"          text not null default '' check (char_length("profession") <= 100),
  "education"           text not null default 'بكالوريوس / ليسانس',
  "income"              text not null default 'من 7,000 إلى 15,000 جنيه أو ما يعادلها',
  "maritalStatus"       text not null default 'اعزب' check ("maritalStatus" in ('اعزب','ارمل','مطلق')),
  "hasChildren"         boolean not null default false,
  "childrenCount"       integer not null default 0 check ("childrenCount" between 0 and 20),
  "isSmoker"            boolean not null default false,

  "height"              integer not null default 170 check ("height" between 120 and 230),
  "weight"              integer not null default 70  check ("weight" between 30 and 250),
  "skinColor"           text not null default 'قمحي',
  "bodyBuild"           text not null default 'متوسط',
  "healthStatus"        text not null default 'بصحة جيدة جداً والحمد لله',
  "hasDisability"       boolean not null default false,
  "chronicDiseases"     text not null default '' check (char_length("chronicDiseases") <= 500),

  "religiousCommitment" text not null default 'ملتزم متوسط يسعى للأفضل',
  "prayers"             text not null default 'أصلي كل الصلوات في وقتها والحمد لله',
  "hasBeard"            boolean,
  "hijabType"           text check ("hijabType" is null or "hijabType" in ('حجاب','نقاب','خمار','غير محجبة')),

  "qaImaStance"         text not null default 'موضوع خاضع للاتفاق بين العائلتين',
  "mahrOpinion"         text not null default 'موضوع خاضع للاتفاق والنقاش المرن',
  "marriageTimeframe"   text not null default 'خلال سنة على الأكثر',
  "shariaVisionStance"  text not null default 'أؤيد الرؤية الشرعية بوجود محرم في أقرب فرصة',

  "aboutMe"             text not null default '' check (char_length("aboutMe") <= 2000),
  "partnerSpecs"        text not null default '' check (char_length("partnerSpecs") <= 2000),
  "hobbies"             text[] not null default '{}' check (coalesce(array_length("hobbies",1),0) <= 20),

  -- أعمدة يديرها السيرفر فقط (يُمنع تعديلها من العميل بواسطة trigger)
  "isPremium"           boolean not null default false,
  "isVerified"          boolean not null default false,
  "premiumExpiryDate"   timestamptz,
  "viewsCount"          integer not null default 0,
  "joinDate"            date not null default current_date,

  "isOnline"            boolean not null default false,
  "lastSeen"            text
);

-- بيانات خاصة: لا يراها إلا صاحبها والأدمن
create table public.profile_private (
  "id"               uuid primary key references public.profiles("id") on delete cascade,
  "email"            text not null default '',
  "mobile"           text not null default '' check ("mobile" = '' or "mobile" ~ '^\+?[0-9 \-]{8,20}$'),
  "isMobileVerified" boolean not null default false,
  "agreedToCharter"  boolean not null default false,
  "charterAgreedAt"  timestamptz,
  "charterVersion"   text
);

create table public.interactions (
  "id"         uuid primary key default gen_random_uuid(),
  "fromUserId" uuid not null references public.profiles("id") on delete cascade,
  "toUserId"   uuid not null references public.profiles("id") on delete cascade,
  "type"       text not null check ("type" in ('interest','ignore','block','report')),
  "reason"     text check ("reason" is null or char_length("reason") <= 500),
  "timestamp"  timestamptz not null default now(),
  check ("fromUserId" <> "toUserId"),
  unique ("fromUserId","toUserId","type")
);

create table public.messages (
  "id"         uuid primary key default gen_random_uuid(),
  "senderId"   uuid not null references public.profiles("id") on delete cascade,
  "receiverId" uuid not null references public.profiles("id") on delete cascade,
  "content"    text not null check (char_length(btrim("content")) between 1 and 2000),
  "timestamp"  timestamptz not null default now(),
  "isRead"     boolean not null default false,
  check ("senderId" <> "receiverId")
);

create table public.notifications (
  "id"         uuid primary key default gen_random_uuid(),
  "userId"     uuid not null references public.profiles("id") on delete cascade,
  "type"       text not null check ("type" in ('interest','ignore','system','message','premium_request','verify_request')),
  "senderId"   uuid references public.profiles("id") on delete set null,
  "senderName" text,
  "content"    text not null,
  "timestamp"  timestamptz not null default now(),
  "isRead"     boolean not null default false
);

create table public.success_stories (
  "id"            uuid primary key default gen_random_uuid(),
  "husbandName"   text not null check (char_length("husbandName") between 1 and 80),
  "wifeName"      text not null check (char_length("wifeName") between 1 and 80),
  "story"         text not null check (char_length("story") between 1 and 3000),
  "date"          date not null default current_date,
  "isApproved"    boolean not null default false,
  "avatarHusband" text,
  "avatarWife"    text,
  "submittedBy"   uuid references public.profiles("id") on delete set null
);

create table public.premium_requests (
  "id"            uuid primary key default gen_random_uuid(),
  "userId"        uuid not null references public.profiles("id") on delete cascade,
  "userName"      text not null default '',
  "userGender"    text not null default 'male',
  "planDuration"  text not null check ("planDuration" in ('week','month','3months','6months','year')),
  "paymentMethod" text not null check ("paymentMethod" in ('google_play','credit_card','mobile_wallet')),
  "phoneNumber"   text check ("phoneNumber" is null or char_length("phoneNumber") <= 20),
  "status"        text not null default 'pending' check ("status" in ('pending','approved','rejected')),
  "timestamp"     timestamptz not null default now(),
  "reviewedAt"    timestamptz
);

-- ====================================================================
-- 2) Indexes
-- ====================================================================
create index profiles_search_idx        on public.profiles ("gender","age") where "name" <> '';
create index profiles_residence_idx     on public.profiles ("residence");
create index interactions_to_idx        on public.interactions ("toUserId","type");
create index interactions_from_idx      on public.interactions ("fromUserId","type");
create index messages_receiver_idx      on public.messages ("receiverId","timestamp" desc);
create index messages_sender_idx        on public.messages ("senderId","timestamp" desc);
create index notifications_user_idx     on public.notifications ("userId","timestamp" desc);
create index premium_requests_user_idx  on public.premium_requests ("userId","timestamp" desc);
-- طلب معلّق واحد فقط لكل مستخدم
create unique index premium_requests_one_pending on public.premium_requests ("userId") where "status" = 'pending';

-- ====================================================================
-- 3) دوال مساعدة (SECURITY DEFINER لتجاوز RLS بشكل مضبوط)
-- ====================================================================

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where "user_id" = auth.uid() and "role" = 'admin');
$$;

create or replace function public.assert_admin()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.my_gender()
returns text language sql stable security definer set search_path = public as $$
  select "gender" from public.profiles where "id" = auth.uid();
$$;

-- هل بين الطرفين حظر؟ (لا تُكشف إلا لطرف في العلاقة أو الأدمن)
create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select (auth.uid() in (a, b) or public.is_admin())
     and exists (
       select 1 from public.interactions
       where "type" = 'block'
         and (("fromUserId" = a and "toUserId" = b) or ("fromUserId" = b and "toUserId" = a))
     );
$$;

-- هل يحق للمستخدم الحالي التفاعل مع الهدف؟
-- (الطرفان أكملا التسجيل، جنسان مختلفان، لا يوجد حظر)
create or replace function public.can_interact_with(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null
     and target <> auth.uid()
     and exists (
       select 1
       from public.profiles t
       join public.profiles me on me."id" = auth.uid()
       where t."id" = target
         and t."name" <> '' and me."name" <> ''
         and t."gender" <> me."gender"
     )
     and not public.is_blocked_between(auth.uid(), target);
$$;

-- إشعار كل الأدمن
create or replace function public.notify_admins(p_type text, p_sender uuid, p_sender_name text, p_content text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications ("userId","type","senderId","senderName","content")
  select r."user_id", p_type, p_sender, p_sender_name, p_content
  from public.user_roles r
  join public.profiles p on p."id" = r."user_id"
  where r."role" = 'admin';
end;
$$;

-- ====================================================================
-- 4) Triggers
-- ====================================================================

-- 4.1 إنشاء الملف تلقائياً عند أول تسجيل دخول
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles ("id") values (new.id) on conflict do nothing;
  insert into public.profile_private ("id","email") values (new.id, coalesce(lower(new.email), '')) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4.2 حماية الأعمدة الحساسة: أي تعديل من العميل (authenticated) على هذه الأعمدة يُتجاهل
create or replace function public.protect_profile_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated','anon') then
    new."id"                := old."id";
    new."memberNumber"      := old."memberNumber";
    new."isPremium"         := old."isPremium";
    new."isVerified"        := old."isVerified";
    new."premiumExpiryDate" := old."premiumExpiryDate";
    new."viewsCount"        := old."viewsCount";
    new."joinDate"          := old."joinDate";
    -- رفع صورة شخصية حكر على المشتركين
    if new."profileImage" is distinct from old."profileImage" and not old."isPremium" then
      new."profileImage" := old."profileImage";
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

create or replace function public.protect_private_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated','anon') then
    new."id"              := old."id";
    new."email"           := old."email";
    new."agreedToCharter" := old."agreedToCharter";
    new."charterAgreedAt" := old."charterAgreedAt";
    new."charterVersion"  := old."charterVersion";
    -- تغيير الرقم يلغي حالة التوثيق السابقة
    if new."mobile" is distinct from old."mobile" then
      new."isMobileVerified" := false;
    else
      new."isMobileVerified" := old."isMobileVerified";
    end if;
  end if;
  return new;
end;
$$;

create trigger profile_private_protect_columns
  before update on public.profile_private
  for each row execute function public.protect_private_columns();

-- 4.3 الوقت من السيرفر دائماً + الرسالة تبدأ غير مقروءة
create or replace function public.force_server_timestamp()
returns trigger language plpgsql set search_path = public as $$
begin
  new."timestamp" := now();
  return new;
end;
$$;

create trigger messages_server_ts       before insert on public.messages         for each row execute function public.force_server_timestamp();
create trigger interactions_server_ts   before insert on public.interactions     for each row execute function public.force_server_timestamp();
create trigger premium_requests_server_ts before insert on public.premium_requests for each row execute function public.force_server_timestamp();

create or replace function public.message_defaults()
returns trigger language plpgsql set search_path = public as $$
begin
  new."isRead" := false;
  new."content" := btrim(new."content");
  return new;
end;
$$;
create trigger messages_defaults before insert on public.messages for each row execute function public.message_defaults();

-- 4.4 طلب الاشتراك: الاسم والجنس والحالة من السيرفر
create or replace function public.premium_request_defaults()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select p."name", p."gender" into new."userName", new."userGender"
  from public.profiles p where p."id" = new."userId";
  if coalesce(new."userName", '') = '' then new."userName" := 'مستخدم جديد'; end if;
  new."status" := 'pending';
  new."reviewedAt" := null;
  return new;
end;
$$;
create trigger premium_requests_defaults before insert on public.premium_requests
  for each row execute function public.premium_request_defaults();

-- 4.5 إنشاء الإشعارات من السيرفر
create or replace function public.notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_name text;
begin
  select coalesce(nullif("name",''), "memberNumber") into v_name from public.profiles where "id" = new."senderId";
  insert into public.notifications ("userId","type","senderId","senderName","content")
  values (new."receiverId", 'message', new."senderId", v_name,
          'لديك رسالة جديدة من العضو ' || v_name || ': "' || left(new."content", 30) || '..."');
  return new;
end;
$$;
create trigger messages_notify after insert on public.messages for each row execute function public.notify_on_message();

create or replace function public.notify_on_interaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_name text; v_from_num text; v_to_num text;
begin
  select coalesce(nullif("name",''), 'عضو جاد'), "memberNumber" into v_name, v_from_num
    from public.profiles where "id" = new."fromUserId";

  if new."type" = 'interest' then
    insert into public.notifications ("userId","type","senderId","senderName","content")
    values (new."toUserId", 'interest', new."fromUserId", v_name,
            'أبدى العضو رقم ' || v_from_num || ' اهتمامه بملفك الشخصي ومواصفاتك.');
  elsif new."type" = 'report' then
    select "memberNumber" into v_to_num from public.profiles where "id" = new."toUserId";
    perform public.notify_admins('system', new."fromUserId", v_name,
      'إبلاغ عن إساءة استخدام من العضو ' || v_from_num || ' ضد العضو ' || v_to_num || ' بسبب: ' || coalesce(new."reason", ''));
  end if;
  -- ملاحظة: لا يُرسل إشعار للعضو الذي تم تجاهله (حفظاً لخصوصية وكرامة الطرفين)
  return new;
end;
$$;
create trigger interactions_notify after insert on public.interactions for each row execute function public.notify_on_interaction();

create or replace function public.notify_on_premium_request()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_admins('premium_request', new."userId", new."userName",
    'طلب اشتراك في الباقة المميزة من ' || new."userName" || ' (' || new."planDuration" || ') عبر ' || new."paymentMethod");
  return new;
end;
$$;
create trigger premium_requests_notify after insert on public.premium_requests for each row execute function public.notify_on_premium_request();

create or replace function public.notify_on_story()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_admins('verify_request', new."submittedBy", null,
    'قصة نجاح جديدة مضافة للمراجعة: ' || new."husbandName" || ' و ' || new."wifeName");
  return new;
end;
$$;
create trigger success_stories_notify after insert on public.success_stories for each row execute function public.notify_on_story();

-- ====================================================================
-- 5) دوال RPC للعميل (عمليات لا تُنفَّذ بـ UPDATE مباشر)
-- ====================================================================

create or replace function public.accept_charter(p_version text default 'v1')
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  update public.profile_private
     set "agreedToCharter" = true, "charterAgreedAt" = now(), "charterVersion" = left(p_version, 20)
   where "id" = auth.uid();
end;
$$;

create or replace function public.mark_messages_read(p_sender uuid)
returns void language sql security definer set search_path = public as $$
  update public.messages set "isRead" = true
   where "senderId" = p_sender and "receiverId" = auth.uid() and not "isRead";
$$;

create or replace function public.mark_notification_read(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.notifications set "isRead" = true where "id" = p_id and "userId" = auth.uid();
$$;

create or replace function public.mark_all_notifications_read()
returns void language sql security definer set search_path = public as $$
  update public.notifications set "isRead" = true where "userId" = auth.uid() and not "isRead";
$$;

-- ====================================================================
-- 6) دوال الأدمن (كلها تتحقق من الصلاحية داخل السيرفر)
-- ====================================================================

create or replace function public.admin_approve_premium(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  r public.premium_requests;
  v_interval interval;
  v_base timestamptz;
begin
  perform public.assert_admin();

  select * into r from public.premium_requests where "id" = p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if r."status" <> 'pending' then raise exception 'request_already_processed'; end if;

  v_interval := case r."planDuration"
    when 'week'    then interval '7 days'
    when 'month'   then interval '1 month'
    when '3months' then interval '3 months'
    when '6months' then interval '6 months'
    when 'year'    then interval '1 year'
  end;

  -- التجديد قبل الانتهاء يمدّد من تاريخ الانتهاء الحالي
  select greatest(coalesce("premiumExpiryDate", now()), now()) into v_base
    from public.profiles where "id" = r."userId";

  update public.profiles
     set "isPremium" = true, "premiumExpiryDate" = v_base + v_interval
   where "id" = r."userId";

  update public.premium_requests set "status" = 'approved', "reviewedAt" = now() where "id" = p_request_id;

  insert into public.notifications ("userId","type","content")
  values (r."userId", 'system',
    'تهانينا! تمت الموافقة على اشتراكك في باقة التميز بنجاح. يمكنك الآن التحدث وإرسال رسائل غير محدودة ورفع صورتك الشخصية.');
end;
$$;

create or replace function public.admin_reject_premium(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.premium_requests;
begin
  perform public.assert_admin();

  select * into r from public.premium_requests where "id" = p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if r."status" <> 'pending' then raise exception 'request_already_processed'; end if;

  update public.premium_requests set "status" = 'rejected', "reviewedAt" = now() where "id" = p_request_id;

  insert into public.notifications ("userId","type","content")
  values (r."userId", 'system',
    'تم رفض طلب اشتراكك في الباقة المميزة. يرجى التأكد من عملية التحويل وإعادة تقديم الطلب.');
end;
$$;

create or replace function public.admin_verify_user(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_admin();
  update public.profiles set "isVerified" = true where "id" = p_user_id;
  if not found then raise exception 'user_not_found'; end if;
  insert into public.notifications ("userId","type","content")
  values (p_user_id, 'system',
    'لقد تم التحقق من ملفك الشخصي ومراجعته من الإدارة بنجاح. ملفك يحمل الآن الشارة الموثقة لمزيد من الجدية.');
end;
$$;

create or replace function public.admin_delete_user(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_admin();
  if p_user_id = auth.uid() then raise exception 'cannot_delete_self'; end if;
  if exists (select 1 from public.user_roles where "user_id" = p_user_id) then
    raise exception 'cannot_delete_admin';
  end if;
  -- الحذف من auth.users يحذف الملف وكل بياناته بالـ cascade
  delete from auth.users where "id" = p_user_id;
end;
$$;

create or replace function public.admin_approve_story(p_story_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_admin();
  update public.success_stories set "isApproved" = true where "id" = p_story_id;
  if not found then raise exception 'story_not_found'; end if;
end;
$$;

-- إنهاء الاشتراكات المنتهية (يُجدول عبر pg_cron — راجع README)
create or replace function public.expire_premium_subscriptions()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  update public.profiles set "isPremium" = false
   where "isPremium" and "premiumExpiryDate" is not null and "premiumExpiryDate" < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ====================================================================
-- 7) Row Level Security
-- ====================================================================
alter table public.user_roles       enable row level security;
alter table public.profiles         enable row level security;
alter table public.profile_private  enable row level security;
alter table public.interactions     enable row level security;
alter table public.messages         enable row level security;
alter table public.notifications    enable row level security;
alter table public.success_stories  enable row level security;
alter table public.premium_requests enable row level security;

-- user_roles: لا سياسات = لا وصول للعميل إطلاقاً (التحقق عبر is_admin())

-- profiles
create policy profiles_select on public.profiles for select to authenticated using (
  "id" = auth.uid()
  or public.is_admin()
  or (
    "name" <> ''
    and "gender" <> coalesce((select public.my_gender()), '')
    and not public.is_blocked_between(auth.uid(), "id")
  )
);
create policy profiles_update_own on public.profiles for update to authenticated
  using ("id" = auth.uid()) with check ("id" = auth.uid());

-- profile_private
create policy profile_private_select on public.profile_private for select to authenticated
  using ("id" = auth.uid() or public.is_admin());
create policy profile_private_update_own on public.profile_private for update to authenticated
  using ("id" = auth.uid()) with check ("id" = auth.uid());

-- interactions
create policy interactions_select on public.interactions for select to authenticated using (
  "fromUserId" = auth.uid()
  or ("toUserId" = auth.uid() and "type" = 'interest')
  or public.is_admin()
);
create policy interactions_insert on public.interactions for insert to authenticated with check (
  "fromUserId" = auth.uid()
  and public.can_interact_with("toUserId")
  and ("type" <> 'report' or char_length(btrim(coalesce("reason", ''))) > 0)
);
create policy interactions_delete_own_ignore on public.interactions for delete to authenticated
  using ("fromUserId" = auth.uid() and "type" = 'ignore');

-- messages (لا UPDATE ولا DELETE من العميل؛ القراءة عبر RPC)
create policy messages_select on public.messages for select to authenticated using (
  ("senderId" = auth.uid() or "receiverId" = auth.uid())
  and not public.is_blocked_between("senderId", "receiverId")
);
create policy messages_insert on public.messages for insert to authenticated with check (
  "senderId" = auth.uid() and public.can_interact_with("receiverId")
);

-- notifications (قراءة فقط؛ الإنشاء من السيرفر؛ التعليم كمقروء عبر RPC)
create policy notifications_select_own on public.notifications for select to authenticated
  using ("userId" = auth.uid());

-- success_stories
create policy stories_select on public.success_stories for select to authenticated
  using ("isApproved" or "submittedBy" = auth.uid() or public.is_admin());
create policy stories_insert on public.success_stories for insert to authenticated
  with check ("submittedBy" = auth.uid() and "isApproved" = false);

-- premium_requests (الموافقة/الرفض عبر دوال الأدمن فقط)
create policy premium_requests_select on public.premium_requests for select to authenticated
  using ("userId" = auth.uid() or public.is_admin());
create policy premium_requests_insert on public.premium_requests for insert to authenticated
  with check ("userId" = auth.uid() and "status" = 'pending');

-- ====================================================================
-- 8) الصلاحيات (دفاع إضافي فوق RLS)
-- ====================================================================
revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;

revoke all on public.user_roles from authenticated;
revoke insert, delete         on public.profiles         from authenticated;
revoke insert, delete         on public.profile_private  from authenticated;
revoke update                 on public.interactions     from authenticated;
revoke update, delete         on public.messages         from authenticated;
revoke insert, update, delete on public.notifications    from authenticated;
revoke update, delete         on public.success_stories  from authenticated;
revoke update, delete         on public.premium_requests from authenticated;

-- الدوال: لا شيء متاح للعامة، ونفتح فقط ما يحتاجه المستخدم المسجّل
revoke all on function
  public.is_admin(), public.assert_admin(), public.my_gender(),
  public.is_blocked_between(uuid, uuid), public.can_interact_with(uuid),
  public.notify_admins(text, uuid, text, text),
  public.handle_new_user(), public.protect_profile_columns(), public.protect_private_columns(),
  public.force_server_timestamp(), public.message_defaults(), public.premium_request_defaults(),
  public.notify_on_message(), public.notify_on_interaction(),
  public.notify_on_premium_request(), public.notify_on_story(),
  public.accept_charter(text), public.mark_messages_read(uuid),
  public.mark_notification_read(uuid), public.mark_all_notifications_read(),
  public.admin_approve_premium(uuid), public.admin_reject_premium(uuid),
  public.admin_verify_user(uuid), public.admin_delete_user(uuid), public.admin_approve_story(uuid),
  public.expire_premium_subscriptions()
from public, anon, authenticated;

grant execute on function
  public.is_admin(), public.my_gender(),
  public.is_blocked_between(uuid, uuid), public.can_interact_with(uuid),
  public.accept_charter(text), public.mark_messages_read(uuid),
  public.mark_notification_read(uuid), public.mark_all_notifications_read(),
  public.admin_approve_premium(uuid), public.admin_reject_premium(uuid),
  public.admin_verify_user(uuid), public.admin_delete_user(uuid), public.admin_approve_story(uuid)
to authenticated;

-- ====================================================================
-- 9) ترحيل مستخدمين Auth موجودين مسبقاً (إن وُجدوا)
-- ====================================================================
insert into public.profiles ("id") select "id" from auth.users on conflict do nothing;
insert into public.profile_private ("id","email")
  select "id", coalesce(lower("email"), '') from auth.users on conflict do nothing;

commit;

-- ====================================================================
-- بعد التنفيذ (يدوياً، مرة واحدة): تعيين أول أدمن بعد أن يسجّل الدخول بإيميله
--   insert into public.user_roles ("user_id","role")
--   select "id", 'admin' from auth.users where "email" = 'YOUR_ADMIN_EMAIL';
--
-- جدولة إنهاء الاشتراكات المنتهية (بعد تفعيل extension: pg_cron):
--   select cron.schedule('expire-premium', '0 * * * *', $$ select public.expire_premium_subscriptions(); $$);
-- ====================================================================

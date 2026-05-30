update public.profiles
   set role = 'admin'::public.user_role,
       plan = 'elite'::public.user_plan,
       status = 'active'::public.user_status,
       email_verified = true,
       updated_at = now()
 where lower(email) = lower('gabrielgonzag@gmail.com');

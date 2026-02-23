-- Add phone/email fields to profiles for account settings and phone-based login lookup
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS phone_normalized TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Keep phone lookups unique regardless of punctuation formatting.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_normalized_unique_idx
  ON public.profiles (phone_normalized)
  WHERE phone_normalized IS NOT NULL AND phone_normalized <> '';

-- Ensure new users get phone/email copied into profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _phone TEXT;
BEGIN
  _phone := NULLIF(COALESCE(NEW.raw_user_meta_data->>'phone', ''), '');

  INSERT INTO public.profiles (id, display_name, phone, phone_normalized, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    _phone,
    CASE WHEN _phone IS NULL THEN NULL ELSE regexp_replace(_phone, '\\D', '', 'g') END,
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

-- Sync profile email when auth.users email changes.
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email,
      updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_profile_email();

-- Login helper: map phone -> email without exposing profiles table to anonymous users.
CREATE OR REPLACE FUNCTION public.get_login_email_by_phone(_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _normalized TEXT;
  _email TEXT;
BEGIN
  _normalized := regexp_replace(COALESCE(_phone, ''), '\\D', '', 'g');

  SELECT p.email INTO _email
  FROM public.profiles p
  WHERE p.phone_normalized = _normalized
  LIMIT 1;

  RETURN _email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_login_email_by_phone(TEXT) TO anon, authenticated;

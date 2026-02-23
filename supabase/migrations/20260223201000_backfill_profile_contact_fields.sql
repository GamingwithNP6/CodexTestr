-- Backfill existing profiles so new phone/email login flows work for pre-existing users.

-- Copy auth email into profiles when missing.
UPDATE public.profiles p
SET email = u.email,
    updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');

-- Normalize existing phone values where normalization is unique.
WITH candidates AS (
  SELECT
    p.id,
    regexp_replace(COALESCE(p.phone, ''), '\\D', '', 'g') AS normalized
  FROM public.profiles p
  WHERE p.phone IS NOT NULL
    AND p.phone <> ''
),
unique_candidates AS (
  SELECT normalized
  FROM candidates
  WHERE normalized <> ''
  GROUP BY normalized
  HAVING COUNT(*) = 1
)
UPDATE public.profiles p
SET phone_normalized = c.normalized,
    updated_at = now()
FROM candidates c
JOIN unique_candidates u ON u.normalized = c.normalized
WHERE p.id = c.id
  AND (p.phone_normalized IS NULL OR p.phone_normalized = '');

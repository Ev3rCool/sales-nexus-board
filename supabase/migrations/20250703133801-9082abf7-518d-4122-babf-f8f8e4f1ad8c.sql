-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
);

-- Create storage policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add new columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update existing names to split into first_name and last_name
UPDATE public.users 
SET 
  first_name = CASE 
    WHEN name IS NOT NULL AND name != '' THEN 
      SPLIT_PART(name, ' ', 1)
    ELSE NULL 
  END,
  last_name = CASE 
    WHEN name IS NOT NULL AND name != '' AND ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1 THEN 
      SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE NULL 
  END
WHERE name IS NOT NULL AND name != '';

-- Create function to get user avatar URL
CREATE OR REPLACE FUNCTION public.get_avatar_url(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    CASE 
      WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN avatar_url
      ELSE NULL
    END
  FROM public.users 
  WHERE id = user_id;
$$;
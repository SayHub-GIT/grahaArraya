-- Add photo_url column to struktural table if it doesn't exist
ALTER TABLE struktural
ADD COLUMN IF NOT EXISTS foto_url text;

-- Update RLS policy to allow reading photos
ALTER TABLE struktural ENABLE ROW LEVEL SECURITY;

-- Allow public to view struktural data (including photos)
CREATE POLICY "Allow public to view struktural"
ON struktural FOR SELECT
TO public
USING (true);

-- Allow admin session to update struktural with photos
CREATE POLICY "Allow admin to update struktural with photos"
ON struktural FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Update struktural table to use fixed positions with posisi and nama_posisi columns
DROP TABLE IF EXISTS struktural CASCADE;

CREATE TABLE struktural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posisi INTEGER UNIQUE NOT NULL,
  nama_posisi VARCHAR(255) NOT NULL,
  nama_pejabat VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE struktural ENABLE ROW LEVEL SECURITY;

-- Policy for public SELECT
CREATE POLICY "allow_public_read" ON struktural
  FOR SELECT
  USING (true);

-- Policy for admin INSERT/UPDATE/DELETE (using anon key for now since admin auth is client-side)
CREATE POLICY "allow_admin_insert" ON struktural
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_admin_update" ON struktural
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_admin_delete" ON struktural
  FOR DELETE
  USING (true);

-- Insert the 5 fixed positions
INSERT INTO struktural (posisi, nama_posisi, nama_pejabat) VALUES
  (1, 'Ketua', ''),
  (2, 'Sekretaris', ''),
  (3, 'Bendahara', ''),
  (4, 'Bidang Kerohanian', ''),
  (5, 'Bidang Humasy', '');

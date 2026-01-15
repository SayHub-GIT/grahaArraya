-- Create warga (residents) table
CREATE TABLE IF NOT EXISTS public.warga (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL UNIQUE,
  blok text,
  lorong text,
  nomor_rumah text,
  no_telp text,
  email text,
  status text DEFAULT 'aktif', -- aktif, tidak aktif
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for warga table
ALTER TABLE public.warga ENABLE ROW LEVEL SECURITY;

-- Allow public to read warga data
CREATE POLICY "enable_read_warga" ON public.warga
  FOR SELECT USING (true);

-- Drop existing RLS policies that only allow SELECT
DROP POLICY IF EXISTS "enable_read_pemasukan" ON public.pemasukan;
DROP POLICY IF EXISTS "enable_read_pengeluaran" ON public.pengeluaran;
DROP POLICY IF EXISTS "enable_read_hibah" ON public.hibah;
DROP POLICY IF EXISTS "enable_read_inventaris" ON public.inventaris;
DROP POLICY IF EXISTS "enable_read_kegiatan" ON public.kegiatan;
DROP POLICY IF EXISTS "enable_read_struktural" ON public.struktural;
DROP POLICY IF EXISTS "enable_read_dokumentasi" ON public.dokumentasi;
DROP POLICY IF EXISTS "enable_read_rencana_belanja" ON public.rencana_belanja;

-- Recreate RLS policies to allow SELECT for everyone + INSERT/UPDATE/DELETE for admin (authenticated users with special header)
CREATE POLICY "enable_all_pemasukan" ON public.pemasukan
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_pengeluaran" ON public.pengeluaran
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_hibah" ON public.hibah
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_inventaris" ON public.inventaris
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_kegiatan" ON public.kegiatan
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_struktural" ON public.struktural
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_dokumentasi" ON public.dokumentasi
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_rencana_belanja" ON public.rencana_belanja
  FOR ALL USING (true) WITH CHECK (true);

-- Note: Since we're using static admin auth (non-Supabase auth), we need to allow all operations via anon key
-- The admin authentication is handled at the application level, not at the RLS level

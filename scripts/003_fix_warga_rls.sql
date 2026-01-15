-- Fix RLS policy for warga table to allow INSERT/UPDATE/DELETE
-- Drop the old read-only policy
DROP POLICY IF EXISTS "enable_read_warga" ON public.warga;

-- Create new policy that allows all operations (SELECT, INSERT, UPDATE, DELETE)
-- Since we're using static admin auth at application level, we allow all operations
CREATE POLICY "enable_all_warga" ON public.warga
  FOR ALL USING (true) WITH CHECK (true);

-- Ensure the table structure is correct with unique constraint on nama
ALTER TABLE public.warga DROP CONSTRAINT IF EXISTS warga_nama_key;
ALTER TABLE public.warga ADD CONSTRAINT warga_nama_key UNIQUE(nama);

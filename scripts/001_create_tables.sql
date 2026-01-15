-- Create pemasukan (income) table
CREATE TABLE IF NOT EXISTS public.pemasukan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal date NOT NULL,
  nama text NOT NULL,
  blok text,
  lorong text,
  nominal bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create pengeluaran (expense) table
CREATE TABLE IF NOT EXISTS public.pengeluaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal date NOT NULL,
  nama text NOT NULL,
  blok text,
  lorong text,
  kebutuhan text NOT NULL,
  qty integer,
  nominal bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create hibah (donations) table
CREATE TABLE IF NOT EXISTS public.hibah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal date NOT NULL,
  jenis text NOT NULL,
  nama text NOT NULL,
  nominal bigint NOT NULL,
  keterangan text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create inventaris (inventory) table
CREATE TABLE IF NOT EXISTS public.inventaris (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal_pembelian date NOT NULL,
  barang text NOT NULL,
  jumlah integer NOT NULL,
  kondisi text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create kegiatan (activities) table
CREATE TABLE IF NOT EXISTS public.kegiatan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis_kegiatan text NOT NULL,
  tanggal date NOT NULL,
  pukul time,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create struktural (organizational structure) table
CREATE TABLE IF NOT EXISTS public.struktural (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  jabatan text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create dokumentasi (documentation) table
CREATE TABLE IF NOT EXISTS public.dokumentasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create rencana_belanja (budget plan) table
CREATE TABLE IF NOT EXISTS public.rencana_belanja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies - allow SELECT for public reading
ALTER TABLE public.pemasukan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enable_read_pemasukan" ON public.pemasukan
  FOR SELECT USING (true);

ALTER TABLE public.pengeluaran ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enable_read_pengeluaran" ON public.pengeluaran
  FOR SELECT USING (true);

ALTER TABLE public.hibah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enable_read_hibah" ON public.hibah
  FOR SELECT USING (true);

ALTER TABLE public.inventaris ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enable_read_inventaris" ON public.inventaris
  FOR SELECT USING (true);

ALTER TABLE public.kegiatan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enable_read_kegiatan" ON public.kegiatan
  FOR SELECT USING (true);

ALTER TABLE public.struktural ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enable_read_struktural" ON public.struktural
  FOR SELECT USING (true);

ALTER TABLE public.dokumentasi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enable_read_dokumentasi" ON public.dokumentasi
  FOR SELECT USING (true);

ALTER TABLE public.rencana_belanja ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enable_read_rencana_belanja" ON public.rencana_belanja
  FOR SELECT USING (true);

-- Disable RLS for admin_logs since it's internal
ALTER TABLE public.admin_logs DISABLE ROW LEVEL SECURITY;

-- Create admin auth user
-- Note: This is a utility function to help understand the admin setup
-- In the actual application, auth will be handled via environment variables
-- The admin user credentials should be: admin@raya.com / adm1ngr4h4#

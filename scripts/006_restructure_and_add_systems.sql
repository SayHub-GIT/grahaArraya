-- Create jabatan (positions) table
CREATE TABLE IF NOT EXISTS public.jabatan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_jabatan text NOT NULL UNIQUE,
  posisi integer NOT NULL UNIQUE, -- 1=Ketua, 2=Sekretaris, 3=Bendahara, 4=Kerohanian, 5=Humasy
  urutan integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Modify struktural table to use jabatan references
DROP TABLE IF EXISTS public.struktural CASCADE;

CREATE TABLE IF NOT EXISTS public.struktural (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jabatan_id uuid NOT NULL REFERENCES public.jabatan(id) ON DELETE RESTRICT,
  nama text NOT NULL,
  foto text, -- URL to photo
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Rename kegiatan to rencana_pembelanjaan and restructure
DROP TABLE IF EXISTS public.kegiatan CASCADE;

CREATE TABLE IF NOT EXISTS public.rencana_pembelanjaan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  no integer NOT NULL,
  jenis text NOT NULL,
  tanggal date NOT NULL,
  nominal bigint NOT NULL,
  status_dibeli boolean DEFAULT false, -- true = sudah dibeli, false = belum dibeli
  tanggal_dibeli date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Rename inventaris to pembelajaran_anggaran
DROP TABLE IF EXISTS public.inventaris CASCADE;

CREATE TABLE IF NOT EXISTS public.pembelajaran_anggaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rencana_pembelanjaan_id uuid NOT NULL REFERENCES public.rencana_pembelanjaan(id) ON DELETE CASCADE,
  no integer NOT NULL,
  jumlah integer NOT NULL,
  kondisi text NOT NULL DEFAULT 'Baik', -- Baik, Rusak, Hilang
  tanggal_perubahan_kondisi timestamp DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Update pemasukan to support iuran system
ALTER TABLE public.pemasukan ADD COLUMN IF NOT EXISTS warga_id uuid REFERENCES public.warga(id) ON DELETE SET NULL;
ALTER TABLE public.pemasukan ADD COLUMN IF NOT EXISTS tipe_pemasukan text DEFAULT 'iuran'; -- iuran, lainnya
ALTER TABLE public.pemasukan ADD COLUMN IF NOT EXISTS tahun integer;
ALTER TABLE public.pemasukan ADD COLUMN IF NOT EXISTS bulan integer;

-- Create iuran_setting table for monthly iuran amount
CREATE TABLE IF NOT EXISTS public.iuran_setting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bulan integer NOT NULL,
  tahun integer NOT NULL,
  nominal_iuran bigint NOT NULL DEFAULT 50000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(bulan, tahun)
);

-- Enable RLS
ALTER TABLE public.jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.struktural ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rencana_pembelanjaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembelajaran_anggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iuran_setting ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "enable_all_jabatan" ON public.jabatan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "enable_all_struktural" ON public.struktural FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "enable_all_rencana_pembelanjaan" ON public.rencana_pembelanjaan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "enable_all_pembelajaran_anggaran" ON public.pembelajaran_anggaran FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "enable_all_iuran_setting" ON public.iuran_setting FOR ALL USING (true) WITH CHECK (true);

-- Insert default jabatan
INSERT INTO public.jabatan (nama_jabatan, posisi, urutan) VALUES
  ('Ketua', 1, 1),
  ('Sekretaris', 2, 2),
  ('Bendahara', 3, 3),
  ('Bidang Kerohanian', 4, 4),
  ('Bidang Humasy', 5, 5)
ON CONFLICT (nama_jabatan) DO NOTHING;

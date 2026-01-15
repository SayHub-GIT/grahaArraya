-- Add tahun and bulan columns to pemasukan table for monthly tracking
ALTER TABLE pemasukan ADD COLUMN IF NOT EXISTS tahun INTEGER DEFAULT EXTRACT(YEAR FROM NOW());
ALTER TABLE pemasukan ADD COLUMN IF NOT EXISTS bulan INTEGER DEFAULT EXTRACT(MONTH FROM NOW());

-- Update RLS policies for new columns
CREATE POLICY "pemasukan_admin_all" ON pemasukan
  FOR ALL USING (true)
  WITH CHECK (true);

-- Create iuran history table for tracking monthly payments per warga
CREATE TABLE IF NOT EXISTS iuran_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id UUID REFERENCES warga(id) ON DELETE CASCADE,
  tahun INTEGER NOT NULL,
  bulan INTEGER NOT NULL,
  nominal INTEGER DEFAULT 50000,
  status VARCHAR(20) DEFAULT 'belum_bayar', -- belum_bayar, sudah_bayar
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(warga_id, tahun, bulan)
);

-- Enable RLS on iuran_history
ALTER TABLE iuran_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "iuran_history_public_read" ON iuran_history
  FOR SELECT USING (true);

CREATE POLICY "iuran_history_admin_all" ON iuran_history
  FOR ALL USING (true)
  WITH CHECK (true);

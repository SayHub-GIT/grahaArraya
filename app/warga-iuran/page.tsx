"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface Warga {
  id: string
  nama: string
  blok: string | null
  lorong: string | null
  status: string
}

interface Iuran {
  id: string
  warga_id: string
  tahun: number
  bulan: number
  nominal: number
  created_at: string
}

export default function WargaIuranPage() {
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [iuranList, setIuranList] = useState<Iuran[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString().padStart(2, "0"))

  const supabase = createClient()
  const IURAN_DEFAULT = 10000

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [wargaRes, iuranRes] = await Promise.all([
        supabase.from("warga").select("*").eq("status", "aktif").order("nama"),
        supabase
          .from("iuran_history")
          .select("*")
          .eq("tahun", Number.parseInt(selectedYear))
          .eq("bulan", Number.parseInt(selectedMonth)),
      ])

      if (wargaRes.error) throw wargaRes.error
      if (iuranRes.error) throw iuranRes.error

      setWargaList(wargaRes.data || [])
      setIuranList(iuranRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear, selectedMonth])

  const iuranByWargaId: Record<string, Iuran> = {}
  iuranList.forEach((i) => {
    iuranByWargaId[i.warga_id] = i
  })

  const terbayar = iuranList.filter((i) => i.nominal >= IURAN_DEFAULT).length
  const belumBayar = wargaList.length - terbayar
  const totalTerkumpul = iuranList.reduce((sum, i) => sum + i.nominal, 0)
  const targetIuran = wargaList.length * IURAN_DEFAULT

  const bulanOptions = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ]

  const tahunOptions = Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - 2 + i).toString())

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">← Kembali</Link>
          </Button>
          <h1 className="text-3xl font-bold">Status Iuran Warga</h1>
          <p className="text-sm text-muted-foreground">
            Laporan status pembayaran iuran perumahan (Rp {IURAN_DEFAULT.toLocaleString("id-ID")}/bulan)
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tahun</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tahunOptions.map((tahun) => (
                  <SelectItem key={tahun} value={tahun}>
                    {tahun}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bulan</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bulanOptions.map((bulan) => (
                  <SelectItem key={bulan.value} value={bulan.value}>
                    {bulan.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Sudah Bayar</p>
              <p className="text-3xl font-bold text-green-600">{terbayar}</p>
              <p className="text-xs text-muted-foreground">dari {wargaList.length} warga</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Belum Bayar</p>
              <p className="text-3xl font-bold text-red-600">{belumBayar}</p>
              <p className="text-xs text-muted-foreground">dari {wargaList.length} warga</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Terkumpul</p>
              <p className="text-3xl font-bold">Rp {totalTerkumpul.toLocaleString("id-ID")}</p>
              <p className="text-xs text-muted-foreground">Target: Rp {targetIuran.toLocaleString("id-ID")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabel Warga */}
        <Card>
          <CardHeader>
            <CardTitle>
              Data Pembayaran Iuran {bulanOptions.find((b) => b.value === selectedMonth)?.label} {selectedYear}
            </CardTitle>
            <CardDescription>Daftar lengkap status pembayaran iuran setiap warga untuk bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">No</TableHead>
                    <TableHead>Nama Warga</TableHead>
                    <TableHead>Blok</TableHead>
                    <TableHead>Lorong</TableHead>
                    <TableHead className="text-right">Nominal Iuran</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : wargaList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Belum ada data warga aktif
                      </TableCell>
                    </TableRow>
                  ) : (
                    wargaList.map((warga, index) => {
                      const iuran = iuranByWargaId[warga.id]
                      const nominal = iuran?.nominal || 0
                      const isPaid = nominal >= IURAN_DEFAULT

                      return (
                        <TableRow key={warga.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{warga.nama}</TableCell>
                          <TableCell>{warga.blok || "-"}</TableCell>
                          <TableCell>{warga.lorong || "-"}</TableCell>
                          <TableCell className="text-right font-medium">Rp {nominal.toLocaleString("id-ID")}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {isPaid ? "✓ Sudah Bayar" : "✗ Belum Bayar"}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-12">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Graha Arraya Korwil 3 | Transparansi Keuangan Perumahan</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

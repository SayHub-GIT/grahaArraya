"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface IuranWarga {
  id: string
  warga_id: string
  tahun: number
  bulan: number
  nominal: number
  status: string
  warga: {
    nama: string
    blok: string | null
    lorong: string | null
  }
}

export default function PemasukanPage() {
  const [data, setData] = useState<IuranWarga[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const supabase = createClient()
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ]

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("iuran_history")
        .select(`
          id,
          warga_id,
          tahun,
          bulan,
          nominal,
          status,
          warga:warga_id(nama, blok, lorong)
        `)
        .eq("tahun", selectedYear)
        .eq("bulan", selectedMonth)
        .order("warga_id", { ascending: true })

      if (error) throw error

      setData(
        (data || []).map((item: any) => ({
          ...item,
          warga: item.warga?.[0] || { nama: "-", blok: null, lorong: null },
        }))
      )
    } catch (error) {
      console.error("Error fetching pemasukan:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear, selectedMonth])

  const totalNominal = data.reduce((sum, item) => sum + item.nominal, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">← Kembali</Link>
          </Button>
          <h1 className="text-3xl font-bold">Pemasukan KAS</h1>
          <p className="text-sm text-muted-foreground">Laporan pemasukan dari iuran warga</p>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Filter Data</CardTitle>
            <CardDescription>Pilih tahun dan bulan untuk melihat data pemasukan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Tahun</Label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Bulan</Label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                >
                  {monthNames.map((month, idx) => (
                    <option key={idx} value={idx + 1}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Data Pemasukan</CardTitle>
            <CardDescription>
              Bulan {monthNames[selectedMonth - 1]} {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-lg bg-primary/10 p-4">
              <p className="text-sm text-muted-foreground">Total Pemasukan</p>
              <p className="text-3xl font-bold">Rp {totalNominal.toLocaleString("id-ID")}</p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">No</TableHead>
                    <TableHead>Nama Warga</TableHead>
                    <TableHead className="w-20">Blok</TableHead>
                    <TableHead className="w-24">Lorong</TableHead>
                    <TableHead className="w-32 text-right">Nominal</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Belum ada data pemasukan untuk periode ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{item.warga.nama || "-"}</TableCell>
                        <TableCell>{item.warga.blok || "-"}</TableCell>
                        <TableCell>{item.warga.lorong || "-"}</TableCell>
                        <TableCell className="text-right font-medium">
                          Rp {item.nominal.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              item.status === "sudah_bayar" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status === "sudah_bayar" ? "Sudah" : "Belum"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

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

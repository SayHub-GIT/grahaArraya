"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Pemasukan {
  id: string
  tanggal: string
  nominal: number
}

interface Pengeluaran {
  id: string
  tanggal: string
  nominal: number
}

interface ChartData {
  month: string
  pemasukan: number
  pengeluaran: number
}

const MAX_Y_AXIS = 5000000

export default function SaldoPage() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [totalSaldo, setTotalSaldo] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  const supabase = createClient()
  const startYear = 2026
  const years = Array.from({ length: 10 }, (_, i) => startYear + i)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [iuranRes, pengeluaranRes, rencanaRes] = await Promise.all([
        supabase.from("iuran_history").select("tahun, bulan, nominal"),
        supabase.from("pengeluaran").select("tanggal, nominal"),
        supabase.from("rencana_pembelanjaan").select("nominal, status_dibeli").eq("status_dibeli", true),
      ])

      if (iuranRes.error) throw iuranRes.error
      if (pengeluaranRes.error) throw pengeluaranRes.error
      if (rencanaRes.error) throw rencanaRes.error

      const iuran = (iuranRes.data || []) as Array<{ tahun: number; bulan: number; nominal: number }>
      const pengeluaran = (pengeluaranRes.data || []) as Pengeluaran[]
      const rencana = (rencanaRes.data || []) as Array<{ nominal: number; status_dibeli: boolean }>

      const monthlyData: Record<string, { pemasukan: number; pengeluaran: number }> = {}

      for (let month = 1; month <= 12; month++) {
        const monthKey = month.toString().padStart(2, "0")
        monthlyData[monthKey] = { pemasukan: 0, pengeluaran: 0 }
      }

      iuran.forEach((item) => {
        if (item.tahun.toString() === selectedYear) {
          const month = item.bulan.toString().padStart(2, "0")
          monthlyData[month].pemasukan += item.nominal
        }
      })

      pengeluaran.forEach((item) => {
        const date = new Date(item.tanggal)
        if (date.getFullYear().toString() === selectedYear) {
          const month = (date.getMonth() + 1).toString().padStart(2, "0")
          monthlyData[month].pengeluaran += item.nominal
        }
      })

      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
      const chartData = months.map((month, index) => {
        const monthKey = (index + 1).toString().padStart(2, "0")
        return {
          month,
          pemasukan: monthlyData[monthKey].pemasukan,
          pengeluaran: monthlyData[monthKey].pengeluaran,
        }
      })

      setChartData(chartData)

      const selectedYearIuran = iuran.filter((item) => item.tahun.toString() === selectedYear)
      const selectedYearPengeluaran = pengeluaran.filter(
        (item) => new Date(item.tanggal).getFullYear().toString() === selectedYear,
      )
      const rencanaTotal = rencana.reduce((sum, item) => sum + item.nominal, 0)

      const totalPemasukan = selectedYearIuran.reduce((sum, item) => sum + item.nominal, 0)
      const totalPengeluaran = selectedYearPengeluaran.reduce((sum, item) => sum + item.nominal, 0)
      const totalRencana = rencanaTotal

      setTotalSaldo(totalPemasukan - totalPengeluaran - totalRencana)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">← Kembali</Link>
          </Button>
          <h1 className="text-3xl font-bold">Sisa Saldo KAS</h1>
          <p className="text-sm text-muted-foreground">Laporan saldo kas dan grafik pemasukan/pengeluaran</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Saldo Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Saldo KAS Saat Ini</CardTitle>
            <CardDescription>Total keseluruhan saldo kas perumahan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Saldo</p>
              <p className="text-5xl font-bold text-primary">Rp {totalSaldo.toLocaleString("id-ID")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Filter & Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Grafik Pemasukan & Pengeluaran</CardTitle>
                <CardDescription>Trend pemasukan dan pengeluaran per bulan</CardDescription>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Tahun</Label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                >
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-96 items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    domain={[0, MAX_Y_AXIS]}
                    ticks={[0, 100000, 200000, 500000, 1000000, 2000000, 5000000]}
                    tickFormatter={(value) => {
                      if (value === 0) return "0"
                      if (value === 100000) return "100rb"
                      if (value === 200000) return "200rb"
                      if (value === 500000) return "500rb"
                      if (value === 1000000) return "1jt"
                      if (value === 2000000) return "2jt"
                      if (value === 5000000) return "5jt"
                      return ""
                    }}
                  />
                  <Tooltip
                    formatter={(value) => `Rp ${Number(value).toLocaleString("id-ID")}`}
                    labelFormatter={(label) => `Bulan: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="pemasukan" stroke="#10b981" name="Pemasukan" strokeWidth={2} />
                  <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" name="Pengeluaran" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
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

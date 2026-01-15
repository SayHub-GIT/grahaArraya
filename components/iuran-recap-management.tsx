"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileDown } from "lucide-react"

interface Warga {
  id: string
  nama: string
  blok: string | null
  lorong: string | null
}

interface IuranData {
  [wargaId: string]: {
    warga: Warga
    iuran: Record<number, number> // bulan -> nominal
  }
}

export default function IuranRecapManagement() {
  const [data, setData] = useState<IuranData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedStartMonth, setSelectedStartMonth] = useState(1)
  const [selectedEndMonth, setSelectedEndMonth] = useState(6)

  const supabase = createClient()
  const IURAN_TARGET = 50000
  const PERIOD_MONTHS = selectedEndMonth - selectedStartMonth + 1

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [wargaRes, iuranRes] = await Promise.all([
        supabase.from("warga").select("*").eq("status", "aktif").order("nama"),
        supabase
          .from("iuran_history")
          .select("*")
          .eq("tahun", selectedYear)
          .gte("bulan", selectedStartMonth)
          .lte("bulan", selectedEndMonth),
      ])

      if (wargaRes.error) throw wargaRes.error
      if (iuranRes.error) throw iuranRes.error

      const wargaList = wargaRes.data || []
      const iuranList = iuranRes.data || []

      const recapData: IuranData = {}

      for (const warga of wargaList) {
        recapData[warga.id] = {
          warga,
          iuran: {},
        }

        for (let m = selectedStartMonth; m <= selectedEndMonth; m++) {
          recapData[warga.id].iuran[m] = 0
        }
      }

      iuranList.forEach((iuran) => {
        if (recapData[iuran.warga_id]) {
          recapData[iuran.warga_id].iuran[iuran.bulan] = iuran.nominal
        }
      })

      setData(recapData)
    } catch (error) {
      console.error("Error fetching recap data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear, selectedStartMonth, selectedEndMonth])

  const calculateTotals = () => {
    const totals: {
      nama: string
      total: number
      kurang: number
      persentase: number
    }[] = []

    Object.values(data).forEach((item) => {
      const total = Object.values(item.iuran).reduce((sum, val) => sum + val, 0)
      const target = IURAN_TARGET * PERIOD_MONTHS
      const kurang = Math.max(0, target - total)
      const persentase = target > 0 ? (total / target) * 100 : 0

      totals.push({
        nama: item.warga.nama,
        total,
        kurang,
        persentase: Math.round(persentase),
      })
    })

    return totals
  }

  const handleExportPDF = () => {
    const totals = calculateTotals()
    const startDate = `${monthNames[selectedStartMonth - 1]} ${selectedYear}`
    const endDate = `${monthNames[selectedEndMonth - 1]} ${selectedYear}`

    let content = `LAPORAN REKAP IURAN WARGA\n`
    content += `Periode: ${startDate} - ${endDate}\n`
    content += `Total Target: Rp ${(IURAN_TARGET * PERIOD_MONTHS).toLocaleString("id-ID")}\n\n`

    content += `No | Nama Warga | Total Terbayar | Kurang | Persentase\n`
    content += `-`.repeat(80) + `\n`

    totals.forEach((item, idx) => {
      content += `${idx + 1} | ${item.nama} | Rp ${item.total.toLocaleString("id-ID")} | Rp ${item.kurang.toLocaleString("id-ID")} | ${item.persentase}%\n`
    })

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
    element.setAttribute("download", `Laporan-Iuran-${startDate.replace(/ /g, "-")}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const totals = calculateTotals()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Laporan Rekap Iuran (Custom Periode)</CardTitle>
            <CardDescription>Rekapitulasi pembayaran iuran warga dengan periode custom</CardDescription>
          </div>
          <Button onClick={handleExportPDF} className="gap-2">
            <FileDown className="h-4 w-4" />
            Export Laporan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter */}
        <div className="flex gap-4 flex-wrap">
          <div className="space-y-2">
            <Label>Tahun</Label>
            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              min="2020"
              className="w-32"
            />
          </div>
          <div className="space-y-2">
            <Label>Mulai Bulan</Label>
            <select
              value={selectedStartMonth}
              onChange={(e) => setSelectedStartMonth(Number(e.target.value))}
              className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {monthNames.map((month, idx) => (
                <option key={idx} value={idx + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Sampai Bulan</Label>
            <select
              value={selectedEndMonth}
              onChange={(e) => setSelectedEndMonth(Number(e.target.value))}
              className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {monthNames.map((month, idx) => (
                <option key={idx} value={idx + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Periode</Label>
            <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted text-sm">
              {monthNames[selectedStartMonth - 1]} - {monthNames[selectedEndMonth - 1]} ({PERIOD_MONTHS} bulan)
            </div>
          </div>
        </div>

        {/* Tabel Rekap */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Warga</TableHead>
                {Array.from({ length: PERIOD_MONTHS }).map((_, idx) => {
                  const month = (selectedStartMonth + idx - 1) % 12
                  return (
                    <TableHead key={idx} className="text-right text-xs">
                      {monthNames[month].substring(0, 3)}
                    </TableHead>
                  )
                })}
                <TableHead className="text-right">Total Bayar</TableHead>
                <TableHead className="text-right">Kurang</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={PERIOD_MONTHS + 4} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : totals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={PERIOD_MONTHS + 4} className="text-center py-4 text-muted-foreground">
                    Belum ada data
                  </TableCell>
                </TableRow>
              ) : (
                totals.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    {Array.from({ length: PERIOD_MONTHS }).map((_, mIdx) => {
                      const month = selectedStartMonth + mIdx
                      const nominal =
                        data[Object.keys(data).find((id) => data[id].warga.nama === item.nama) || ""]?.iuran[month] || 0
                      return (
                        <TableCell key={mIdx} className="text-right text-sm">
                          {nominal > 0 ? `Rp ${nominal.toLocaleString("id-ID")}` : "-"}
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-right font-medium">Rp {item.total.toLocaleString("id-ID")}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${item.kurang > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      Rp {item.kurang.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">{item.persentase}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

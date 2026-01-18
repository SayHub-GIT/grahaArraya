"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Warga {
  id: string
  nama: string
  blok: string | null
  lorong: string | null
  status: string
}

interface IuranHistory {
  id: string
  warga_id: string
  tahun: number
  bulan: number
  nominal: number
  status: string
}

export default function WargaIuranManagement() {
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [iuranMap, setIuranMap] = useState<Record<string, IuranHistory>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWargaId, setEditingWargaId] = useState<string | null>(null)
  const [editNominal, setEditNominal] = useState("")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const supabase = createClient()
  const IURAN_DEFAULT = 10000

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

  const startYear = 2026
  const years = Array.from({ length: 10 }, (_, i) => startYear + i)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [wargaRes, iuranRes] = await Promise.all([
        supabase.from("warga").select("*").eq("status", "aktif").order("nama"),
        supabase.from("iuran_history").select("*").eq("tahun", selectedYear).eq("bulan", selectedMonth),
      ])

      if (wargaRes.error) throw wargaRes.error
      if (iuranRes.error) throw iuranRes.error

      const wargaData = wargaRes.data || []
      const iuranData = iuranRes.data || []

      // Create map of iuran by warga_id
      const iuranByWargaId: Record<string, IuranHistory> = {}
      iuranData.forEach((i) => {
        iuranByWargaId[i.warga_id] = i
      })

      setWargaList(wargaData)
      setIuranMap(iuranByWargaId)

      // Auto-insert warga into iuran_history if not exists
      const wargaToInsert = []
      for (const warga of wargaData) {
        if (!iuranByWargaId[warga.id]) {
          wargaToInsert.push({
            warga_id: warga.id,
            tahun: selectedYear,
            bulan: selectedMonth,
            nominal: 0,
            status: "belum_bayar",
          })
        }
      }

      if (wargaToInsert.length > 0) {
        await supabase.from("iuran_history").insert(wargaToInsert)
        setWargaList((prev) =>
          prev.map((w) => ({
            ...w,
          })),
        )
        wargaToInsert.forEach((i) => {
          iuranByWargaId[i.warga_id] = i as any
        })
        setIuranMap({ ...iuranByWargaId })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear, selectedMonth])

  const handleEditNominal = async () => {
    try {
      if (!editingWargaId) {
        console.error("[v0] editingWargaId is undefined")
        alert("Error: Warga tidak teridentifikasi")
        return
      }

      const existingIuran = iuranMap[editingWargaId]
      const newNominal = Number.parseInt(editNominal) || 0
      const isPaid = newNominal >= IURAN_DEFAULT

      if (existingIuran) {
        const { error } = await supabase
          .from("iuran_history")
          .update({
            nominal: newNominal,
            status: isPaid ? "sudah_bayar" : "belum_bayar",
          })
          .eq("id", existingIuran.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("iuran_history").insert({
          warga_id: editingWargaId,
          tahun: selectedYear,
          bulan: selectedMonth,
          nominal: newNominal,
          status: isPaid ? "sudah_bayar" : "belum_bayar",
        })

        if (error) throw error
      }

      setIsDialogOpen(false)
      setEditingWargaId(null)
      setEditNominal("")
      fetchData()
    } catch (error) {
      console.error("Error updating nominal:", error)
      alert("Gagal mengupdate nominal")
    }
  }

  const totalTerkumpul = Object.values(iuranMap).reduce((sum, i) => sum + i.nominal, 0)
  const targetIuran = wargaList.length * IURAN_DEFAULT
  const terbayar = Object.values(iuranMap).filter((i) => i.status === "sudah_bayar").length

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>
            Manajemen Iuran Warga - {monthNames[selectedMonth - 1]} {selectedYear}
          </CardTitle>
          <CardDescription>Kelola pembayaran iuran warga per bulan</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter Tahun Bulan */}
        <div className="flex gap-4">
          <div className="space-y-2">
            <Label>Tahun</Label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Bulan</Label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {monthNames.map((month, idx) => (
                <option key={idx} value={idx + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Terbayar</p>
              <p className="text-2xl font-bold">
                {terbayar}/{wargaList.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Terkumpul</p>
              <p className="text-2xl font-bold">Rp {totalTerkumpul.toLocaleString("id-ID")}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="text-2xl font-bold">Rp {targetIuran.toLocaleString("id-ID")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Warga</TableHead>
                <TableHead>Blok</TableHead>
                <TableHead>Lorong</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="w-20 text-center">Aksi</TableHead>
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
                wargaList.map((warga) => {
                  const iuran = iuranMap[warga.id]
                  const nominal = iuran?.nominal || 0
                  const isPaid = iuran?.status === "sudah_bayar"

                  return (
                    <TableRow key={warga.id}>
                      <TableCell className="font-medium">{warga.nama}</TableCell>
                      <TableCell>{warga.blok || "-"}</TableCell>
                      <TableCell>{warga.lorong || "-"}</TableCell>
                      <TableCell className="text-right">Rp {nominal.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {isPaid ? "Sudah Bayar" : "Belum Bayar"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog open={isDialogOpen && editingWargaId === warga.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingWargaId(warga.id)
                                setEditNominal(nominal.toString())
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-sm">
                            <DialogHeader>
                              <DialogTitle>Edit Iuran - {warga.nama}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="nominal">Nominal Iuran</Label>
                                <Input
                                  id="nominal"
                                  type="number"
                                  value={editNominal}
                                  onChange={(e) => setEditNominal(e.target.value)}
                                  min="0"
                                />
                              </div>
                              <Button
                                className="w-full"
                                onClick={handleEditNominal}
                              >
                                Simpan
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
  )
}

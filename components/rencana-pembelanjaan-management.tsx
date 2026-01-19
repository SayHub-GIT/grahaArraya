"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, Plus, Check, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface RencanaPembelanjaan {
  id: string
  jenis: string
  tanggal: string
  nominal: number
  status_dibeli: boolean
  tanggal_dibeli: string | null
}

export default function RencanaPembelanjaanManagement() {
  const [data, setData] = useState<RencanaPembelanjaan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    jenis: "",
    tanggal: format(new Date(), "yyyy-MM-dd"),
    nominal: "",
    status_dibeli: false,
  })

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("rencana_pembelanjaan")
        .select("*")
        .order("tanggal", { ascending: true })

      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const nominalNum = Number.parseInt(formData.nominal)
      if (isNaN(nominalNum) || nominalNum <= 0) {
        alert("Nominal harus berupa angka positif")
        return
      }

      if (!formData.jenis.trim()) {
        alert("Jenis barang harus diisi")
        return
      }

      if (!formData.tanggal) {
        alert("Tanggal harus diisi")
        return
      }

      console.log("[v0] Saving rencana:", { jenis: formData.jenis, tanggal: formData.tanggal, nominal: nominalNum })

      if (editingId) {
        const { error } = await supabase
          .from("rencana_pembelanjaan")
          .update({
            jenis: formData.jenis,
            tanggal: formData.tanggal,
            nominal: nominalNum,
            status_dibeli: formData.status_dibeli,
            tanggal_dibeli: formData.status_dibeli ? new Date().toISOString().split("T")[0] : null,
          })
          .eq("id", editingId)

        if (error) {
          console.error("[v0] Update error:", error)
          throw error
        }
      } else {
        // Get the next sequence number
        const { data: maxData } = await supabase
          .from("rencana_pembelanjaan")
          .select("no")
          .order("no", { ascending: false })
          .limit(1)

        const nextNo = ((maxData?.[0]?.no as number) || 0) + 1

        const { data: insertResult, error } = await supabase
          .from("rencana_pembelanjaan")
          .insert({
            jenis: formData.jenis,
            tanggal: formData.tanggal,
            nominal: nominalNum,
            no: nextNo,
            status_dibeli: false,
            tanggal_dibeli: null,
          })
          .select()

        if (error) {
          console.error("[v0] Insert error:", error)
          throw error
        }

        console.log("[v0] Insert successful:", insertResult)
      }

      setFormData({
        jenis: "",
        tanggal: format(new Date(), "yyyy-MM-dd"),
        nominal: "",
        status_dibeli: false,
      })
      setEditingId(null)
      setIsDialogOpen(false)
      fetchData()
    } catch (error: unknown) {
      console.error("[v0] Error saving data:", error)
      const errorMsg = error instanceof Error ? error.message : typeof error === "object" && error !== null ? JSON.stringify(error) || "Unknown error" : "Unknown error"
      alert(`Gagal menyimpan data: ${errorMsg}`)
    }
  }

  const handleEdit = (item: RencanaPembelanjaan) => {
    setFormData({
      jenis: item.jenis,
      tanggal: item.tanggal,
      nominal: item.nominal.toString(),
      status_dibeli: item.status_dibeli,
    })
    setEditingId(item.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const { error } = await supabase.from("rencana_pembelanjaan").delete().eq("id", id)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting data:", error)
        alert("Gagal menghapus data")
      }
    }
  }

  const toggleStatus = async (item: RencanaPembelanjaan) => {
    try {
      const newStatus = !item.status_dibeli
      const { error } = await supabase
        .from("rencana_pembelanjaan")
        .update({
          status_dibeli: newStatus,
          tanggal_dibeli: newStatus ? new Date().toISOString().split("T")[0] : null,
        })
        .eq("id", item.id)

      if (error) throw error

      if (newStatus) {
        // Create pembelajaran_anggaran entry
        await supabase.from("pembelajaran_anggaran").insert({
          rencana_pembelanjaan_id: item.id,
          jumlah: 1,
          kondisi: "Baik",
          tanggal_perubahan_kondisi: new Date().toISOString(),
        })

        // Auto create pengeluaran entry to deduct from saldo
        const pengeluaranName = `Pembelian Barang - ${item.jenis}`
        await supabase.from("pengeluaran").insert({
          tanggal: new Date().toISOString().split("T")[0],
          nama: pengeluaranName,
          blok: null,
          lorong: null,
          kebutuhan: item.jenis,
          qty: 1,
          nominal: item.nominal,
        })
      }

      fetchData()
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Gagal mengubah status")
    }
  }

  const totalNominal = data.reduce((sum, item) => sum + item.nominal, 0)
  const totalDibeli = data.filter((item) => item.status_dibeli).reduce((sum, item) => sum + item.nominal, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle>Rencana Inventaris Anggaran</CardTitle>
          <CardDescription>Kelola rencana pembelian dan tracking status</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  jenis: "",
                  tanggal: format(new Date(), "yyyy-MM-dd"),
                  nominal: "",
                  status_dibeli: false,
                })
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Rencana
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Rencana" : "Tambah Rencana Inventaris"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jenis">Jenis Barang</Label>
                <Input
                  id="jenis"
                  value={formData.jenis}
                  onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal Rencana</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nominal">Nominal</Label>
                <Input
                  id="nominal"
                  type="number"
                  value={formData.nominal}
                  onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Update" : "Simpan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Total Rencana</p>
            <p className="text-2xl font-bold">Rp {totalNominal.toLocaleString("id-ID")}</p>
          </div>
          <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
            <p className="text-sm text-muted-foreground">Total Terbeli</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rp {totalDibeli.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis Barang</TableHead>
                <TableHead className="w-32">Tanggal</TableHead>
                <TableHead className="w-32 text-right">Nominal</TableHead>
                <TableHead className="w-20 text-center">Status</TableHead>
                <TableHead className="w-24 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Belum ada rencana inventaris
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.jenis}</TableCell>
                    <TableCell>{format(new Date(item.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                    <TableCell className="text-right font-medium">Rp {item.nominal.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`inline-flex h-6 w-6 items-center justify-center rounded ${
                          item.status_dibeli ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        {item.status_dibeli ? (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
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

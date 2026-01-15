"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Pengeluaran {
  id: string
  tanggal: string
  nama: string
  blok: string | null
  lorong: string | null
  kebutuhan: string
  qty: number | null
  nominal: number
}

interface Warga {
  id: string
  nama: string
  blok: string | null
  lorong: string | null
}

export default function PengeluaranManagement() {
  const [data, setData] = useState<Pengeluaran[]>([])
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tanggal: format(new Date(), "yyyy-MM-dd"),
    nama: "",
    blok: "",
    lorong: "",
    kebutuhan: "",
    qty: "",
    nominal: "",
  })

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [pengeluaranRes, wargaRes] = await Promise.all([
        supabase.from("pengeluaran").select("*").order("tanggal", { ascending: false }),
        supabase.from("warga").select("id, nama, blok, lorong").eq("status", "aktif").order("nama"),
      ])

      if (pengeluaranRes.error) throw pengeluaranRes.error
      if (wargaRes.error) throw wargaRes.error

      setData(pengeluaranRes.data || [])
      setWargaList(wargaRes.data || [])
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
      const qtyNum = formData.qty ? Number.parseInt(formData.qty) : null

      if (isNaN(nominalNum) || nominalNum <= 0) {
        alert("Nominal harus berupa angka positif")
        return
      }

      if (editingId) {
        const { error } = await supabase
          .from("pengeluaran")
          .update({
            tanggal: formData.tanggal,
            nama: formData.nama,
            blok: formData.blok || null,
            lorong: formData.lorong || null,
            kebutuhan: formData.kebutuhan,
            qty: qtyNum,
            nominal: nominalNum,
          })
          .eq("id", editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("pengeluaran").insert({
          tanggal: formData.tanggal,
          nama: formData.nama,
          blok: formData.blok || null,
          lorong: formData.lorong || null,
          kebutuhan: formData.kebutuhan,
          qty: qtyNum,
          nominal: nominalNum,
        })

        if (error) throw error
      }

      setFormData({
        tanggal: format(new Date(), "yyyy-MM-dd"),
        nama: "",
        blok: "",
        lorong: "",
        kebutuhan: "",
        qty: "",
        nominal: "",
      })
      setEditingId(null)
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving pengeluaran:", error)
      alert("Gagal menyimpan data")
    }
  }

  const handleEdit = (item: Pengeluaran) => {
    setFormData({
      tanggal: item.tanggal,
      nama: item.nama,
      blok: item.blok || "",
      lorong: item.lorong || "",
      kebutuhan: item.kebutuhan,
      qty: item.qty?.toString() || "",
      nominal: item.nominal.toString(),
    })
    setEditingId(item.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const { error } = await supabase.from("pengeluaran").delete().eq("id", id)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting pengeluaran:", error)
        alert("Gagal menghapus data")
      }
    }
  }

  const handleWargaSelect = (wargaId: string) => {
    const selectedWarga = wargaList.find((w) => w.id === wargaId)
    if (selectedWarga) {
      setFormData({
        ...formData,
        nama: selectedWarga.nama,
        blok: selectedWarga.blok || "",
        lorong: selectedWarga.lorong || "",
      })
    }
  }

  const totalNominal = data.reduce((sum, item) => sum + item.nominal, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle>Pengeluaran</CardTitle>
          <CardDescription>Kelola data pengeluaran kas</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  tanggal: format(new Date(), "yyyy-MM-dd"),
                  nama: "",
                  blok: "",
                  lorong: "",
                  kebutuhan: "",
                  qty: "",
                  nominal: "",
                })
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Pengeluaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warga-select">Nama Warga</Label>
                <Select onValueChange={handleWargaSelect}>
                  <SelectTrigger id="warga-select">
                    <SelectValue placeholder="Pilih nama warga" />
                  </SelectTrigger>
                  <SelectContent>
                    {wargaList.map((warga) => (
                      <SelectItem key={warga.id} value={warga.id}>
                        {warga.nama} {warga.blok ? `(Blok ${warga.blok})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blok">Blok</Label>
                  <Input id="blok" value={formData.blok} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lorong">Lorong</Label>
                  <Input id="lorong" value={formData.lorong} disabled className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kebutuhan">Kebutuhan</Label>
                <Input
                  id="kebutuhan"
                  value={formData.kebutuhan}
                  onChange={(e) => setFormData({ ...formData, kebutuhan: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qty">Qty</Label>
                  <Input
                    id="qty"
                    type="number"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    min="0"
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
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Update" : "Simpan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-6 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
          <p className="text-2xl font-bold">Rp {totalNominal.toLocaleString("id-ID")}</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Tanggal</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kebutuhan</TableHead>
                <TableHead className="w-16">Qty</TableHead>
                <TableHead className="w-32 text-right">Nominal</TableHead>
                <TableHead className="w-24 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Belum ada data pengeluaran
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(new Date(item.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>{item.kebutuhan}</TableCell>
                    <TableCell>{item.qty || "-"}</TableCell>
                    <TableCell className="text-right font-medium">Rp {item.nominal.toLocaleString("id-ID")}</TableCell>
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

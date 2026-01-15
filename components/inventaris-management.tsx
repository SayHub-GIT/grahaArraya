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

interface Inventaris {
  id: string
  tanggal_pembelian: string
  barang: string
  jumlah: number
  kondisi: string | null
}

export default function InventarisManagement() {
  const [data, setData] = useState<Inventaris[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tanggal_pembelian: format(new Date(), "yyyy-MM-dd"),
    barang: "",
    jumlah: "",
    kondisi: "",
  })

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("inventaris")
        .select("*")
        .order("tanggal_pembelian", { ascending: false })

      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error("Error fetching inventaris:", error)
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
      const jumlahNum = Number.parseInt(formData.jumlah)
      if (isNaN(jumlahNum) || jumlahNum <= 0) {
        alert("Jumlah harus berupa angka positif")
        return
      }

      if (editingId) {
        const { error } = await supabase
          .from("inventaris")
          .update({
            tanggal_pembelian: formData.tanggal_pembelian,
            barang: formData.barang,
            jumlah: jumlahNum,
            kondisi: formData.kondisi || null,
          })
          .eq("id", editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("inventaris").insert({
          tanggal_pembelian: formData.tanggal_pembelian,
          barang: formData.barang,
          jumlah: jumlahNum,
          kondisi: formData.kondisi || null,
        })

        if (error) throw error
      }

      setFormData({
        tanggal_pembelian: format(new Date(), "yyyy-MM-dd"),
        barang: "",
        jumlah: "",
        kondisi: "",
      })
      setEditingId(null)
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving inventaris:", error)
      alert("Gagal menyimpan data")
    }
  }

  const handleEdit = (item: Inventaris) => {
    setFormData({
      tanggal_pembelian: item.tanggal_pembelian,
      barang: item.barang,
      jumlah: item.jumlah.toString(),
      kondisi: item.kondisi || "",
    })
    setEditingId(item.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const { error } = await supabase.from("inventaris").delete().eq("id", id)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting inventaris:", error)
        alert("Gagal menghapus data")
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle>Inventaris</CardTitle>
          <CardDescription>Kelola data inventaris aset</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  tanggal_pembelian: format(new Date(), "yyyy-MM-dd"),
                  barang: "",
                  jumlah: "",
                  kondisi: "",
                })
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Inventaris
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Inventaris" : "Tambah Inventaris"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal Pembelian</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal_pembelian}
                  onChange={(e) => setFormData({ ...formData, tanggal_pembelian: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barang">Barang</Label>
                <Input
                  id="barang"
                  value={formData.barang}
                  onChange={(e) => setFormData({ ...formData, barang: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlah">Jumlah</Label>
                <Input
                  id="jumlah"
                  type="number"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kondisi">Kondisi</Label>
                <Input
                  id="kondisi"
                  value={formData.kondisi}
                  onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
                  placeholder="Baik, Rusak, dll"
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Tanggal</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead className="w-20 text-right">Jumlah</TableHead>
                <TableHead>Kondisi</TableHead>
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
                    Belum ada data inventaris
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(new Date(item.tanggal_pembelian), "dd MMM yyyy", { locale: id })}</TableCell>
                    <TableCell>{item.barang}</TableCell>
                    <TableCell className="text-right">{item.jumlah}</TableCell>
                    <TableCell>{item.kondisi || "-"}</TableCell>
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

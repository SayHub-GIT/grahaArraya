"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface PembelajaranAnggaran {
  id: string
  no: number
  jumlah: number
  kondisi: string
  tanggal_perubahan_kondisi: string
  rencana_pembelanjaan: {
    jenis: string
  }
}

export default function PembelajaranAnggaran() {
  const [data, setData] = useState<PembelajaranAnggaran[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    jumlah: "",
    kondisi: "Baik",
  })

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("pembelajaran_anggaran")
        .select("*, rencana_pembelanjaan(jenis)")
        .order("no", { ascending: true })

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

  const handleEdit = (item: PembelajaranAnggaran) => {
    setFormData({
      jumlah: item.jumlah.toString(),
      kondisi: item.kondisi,
    })
    setEditingId(item.id)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from("pembelajaran_anggaran")
        .update({
          jumlah: Number.parseInt(formData.jumlah),
          kondisi: formData.kondisi,
          tanggal_perubahan_kondisi: new Date().toISOString(),
        })
        .eq("id", editingId || "")

      if (error) throw error

      setFormData({ jumlah: "", kondisi: "Baik" })
      setEditingId(null)
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error updating data:", error)
      alert("Gagal mengubah data")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const { error } = await supabase.from("pembelajaran_anggaran").delete().eq("id", id)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting data:", error)
        alert("Gagal menghapus data")
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventaris Kepemilikan</CardTitle>
        <CardDescription>
          Lihat daftar barang yang sudah dibeli (data otomatis dari Rencana)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">No</TableHead>
                <TableHead>Jenis Barang</TableHead>
                <TableHead className="w-20 text-center">Jumlah</TableHead>
                <TableHead className="w-32">Kondisi</TableHead>
                <TableHead className="w-40">Tanggal Perubahan</TableHead>
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
                    Belum ada barang yang dibeli
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.no}</TableCell>
                    <TableCell>{item.rencana_pembelanjaan.jenis}</TableCell>
                    <TableCell className="text-center">{item.jumlah}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          item.kondisi === "Baik"
                            ? "bg-green-100 text-green-800"
                            : item.kondisi === "Rusak"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.kondisi}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(item.tanggal_perubahan_kondisi), "dd MMM yyyy HH:mm", { locale: id })}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Dialog open={isDialogOpen && editingId === item.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Pembelajaan Anggaran</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="jumlah">Jumlah</Label>
                              <Input
                                id="jumlah"
                                type="number"
                                value={formData.jumlah}
                                onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                                required
                                min="1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="kondisi">Kondisi</Label>
                              <select
                                id="kondisi"
                                value={formData.kondisi}
                                onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="Baik">Baik</option>
                                <option value="Rusak">Rusak</option>
                                <option value="Hilang">Hilang</option>
                              </select>
                            </div>
                            <Button type="submit" className="w-full">
                              Update
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
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

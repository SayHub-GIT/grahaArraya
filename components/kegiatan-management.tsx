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

interface Kegiatan {
  id: string
  jenis_kegiatan: string
  tanggal: string
  pukul: string | null
}

export default function KegiatanManagement() {
  const [data, setData] = useState<Kegiatan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    jenis_kegiatan: "",
    tanggal: format(new Date(), "yyyy-MM-dd"),
    pukul: "",
  })

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("kegiatan").select("*").order("tanggal", { ascending: false })

      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error("Error fetching kegiatan:", error)
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
      if (editingId) {
        const { error } = await supabase
          .from("kegiatan")
          .update({
            jenis_kegiatan: formData.jenis_kegiatan,
            tanggal: formData.tanggal,
            pukul: formData.pukul || null,
          })
          .eq("id", editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("kegiatan").insert({
          jenis_kegiatan: formData.jenis_kegiatan,
          tanggal: formData.tanggal,
          pukul: formData.pukul || null,
        })

        if (error) throw error
      }

      setFormData({
        jenis_kegiatan: "",
        tanggal: format(new Date(), "yyyy-MM-dd"),
        pukul: "",
      })
      setEditingId(null)
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving kegiatan:", error)
      alert("Gagal menyimpan data")
    }
  }

  const handleEdit = (item: Kegiatan) => {
    setFormData({
      jenis_kegiatan: item.jenis_kegiatan,
      tanggal: item.tanggal,
      pukul: item.pukul || "",
    })
    setEditingId(item.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const { error } = await supabase.from("kegiatan").delete().eq("id", id)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting kegiatan:", error)
        alert("Gagal menghapus data")
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle>Kegiatan</CardTitle>
          <CardDescription>Kelola kegiatan warga</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  jenis_kegiatan: "",
                  tanggal: format(new Date(), "yyyy-MM-dd"),
                  pukul: "",
                })
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Kegiatan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Kegiatan" : "Tambah Kegiatan"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jenis">Jenis Kegiatan</Label>
                <Input
                  id="jenis"
                  value={formData.jenis_kegiatan}
                  onChange={(e) => setFormData({ ...formData, jenis_kegiatan: e.target.value })}
                  required
                />
              </div>
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
                <Label htmlFor="pukul">Pukul</Label>
                <Input
                  id="pukul"
                  type="time"
                  value={formData.pukul}
                  onChange={(e) => setFormData({ ...formData, pukul: e.target.value })}
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
                <TableHead className="w-40">Jenis Kegiatan</TableHead>
                <TableHead className="w-32">Tanggal</TableHead>
                <TableHead className="w-20">Pukul</TableHead>
                <TableHead className="w-24 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    Belum ada data kegiatan
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.jenis_kegiatan}</TableCell>
                    <TableCell>{format(new Date(item.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                    <TableCell>{item.pukul || "-"}</TableCell>
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

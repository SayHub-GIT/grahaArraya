"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Hibah {
  id: string
  tanggal: string
  jenis: string
  nama: string
  nominal: number
  keterangan: string | null
}

export default function HibahManagement() {
  const [data, setData] = useState<Hibah[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tanggal: format(new Date(), "yyyy-MM-dd"),
    jenis: "",
    nama: "",
    nominal: "",
    keterangan: "",
  })

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("hibah").select("*").order("tanggal", { ascending: false })

      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error("Error fetching hibah:", error)
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

      if (editingId) {
        const { error } = await supabase
          .from("hibah")
          .update({
            tanggal: formData.tanggal,
            jenis: formData.jenis,
            nama: formData.nama,
            nominal: nominalNum,
            keterangan: formData.keterangan || null,
          })
          .eq("id", editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("hibah").insert({
          tanggal: formData.tanggal,
          jenis: formData.jenis,
          nama: formData.nama,
          nominal: nominalNum,
          keterangan: formData.keterangan || null,
        })

        if (error) throw error
      }

      setFormData({
        tanggal: format(new Date(), "yyyy-MM-dd"),
        jenis: "",
        nama: "",
        nominal: "",
        keterangan: "",
      })
      setEditingId(null)
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving hibah:", error)
      alert("Gagal menyimpan data")
    }
  }

  const handleEdit = (item: Hibah) => {
    setFormData({
      tanggal: item.tanggal,
      jenis: item.jenis,
      nama: item.nama,
      nominal: item.nominal.toString(),
      keterangan: item.keterangan || "",
    })
    setEditingId(item.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const { error } = await supabase.from("hibah").delete().eq("id", id)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting hibah:", error)
        alert("Gagal menghapus data")
      }
    }
  }

  const totalNominal = data.reduce((sum, item) => sum + item.nominal, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle>Hibah / Shodaqoh</CardTitle>
          <CardDescription>Kelola data hibah dan shodaqoh</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  tanggal: format(new Date(), "yyyy-MM-dd"),
                  jenis: "",
                  nama: "",
                  nominal: "",
                  keterangan: "",
                })
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Hibah
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Hibah" : "Tambah Hibah"}</DialogTitle>
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
                <Label htmlFor="jenis">Jenis</Label>
                <Input
                  id="jenis"
                  value={formData.jenis}
                  onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
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
              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
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
        <div className="mb-6 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">Total Hibah</p>
          <p className="text-2xl font-bold">Rp {totalNominal.toLocaleString("id-ID")}</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Tanggal</TableHead>
                <TableHead className="w-32">Jenis</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="w-32 text-right">Nominal</TableHead>
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
                    Belum ada data hibah
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(new Date(item.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                    <TableCell>{item.jenis}</TableCell>
                    <TableCell>{item.nama}</TableCell>
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

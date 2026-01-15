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

interface Warga {
  id: string
  nama: string
  blok: string | null
  lorong: string | null
  nomor_rumah: string | null
  no_telp: string | null
  email: string | null
  status: string
}

export default function WargaManagement() {
  const [data, setData] = useState<Warga[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nama: "",
    blok: "",
    lorong: "",
    nomor_rumah: "",
    no_telp: "",
    email: "",
    status: "aktif",
  })

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("warga").select("*").order("nama", { ascending: true })

      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error("Error fetching warga:", error)
      alert("Gagal mengambil data warga")
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
      if (!formData.nama.trim()) {
        alert("Nama warga harus diisi")
        return
      }

      if (editingId) {
        const { error } = await supabase
          .from("warga")
          .update({
            nama: formData.nama,
            blok: formData.blok || null,
            lorong: formData.lorong || null,
            nomor_rumah: formData.nomor_rumah || null,
            no_telp: formData.no_telp || null,
            email: formData.email || null,
            status: formData.status,
          })
          .eq("id", editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("warga").insert({
          nama: formData.nama,
          blok: formData.blok || null,
          lorong: formData.lorong || null,
          nomor_rumah: formData.nomor_rumah || null,
          no_telp: formData.no_telp || null,
          email: formData.email || null,
          status: formData.status,
        })

        if (error) throw error
      }

      setFormData({
        nama: "",
        blok: "",
        lorong: "",
        nomor_rumah: "",
        no_telp: "",
        email: "",
        status: "aktif",
      })
      setEditingId(null)
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving warga:", error)
      alert("Gagal menyimpan data warga")
    }
  }

  const handleEdit = (item: Warga) => {
    setFormData({
      nama: item.nama,
      blok: item.blok || "",
      lorong: item.lorong || "",
      nomor_rumah: item.nomor_rumah || "",
      no_telp: item.no_telp || "",
      email: item.email || "",
      status: item.status,
    })
    setEditingId(item.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data warga ini?")) {
      try {
        const { error } = await supabase.from("warga").delete().eq("id", id)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting warga:", error)
        alert("Gagal menghapus data warga")
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle>Data Warga</CardTitle>
          <CardDescription>Kelola data daftar warga perumahan</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  nama: "",
                  blok: "",
                  lorong: "",
                  nomor_rumah: "",
                  no_telp: "",
                  email: "",
                  status: "aktif",
                })
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Warga
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Warga" : "Tambah Warga"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Warga *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blok">Blok</Label>
                  <Input
                    id="blok"
                    value={formData.blok}
                    onChange={(e) => setFormData({ ...formData, blok: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lorong">Lorong</Label>
                  <Input
                    id="lorong"
                    value={formData.lorong}
                    onChange={(e) => setFormData({ ...formData, lorong: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomor_rumah">Nomor Rumah</Label>
                <Input
                  id="nomor_rumah"
                  value={formData.nomor_rumah}
                  onChange={(e) => setFormData({ ...formData, nomor_rumah: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_telp">No. Telepon</Label>
                <Input
                  id="no_telp"
                  value={formData.no_telp}
                  onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="aktif">Aktif</option>
                  <option value="tidak_aktif">Tidak Aktif</option>
                </select>
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
                <TableHead>Nama</TableHead>
                <TableHead className="w-16">Blok</TableHead>
                <TableHead className="w-20">Lorong</TableHead>
                <TableHead className="w-24">No. Rumah</TableHead>
                <TableHead className="w-28">No. Telepon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    Belum ada data warga
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.blok || "-"}</TableCell>
                    <TableCell>{item.lorong || "-"}</TableCell>
                    <TableCell>{item.nomor_rumah || "-"}</TableCell>
                    <TableCell>{item.no_telp || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${item.status === "aktif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {item.status === "aktif" ? "Aktif" : "Tidak Aktif"}
                      </span>
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

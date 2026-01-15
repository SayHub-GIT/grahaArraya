"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Trash2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Jabatan {
  id: string
  nama_jabatan: string
  posisi: number
}

interface Struktural {
  id: string
  jabatan_id: string
  jabatan: Jabatan
  nama: string
  foto: string | null
}

export default function JabatanManagement() {
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
  const [strukturalData, setStrukturalData] = useState<Struktural[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    jabatan_id: "",
    nama: "",
    foto: "",
  })

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [jabatanRes, strukturalRes] = await Promise.all([
        supabase.from("jabatan").select("*").order("posisi"),
        supabase.from("struktural").select("*, jabatan(*)").order("jabatan.posisi"),
      ])

      if (jabatanRes.error) throw jabatanRes.error
      if (strukturalRes.error) throw strukturalRes.error

      setJabatanList(jabatanRes.data || [])
      setStrukturalData(strukturalRes.data || [])
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
      if (!formData.jabatan_id || !formData.nama.trim()) {
        alert("Semua field harus diisi")
        return
      }

      if (editingId) {
        const { error } = await supabase
          .from("struktural")
          .update({
            jabatan_id: formData.jabatan_id,
            nama: formData.nama,
            foto: formData.foto || null,
          })
          .eq("id", editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("struktural").insert({
          jabatan_id: formData.jabatan_id,
          nama: formData.nama,
          foto: formData.foto || null,
        })

        if (error) throw error
      }

      setFormData({ jabatan_id: "", nama: "", foto: "" })
      setEditingId(null)
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving data:", error)
      alert("Gagal menyimpan data")
    }
  }

  const handleEdit = (item: Struktural) => {
    setFormData({
      jabatan_id: item.jabatan_id,
      nama: item.nama,
      foto: item.foto || "",
    })
    setEditingId(item.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const { error } = await supabase.from("struktural").delete().eq("id", id)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting data:", error)
        alert("Gagal menghapus data")
      }
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Convert to base64 for demonstration
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result as string })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading photo:", error)
      alert("Gagal upload foto")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle>Manajemen Jabatan</CardTitle>
          <CardDescription>Kelola struktur organisasi dan pejabat</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({ jabatan_id: "", nama: "", foto: "" })
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Pejabat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Pejabat" : "Tambah Pejabat"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jabatan">Jabatan *</Label>
                <select
                  id="jabatan"
                  value={formData.jabatan_id}
                  onChange={(e) => setFormData({ ...formData, jabatan_id: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Pilih Jabatan</option>
                  {jabatanList.map((jabatan) => (
                    <option key={jabatan.id} value={jabatan.id}>
                      {jabatan.nama_jabatan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Pejabat *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foto">Foto</Label>
                <input id="foto" type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full" />
                {formData.foto && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={formData.foto || "/placeholder.svg"}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover border"
                    />
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Update" : "Simpan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {jabatanList.map((jabatan) => {
            const pejabat = strukturalData.find((s) => s.jabatan_id === jabatan.id)
            return (
              <div key={jabatan.id} className="rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">{jabatan.nama_jabatan}</p>
                {pejabat ? (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {pejabat.foto && (
                        <img
                          src={pejabat.foto || "/placeholder.svg"}
                          alt={pejabat.nama}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{pejabat.nama}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(pejabat)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(pejabat.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Belum ada pejabat</p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

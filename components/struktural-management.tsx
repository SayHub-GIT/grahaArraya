"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import { Plus, Trash2 } from "lucide-react"

interface Jabatan {
  id: string
  nama_jabatan: string
  posisi: number
  urutan: number
}

interface Struktural {
  id: string
  jabatan_id: string
  nama: string
  foto: string | null
}

export default function StrukturalManagement() {
  const supabase = createClient()

  const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
  const [strukturalMap, setStrukturalMap] = useState<Record<string, Struktural>>({})
  const [isLoading, setIsLoading] = useState(true)

  const [isJabatanDialogOpen, setIsJabatanDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingJabatanId, setEditingJabatanId] = useState<string | null>(null)

  const [jabatanFormData, setJabatanFormData] = useState({
    nama_jabatan: "",
    posisi: "",
  })

  const [formData, setFormData] = useState({
    nama: "",
    foto: "",
  })

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [jabatanRes, strukturalRes] = await Promise.all([
        supabase.from("jabatan").select("*").order("posisi", { ascending: true }),
        supabase.from("struktural").select("*"),
      ])

      if (jabatanRes.error) throw jabatanRes.error
      if (strukturalRes.error) throw strukturalRes.error

      setJabatanList(jabatanRes.data || [])

      const map: Record<string, Struktural> = {}
      strukturalRes.data?.forEach((s) => {
        map[s.jabatan_id] = s
      })
      setStrukturalMap(map)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* ================= FOTO UPLOAD (STORAGE) ================= */
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingJabatanId) return

    const ext = file.name.split(".").pop()
    const fileName = `${editingJabatanId}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from("pejabat")
      .upload(fileName, file, { upsert: true })

    if (error) {
      console.error("Upload error:", error)
      alert("Gagal upload foto")
      return
    }

    const { data } = supabase.storage.from("pejabat").getPublicUrl(fileName)

    setFormData((prev) => ({ ...prev, foto: data.publicUrl }))
    setPhotoPreview(data.publicUrl)
  }

  /* ================= JABATAN ================= */
  const handleAddJabatan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jabatanFormData.nama_jabatan || !jabatanFormData.posisi) return

    const posisiNum = Number(jabatanFormData.posisi)

    const { error } = await supabase.from("jabatan").insert({
      nama_jabatan: jabatanFormData.nama_jabatan,
      posisi: posisiNum,
      urutan: posisiNum,
    })

    if (error) {
      console.error(error)
      alert("Gagal menambah jabatan")
      return
    }

    setJabatanFormData({ nama_jabatan: "", posisi: "" })
    setIsJabatanDialogOpen(false)
    fetchData()
  }

  const handleDeleteJabatan = async (id: string) => {
    if (!confirm("Yakin hapus jabatan ini?")) return
    await supabase.from("jabatan").delete().eq("id", id)
    fetchData()
  }

  /* ================= PEJABAT ================= */
  const handleEditPejabat = (jabatanId: string, struktural?: Struktural) => {
    setEditingJabatanId(jabatanId)
    setFormData({
      nama: struktural?.nama || "",
      foto: struktural?.foto || "",
    })
    setPhotoPreview(struktural?.foto || null)
    setIsEditDialogOpen(true)
  }

  const handleSavePejabat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJabatanId) return

    const { error } = await supabase.from("struktural").upsert(
      {
        jabatan_id: editingJabatanId,
        nama: formData.nama,
        foto: formData.foto || null,
      },
      { onConflict: "jabatan_id" }
    )

    if (error) {
      console.error("Error saving pejabat:", error)
      alert("Gagal menyimpan pejabat")
      return
    }

    setIsEditDialogOpen(false)
    setEditingJabatanId(null)
    setFormData({ nama: "", foto: "" })
    setPhotoPreview(null)
    fetchData()
  }

  const handleDeletePejabat = async (id: string) => {
    if (!confirm("Yakin hapus pejabat ini?")) return
    await supabase.from("struktural").delete().eq("id", id)
    fetchData()
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      {/* JABATAN */}
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Manajemen Jabatan</CardTitle>
            <CardDescription>Tambah & hapus jabatan</CardDescription>
          </div>

          <Dialog open={isJabatanDialogOpen} onOpenChange={setIsJabatanDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Tambah Jabatan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Jabatan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddJabatan} className="space-y-4">
                <Input
                  placeholder="Nama Jabatan"
                  value={jabatanFormData.nama_jabatan}
                  onChange={(e) => setJabatanFormData({ ...jabatanFormData, nama_jabatan: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Posisi"
                  value={jabatanFormData.posisi}
                  onChange={(e) => setJabatanFormData({ ...jabatanFormData, posisi: e.target.value })}
                />
                <Button type="submit" className="w-full">Simpan</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-2">
          {jabatanList.map((j) => (
            <div key={j.id} className="flex justify-between items-center border p-3 rounded">
              <div>
                <p className="font-medium">{j.nama_jabatan}</p>
                <p className="text-xs text-muted-foreground">Posisi {j.posisi}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteJabatan(j.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* PEJABAT */}
      <Card>
        <CardHeader>
          <CardTitle>Struktur Organisasi</CardTitle>
          <CardDescription>Isi pejabat per jabatan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jabatanList.map((j) => {
            const s = strukturalMap[j.id]
            return (
              <Card key={j.id} className="p-4 bg-muted/50">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Posisi {j.posisi}</p>
                    <p className="font-semibold">{j.nama_jabatan}</p>
                    <p>{s?.nama || "Belum diisi"}</p>
                  </div>

                  {s?.foto && (
                    <Image src={s.foto} alt={s.nama} width={72} height={72} className="rounded object-cover" />
                  )}

                  <Dialog open={isEditDialogOpen && editingJabatanId === j.id} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => handleEditPejabat(j.id, s)}>
                        {s ? "Edit" : "Isi"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{j.nama_jabatan}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSavePejabat} className="space-y-4">
                        <Input
                          placeholder="Nama Pejabat"
                          value={formData.nama}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        />
                        <Input type="file" accept="image/*" onChange={handlePhotoChange} />
                        {photoPreview && (
                          <Image src={photoPreview} alt="Preview" width={100} height={100} className="rounded" />
                        )}
                        <div className="flex gap-2">
                          <Button type="submit">Simpan</Button>
                          {s && (
                            <Button type="button" variant="destructive" onClick={() => handleDeletePejabat(s.id)}>
                              Hapus
                            </Button>
                          )}
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

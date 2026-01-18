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
  posisi: number
  nama_posisi: string
  nama_pejabat: string
  foto_url: string | null
}

export default function StrukturalManagement() {
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
  const [strukturalList, setStrukturalList] = useState<Struktural[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isJabatanDialogOpen, setIsJabatanDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStrukturalId, setEditingStrukturalId] = useState<string | null>(null)
  const [jabatanFormData, setJabatanFormData] = useState({
    nama_jabatan: "",
    posisi: "",
  })
  const [formData, setFormData] = useState({
    nama_pejabat: "",
    foto_url: "",
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [editingPosisi, setEditingPosisi] = useState<number | null>(null)
  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [jabatanRes, strukturalRes] = await Promise.all([
        supabase.from("jabatan").select("*").order("posisi", { ascending: true }),
        supabase.from("struktural").select("*").order("posisi", { ascending: true }),
      ])

      if (jabatanRes.error) throw jabatanRes.error
      if (strukturalRes.error) throw strukturalRes.error

      setJabatanList(jabatanRes.data || [])
      setStrukturalList(strukturalRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData({ ...formData, foto_url: base64 })
        setPhotoPreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const getAvailablePositions = () => {
    const usedPositions = new Set(jabatanList.map((j) => j.posisi))
    const availablePositions = []

    // Generate positions starting from 1, up to max used position + 5
    const maxPosition = jabatanList.length > 0 ? Math.max(...jabatanList.map((j) => j.posisi)) : 0
    const limit = Math.max(maxPosition + 5, 10)

    for (let i = 1; i <= limit; i++) {
      if (!usedPositions.has(i)) {
        availablePositions.push(i)
      }
    }

    return availablePositions
  }

  const handleAddJabatan = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!jabatanFormData.nama_jabatan.trim() || !jabatanFormData.posisi) {
        alert("Semua field harus diisi")
        return
      }

      const posisiNum = Number.parseInt(jabatanFormData.posisi)

      // Check if position already exists
      const existingJabatan = jabatanList.find((j) => j.posisi === posisiNum)
      if (existingJabatan) {
        alert(`Posisi ${posisiNum} sudah digunakan oleh "${existingJabatan.nama_jabatan}"`)
        return
      }

      const { error } = await supabase.from("jabatan").insert({
        nama_jabatan: jabatanFormData.nama_jabatan,
        posisi: posisiNum,
        urutan: posisiNum,
      })

      if (error) throw error

      setJabatanFormData({
        nama_jabatan: "",
        posisi: "",
      })
      setIsJabatanDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving jabatan:", error)
      alert("Gagal menyimpan jabatan")
    }
  }

  const handleDeleteJabatan = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus jabatan ini?")) {
      try {
        const { error } = await supabase.from("jabatan").delete().eq("id", id)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting jabatan:", error)
        alert("Gagal menghapus jabatan")
      }
    }
  }

  const handleSavePejabat = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPosisi === null) return

      const existing = strukturalList.find((s) => s.posisi === editingPosisi)
      const jabatan = jabatanList.find((j) => j.posisi === editingPosisi)
      if (!jabatan) throw new Error("Jabatan not found")

      if (existing) {
        const { error } = await supabase
          .from("struktural")
          .update({
            nama_pejabat: formData.nama_pejabat,
            foto_url: formData.foto_url || null,
          })
          .eq("id", existing.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("struktural").insert({
          posisi: jabatan.posisi,
          nama_posisi: jabatan.nama_jabatan,
          nama_pejabat: formData.nama_pejabat,
          foto_url: formData.foto_url || null,
        })

        if (error) throw error
      }

      setFormData({ nama_pejabat: "", foto_url: "" })
      setPhotoPreview(null)
      setEditingPosisi(null)
      setIsEditDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving pejabat:", error)
      alert("Gagal menyimpan data pejabat")
    }
  }

  const handleEditPejabat = (posisi: number, jabatanNama: string, struktural: Struktural | undefined) => {
    setEditingPosisi(posisi)
    setFormData({
      nama_pejabat: struktural?.nama_pejabat || "",
      foto_url: struktural?.foto_url || "",
    })
    setPhotoPreview(struktural?.foto_url || null)
    setIsEditDialogOpen(true)
  }

  const handleDeletePejabat = async (strukturalId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pejabat ini?")) {
      try {
        const { error } = await supabase.from("struktural").delete().eq("id", strukturalId)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting pejabat:", error)
        alert("Gagal menghapus pejabat")
      }
    }
  }

  const availablePositions = getAvailablePositions()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle>Manajemen Jabatan</CardTitle>
            <CardDescription>Kelola daftar jabatan organisasi</CardDescription>
          </div>
          <Dialog open={isJabatanDialogOpen} onOpenChange={setIsJabatanDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Jabatan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Jabatan Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddJabatan} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_jabatan">Nama Jabatan</Label>
                  <Input
                    id="nama_jabatan"
                    value={jabatanFormData.nama_jabatan}
                    onChange={(e) => setJabatanFormData({ ...jabatanFormData, nama_jabatan: e.target.value })}
                    placeholder="Contoh: Ketua, Sekretaris, etc"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posisi">Posisi (Urutan Hirarki)</Label>
                  <select
                    id="posisi"
                    value={jabatanFormData.posisi}
                    onChange={(e) => setJabatanFormData({ ...jabatanFormData, posisi: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                    required
                  >
                    <option value="">Pilih Posisi</option>
                    {availablePositions.map((pos) => (
                      <option key={pos} value={pos.toString()}>
                        Posisi {pos}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  Simpan
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {jabatanList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada jabatan</p>
            ) : (
              jabatanList.map((jabatan) => (
                <div key={jabatan.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{jabatan.nama_jabatan}</p>
                    <p className="text-xs text-muted-foreground">Posisi {jabatan.posisi}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteJabatan(jabatan.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Struktur Organisasi</CardTitle>
          <CardDescription>Kelola pejabat untuk setiap jabatan dengan foto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jabatanList.map((jabatan) => {
              const struktural = strukturalList.find((s) => s.posisi === jabatan.posisi)

              return (
                <Card key={jabatan.id} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Posisi {jabatan.posisi}</p>
                        <p className="text-lg font-semibold">{jabatan.nama_jabatan}</p>
                        <p className="text-sm text-foreground mt-1">{struktural?.nama_pejabat || "Belum diisi"}</p>
                      </div>
                      {struktural?.foto_url && (
                        <Image
                          src={struktural.foto_url || "/placeholder.svg"}
                          alt={struktural.nama_pejabat}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <Dialog
                        open={isEditDialogOpen && editingPosisi === jabatan.posisi}
                        onOpenChange={setIsEditDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => handleEditPejabat(jabatan.posisi, jabatan.nama_jabatan, struktural)}
                            variant="outline"
                            size="sm"
                          >
                            {struktural ? "Edit" : "Isi"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit {jabatan.nama_jabatan}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSavePejabat} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="nama_pejabat">Nama Pejabat</Label>
                              <Input
                                id="nama_pejabat"
                                value={formData.nama_pejabat}
                                onChange={(e) => setFormData({ ...formData, nama_pejabat: e.target.value })}
                                placeholder={`Masukkan nama ${jabatan.nama_jabatan}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="photo">Foto Pejabat (URL Blob)</Label>
                              <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                              />
                              {photoPreview && (
                                <div className="mt-2">
                                  <Image
                                    src={photoPreview || "/placeholder.svg"}
                                    alt="Preview"
                                    width={100}
                                    height={100}
                                    className="w-24 h-24 rounded object-cover"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" className="flex-1">
                                Simpan
                              </Button>
                              {struktural && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => handleDeletePejabat(struktural.id)}
                                >
                                  Hapus
                                </Button>
                              )}
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

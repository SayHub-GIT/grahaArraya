"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Save, X, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface IuranSetting {
  id: string
  tahun: number
  bulan: number
  nominal_iuran: number
  updated_at: string
}

export default function IuranManagement() {
  const [data, setData] = useState<IuranSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    nominal_iuran: "",
  })

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("iuran_setting")
        .select("*")
        .order("tahun", { ascending: false })
        .order("bulan", { ascending: false })

      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error("Error fetching iuran data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddIuran = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const nominal = Number.parseInt(formData.nominal_iuran)
      if (isNaN(nominal) || nominal <= 0) {
        alert("Nominal harus berupa angka positif")
        return
      }

      // Check if already exists
      const existing = data.find((d) => d.tahun === formData.tahun && d.bulan === formData.bulan)

      if (existing) {
        const { error } = await supabase.from("iuran_setting").update({ nominal_iuran: nominal }).eq("id", existing.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("iuran_setting").insert({
          tahun: formData.tahun,
          bulan: formData.bulan,
          nominal_iuran: nominal,
        })

        if (error) throw error
      }

      setFormData({
        tahun: new Date().getFullYear(),
        bulan: new Date().getMonth() + 1,
        nominal_iuran: "",
      })
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving iuran setting:", error)
      alert("Gagal menyimpan setting iuran")
    }
  }

  const handleQuickEdit = async (id: string, newValue: string) => {
    try {
      const nominal = Number.parseInt(newValue)
      if (isNaN(nominal) || nominal <= 0) {
        alert("Nominal harus berupa angka positif")
        return
      }

      const { error } = await supabase.from("iuran_setting").update({ nominal_iuran: nominal }).eq("id", id)

      if (error) throw error
      setEditingId(null)
      fetchData()
    } catch (error) {
      console.error("Error updating iuran:", error)
      alert("Gagal mengupdate setting iuran")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus setting iuran ini?")) {
      try {
        const { error } = await supabase.from("iuran_setting").delete().eq("id", id)
        if (error) throw error
        fetchData()
      } catch (error) {
        console.error("Error deleting iuran:", error)
        alert("Gagal menghapus setting iuran")
      }
    }
  }

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle>Manajemen Iuran Warga</CardTitle>
          <CardDescription>Atur nominal iuran warga per bulan</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">Tambah Setting Iuran</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Setting Iuran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddIuran} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tahun">Tahun</Label>
                <Input
                  id="tahun"
                  type="number"
                  value={formData.tahun}
                  onChange={(e) => setFormData({ ...formData, tahun: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulan">Bulan</Label>
                <select
                  id="bulan"
                  value={formData.bulan}
                  onChange={(e) => setFormData({ ...formData, bulan: Number.parseInt(e.target.value) })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  {monthNames.map((month, idx) => (
                    <option key={idx} value={idx + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nominal">Nominal Iuran (Rp)</Label>
                <Input
                  id="nominal"
                  type="number"
                  value={formData.nominal_iuran}
                  onChange={(e) => setFormData({ ...formData, nominal_iuran: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <Button type="submit" className="w-full">
                Simpan
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
                <TableHead className="w-20">Tahun</TableHead>
                <TableHead className="w-32">Bulan</TableHead>
                <TableHead className="text-right">Nominal Iuran</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
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
                    Belum ada setting iuran
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.tahun}</TableCell>
                    <TableCell>{monthNames[item.bulan - 1]}</TableCell>
                    <TableCell className="text-right">
                      {editingId === item.id ? (
                        <div className="flex gap-2 justify-end">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-40"
                            min="0"
                          />
                          <Button size="sm" onClick={() => handleQuickEdit(item.id, editValue)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span>Rp {item.nominal_iuran.toLocaleString("id-ID")}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId !== item.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(item.id)
                              setEditValue(item.nominal_iuran.toString())
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
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

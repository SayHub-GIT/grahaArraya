"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
      console.error("Error fetching pembelajaran anggaran:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const kondisiColor = (kondisi: string) => {
    switch (kondisi) {
      case "Baik":
        return "bg-green-100 text-green-800"
      case "Rusak":
        return "bg-yellow-100 text-yellow-800"
      case "Hilang":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalBarang = data.reduce((sum, item) => sum + item.jumlah, 0)
  const baikCount = data.filter((d) => d.kondisi === "Baik").reduce((sum, item) => sum + item.jumlah, 0)
  const rusakCount = data.filter((d) => d.kondisi === "Rusak").reduce((sum, item) => sum + item.jumlah, 0)
  const hilangCount = data.filter((d) => d.kondisi === "Hilang").reduce((sum, item) => sum + item.jumlah, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">← Kembali</Link>
          </Button>
          <h1 className="text-3xl font-bold">Pembelajaaan Anggaran</h1>
          <p className="text-sm text-muted-foreground">Daftar aset dan kondisi barang yang dibeli</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Barang</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalBarang} item</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Kondisi Baik</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{baikCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Kondisi Rusak</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{rusakCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Hilang</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{hilangCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Pembelajaan Anggaran</CardTitle>
            <CardDescription>Daftar aset berdasarkan rencana pembelanjaan yang sudah dibeli</CardDescription>
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
                        Belum ada aset yang dibeli
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
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${kondisiColor(item.kondisi)}`}
                          >
                            {item.kondisi}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(item.tanggal_perubahan_kondisi), "dd MMM yyyy HH:mm", { locale: id })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-12">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Graha Arraya Korwil 3 | Transparansi Keuangan Perumahan</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

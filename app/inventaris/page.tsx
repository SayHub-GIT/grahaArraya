"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Inventaris {
  id: string
  tanggal_pembelian: string
  barang: string
  jumlah: number
  kondisi: string | null
}

export default function InventarisPage() {
  const [data, setData] = useState<Inventaris[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">← Kembali</Link>
          </Button>
          <h1 className="text-3xl font-bold">Inventaris</h1>
          <p className="text-sm text-muted-foreground">Laporan aset dan inventaris perumahan</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Data Inventaris</CardTitle>
            <CardDescription>Daftar aset dan inventaris perumahan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">No</TableHead>
                    <TableHead className="w-32">Tanggal Pembelian</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead className="w-20 text-right">Jumlah</TableHead>
                    <TableHead className="w-24">Kondisi</TableHead>
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
                    data.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{format(new Date(item.tanggal_pembelian), "dd MMM yyyy", { locale: id })}</TableCell>
                        <TableCell>{item.barang}</TableCell>
                        <TableCell className="text-right">{item.jumlah}</TableCell>
                        <TableCell>{item.kondisi || "-"}</TableCell>
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

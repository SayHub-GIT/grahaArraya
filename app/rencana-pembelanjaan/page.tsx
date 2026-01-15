"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Check, X } from "lucide-react"

interface RencanaPembelanjaan {
  id: string
  no: number
  jenis: string
  tanggal: string
  nominal: number
  status_dibeli: boolean
}

export default function RencanaPembelanjaanPage() {
  const [data, setData] = useState<RencanaPembelanjaan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("rencana_pembelanjaan")
        .select("*")
        .order("tanggal", { ascending: false })

      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error("Error fetching rencana pembelanjaan:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalNominal = data.reduce((sum, item) => sum + item.nominal, 0)
  const totalDibeli = data.filter((item) => item.status_dibeli).reduce((sum, item) => sum + item.nominal, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">← Kembali</Link>
          </Button>
          <h1 className="text-3xl font-bold">Rencana Pembelanjaan Anggaran</h1>
          <p className="text-sm text-muted-foreground">Daftar rencana pembelian dan progress status</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Total Rencana</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">Rp {totalNominal.toLocaleString("id-ID")}</p>
              <p className="text-sm text-muted-foreground mt-2">{data.length} item rencana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Total Terbeli</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">Rp {totalDibeli.toLocaleString("id-ID")}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {data.filter((d) => d.status_dibeli).length} dari {data.length} item
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Rencana Pembelanjaan</CardTitle>
            <CardDescription>Daftar lengkap rencana pembelian dan status pembelian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">No</TableHead>
                    <TableHead>Jenis Barang</TableHead>
                    <TableHead className="w-32">Tanggal</TableHead>
                    <TableHead className="w-32 text-right">Nominal</TableHead>
                    <TableHead className="w-20 text-center">Status</TableHead>
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
                        Belum ada rencana pembelanjaan
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.no}</TableCell>
                        <TableCell>{item.jenis}</TableCell>
                        <TableCell>{format(new Date(item.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                        <TableCell className="text-right font-medium">
                          Rp {item.nominal.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-center">
                          <div
                            className={`inline-flex h-6 w-6 items-center justify-center rounded ${
                              item.status_dibeli ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            {item.status_dibeli ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
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

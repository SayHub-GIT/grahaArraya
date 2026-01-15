"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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

export default function HibahPage() {
  const [data, setData] = useState<Hibah[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const totalNominal = data.reduce((sum, item) => sum + item.nominal, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">← Kembali</Link>
          </Button>
          <h1 className="text-3xl font-bold">Hibah & Shodaqoh</h1>
          <p className="text-sm text-muted-foreground">Laporan hibah dan shodaqoh perumahan</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Data Hibah & Shodaqoh</CardTitle>
            <CardDescription>Daftar hibah dan shodaqoh yang diterima perumahan</CardDescription>
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
                    <TableHead className="w-8">No</TableHead>
                    <TableHead className="w-32">Tanggal</TableHead>
                    <TableHead className="w-32">Jenis</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="w-32 text-right">Nominal</TableHead>
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
                    data.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{format(new Date(item.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                        <TableCell>{item.jenis}</TableCell>
                        <TableCell>{item.nama}</TableCell>
                        <TableCell className="text-right font-medium">
                          Rp {item.nominal.toLocaleString("id-ID")}
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

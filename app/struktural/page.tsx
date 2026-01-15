"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface Struktural {
  posisi: number
  nama_posisi: string
  nama_pejabat: string
  foto_url: string | null
}

export default function StrukturalPage() {
  const [data, setData] = useState<Struktural[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("struktural").select("*").order("posisi", { ascending: true })

      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error("Error fetching struktural:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getPejabat = (posisi: number) => {
    const item = data.find((d) => d.posisi === posisi)
    return item?.nama_pejabat || "-"
  }

  const getFotoUrl = (posisi: number) => {
    const item = data.find((d) => d.posisi === posisi)
    return item?.foto_url || null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">← Kembali</Link>
          </Button>
          <h1 className="text-3xl font-bold">Struktur Organisasi</h1>
          <p className="text-sm text-muted-foreground">Bagan struktur organisasi pengelola keuangan perumahan</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Level 1: Ketua */}
            <div className="flex justify-center">
              <Card className="w-full max-w-xs">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    {getFotoUrl(1) && (
                      <Image
                        src={getFotoUrl(1)! || "/placeholder.svg"}
                        alt={getPejabat(1)}
                        width={120}
                        height={120}
                        className="w-24 h-24 rounded-lg object-cover mx-auto"
                      />
                    )}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">KETUA</div>
                      <div className="text-lg font-bold text-primary">{getPejabat(1)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Connector 1 */}
            <div className="flex justify-center">
              <div className="h-8 border-l-2 border-b-2 border-muted-foreground w-1"></div>
            </div>

            {/* Level 2: Sekretaris & Bendahara */}
            <div className="flex justify-center gap-8 flex-wrap">
              <Card className="w-full max-w-xs">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    {getFotoUrl(2) && (
                      <Image
                        src={getFotoUrl(2)! || "/placeholder.svg"}
                        alt={getPejabat(2)}
                        width={120}
                        height={120}
                        className="w-24 h-24 rounded-lg object-cover mx-auto"
                      />
                    )}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">SEKRETARIS</div>
                      <div className="text-lg font-bold text-primary">{getPejabat(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="w-full max-w-xs">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    {getFotoUrl(3) && (
                      <Image
                        src={getFotoUrl(3)! || "/placeholder.svg"}
                        alt={getPejabat(3)}
                        width={120}
                        height={120}
                        className="w-24 h-24 rounded-lg object-cover mx-auto"
                      />
                    )}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">BENDAHARA</div>
                      <div className="text-lg font-bold text-primary">{getPejabat(3)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Connector 2 */}
            <div className="flex justify-center">
              <div className="h-8 border-l-2 border-b-2 border-muted-foreground w-1"></div>
            </div>

            {/* Level 3: Bidang Kerohanian & Bidang Humasy */}
            <div className="flex justify-center gap-8 flex-wrap">
              <Card className="w-full max-w-xs">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    {getFotoUrl(4) && (
                      <Image
                        src={getFotoUrl(4)! || "/placeholder.svg"}
                        alt={getPejabat(4)}
                        width={120}
                        height={120}
                        className="w-24 h-24 rounded-lg object-cover mx-auto"
                      />
                    )}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">BIDANG KEROHANIAN</div>
                      <div className="text-lg font-bold text-primary">{getPejabat(4)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="w-full max-w-xs">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    {getFotoUrl(5) && (
                      <Image
                        src={getFotoUrl(5)! || "/placeholder.svg"}
                        alt={getPejabat(5)}
                        width={120}
                        height={120}
                        className="w-24 h-24 rounded-lg object-cover mx-auto"
                      />
                    )}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">BIDANG HUMASY</div>
                      <div className="text-lg font-bold text-primary">{getPejabat(5)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Keterangan Struktur</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  <span className="font-semibold">Ketua</span> adalah pimpinan tertinggi dalam organisasi
                </p>
                <p>
                  <span className="font-semibold">Sekretaris & Bendahara</span> memiliki kedudukan setara dan
                  bertanggung jawab langsung kepada Ketua
                </p>
                <p>
                  <span className="font-semibold">Bidang Kerohanian & Bidang Humasy</span> bertanggung jawab kepada
                  Sekretaris dan Bendahara
                </p>
              </CardContent>
            </Card>
          </div>
        )}
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

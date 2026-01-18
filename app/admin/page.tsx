"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAdminSession, clearAdminSession } from "@/lib/admin-auth"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut } from "lucide-react"
import WargaManagement from "@/components/warga-management"
import WargaIuranManagement from "@/components/warga-iuran-management"
import IuranRecapManagement from "@/components/iuran-recap-management"
import PengeluaranManagement from "@/components/pengeluaran-management"
import HibahManagement from "@/components/hibah-management"
import RencanaPembelanjaan from "@/components/rencana-pembelanjaan-management"
import PembelajaranAnggaran from "@/components/pembelajaran-anggaran-management"
import StrukturalManagement from "@/components/struktural-management"

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const session = getAdminSession()
    if (!session) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    clearAdminSession()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Graha Arraya Korwil 3 - Transparansi Keuangan</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="warga" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8 gap-1">
            <TabsTrigger value="warga">Data Warga</TabsTrigger>
            <TabsTrigger value="iuran">Iuran Warga</TabsTrigger>
            <TabsTrigger value="recap">Laporan Rekap</TabsTrigger>
            <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
            <TabsTrigger value="hibah">Hibah</TabsTrigger>
            <TabsTrigger value="rencana">Rencana</TabsTrigger>
            <TabsTrigger value="pembelajaran">Pembelajaan</TabsTrigger>
            <TabsTrigger value="struktural">Struktural</TabsTrigger>
          </TabsList>

          <TabsContent value="warga" className="space-y-4">
            <WargaManagement />
          </TabsContent>

          <TabsContent value="iuran" className="space-y-4">
            <WargaIuranManagement />
          </TabsContent>

          <TabsContent value="recap" className="space-y-4">
            <IuranRecapManagement />
          </TabsContent>

          <TabsContent value="pengeluaran" className="space-y-4">
            <PengeluaranManagement />
          </TabsContent>

          <TabsContent value="hibah" className="space-y-4">
            <HibahManagement />
          </TabsContent>

          <TabsContent value="rencana" className="space-y-4">
            <RencanaPembelanjaan />
          </TabsContent>

          <TabsContent value="pembelajaran" className="space-y-4">
            <PembelajaranAnggaran />
          </TabsContent>

          <TabsContent value="struktural" className="space-y-4">
            <StrukturalManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

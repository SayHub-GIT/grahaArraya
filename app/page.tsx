import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, DollarSign, FileText, Users, Package, ClipboardList } from "lucide-react"

export const metadata = {
  title: "Graha Arraya Korwil 3 - Transparansi Keuangan",
  description: "Website transparansi keuangan perumahan Graha Arraya Korwil 3",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <img src="@/public/GA.png" alt="GA Logo" className="h-20 w-auto" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight">Graha Arraya Korwil 3</h1>
              <p className="mt-2 text-lg text-muted-foreground">Desa Cibadak, Kecamatan Ciampea, Bogor</p>
              <p className="mt-4 text-sm">
                <span className="font-semibold">Hubungi Kami:</span> +62 XXX-XXXX-XXXX | admin@graharaya.com
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-1 overflow-x-auto py-2 md:justify-start md:gap-2">
            <Button variant="ghost" asChild size="sm">
              <Link href="/">Beranda</Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link href="/pemasukan">Pemasukan</Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link href="/pengeluaran">Pengeluaran</Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link href="/saldo">Saldo KAS</Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link href="/hibah">Hibah</Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link href="/rencana-pembelanjaan">Rencana</Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link href="/pembelajaran-anggaran">Pembelajaran</Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link href="/struktural">Struktur</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-8">
            <h2 className="text-2xl font-bold">Selamat Datang</h2>
            <p className="mt-2 text-muted-foreground">
              Website ini menyediakan informasi transparansi keuangan perumahan Graha Arraya Korwil 3. Semua warga dapat
              melihat laporan keuangan secara real-time untuk memastikan pengelolaan dana yang transparan dan akuntabel.
            </p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Pemasukan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lihat riwayat pemasukan kas dari iuran warga</p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full bg-transparent">
                <Link href="/pemasukan">Lihat Detail</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lihat riwayat pengeluaran kas untuk keperluan perumahan</p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full bg-transparent">
                <Link href="/pengeluaran">Lihat Detail</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Saldo KAS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lihat grafik saldo kas dan trend pemasukan/pengeluaran</p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full bg-transparent">
                <Link href="/saldo">Lihat Detail</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Struktur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lihat struktur organisasi pengelola keuangan</p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full bg-transparent">
                <Link href="/struktural">Lihat Detail</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                Rencana Pembelanjaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lihat rencana pembelian dan progress status</p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full bg-transparent">
                <Link href="/rencana-pembelanjaan">Lihat Detail</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Pembelajaran Anggaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lihat daftar aset dan kondisi barang yang dibeli</p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full bg-transparent">
                <Link href="/pembelajaran-anggaran">Lihat Detail</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Info Section */}
        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tentang Transparansi Keuangan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Transparansi keuangan adalah komitmen kami untuk memastikan semua warga dapat melihat dan memahami
                bagaimana dana perumahan dikelola.
              </p>
              <p>
                Setiap pencatatan pemasukan dan pengeluaran dapat diakses oleh semua warga kapan saja melalui website
                ini.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prinsip Pengelolaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="font-bold">✓</span>
                  <span>Transparan - Semua data terbuka untuk publik</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">✓</span>
                  <span>Akuntabel - Setiap transaksi tercatat dengan detail</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">✓</span>
                  <span>Tepercaya - Laporan real-time tanpa manipulasi</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-12">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Graha Arraya Korwil 3 | Desa Cibadak, Kecamatan Ciampea, Bogor</p>
            <p className="mt-2">© 2026 - Transparansi Keuangan Perumahan</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

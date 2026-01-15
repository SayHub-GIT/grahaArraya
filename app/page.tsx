'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, DollarSign, FileText, Users, Package, ClipboardList, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const slides = [
  {
    id: 1,
    image: "/perum.jpeg",
    title: "View Dari Dalam",
  },
  {
    id: 2,
    image: "/perum1.jpeg",
    title: "View Dari Desa",
  },
  {
    id: 3,
    image: "/perum2.jpeg",
    title: "Marketing Gallery",
  },
]


  const navItems = [
    { label: "Beranda", href: "/" },
    { label: "Pemasukan", href: "/pemasukan" },
    { label: "Pengeluaran", href: "/pengeluaran" },
    { label: "Saldo KAS", href: "/saldo" },
    { label: "Hibah", href: "/hibah" },
    { label: "Rencana", href: "/rencana-pembelanjaan" },
    { label: "Pembelajaan", href: "/pembelajaan-anggaran" },
    { label: "Struktur", href: "/struktural" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-green-50'}`}>

      {/* HEADER */}
      <header className={`border-b transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'}`}>
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex justify-between items-start">
            <div className="flex gap-6">
             <div className="h-20 w-20 rounded-xl overflow-hidden flex items-center justify-center bg-white">
               <img
    src="/GA.png"
    alt="Logo Graha Arraya"
    className="h-full w-full object-contain"
  />
</div>

              <div>
                <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Graha Arraya Korwil 3
                </h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Desa Cibadak, Kecamatan Ciampea, Bogor
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-orange-100 text-orange-600'}`}
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </button>
          </div>
        </div>
      </header>

     
      <nav className={`sticky top-0 z-40 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex gap-2 py-2 overflow-x-auto">
            {navItems.map((item, idx) => (
              <Button
                key={idx}
                variant="ghost"
                asChild
                size="sm"
                className={isDarkMode
                  ? 'text-gray-300 hover:text-orange-400 hover:bg-gray-700'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section dengan Carousel */}
        <section className="mb-16">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {/* Carousel */}
            <div className="order-2 md:order-1">
              <div className="relative group">
                <div className={`relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  {/* Carousel Images with Animation */}
                  <div className="relative h-96 w-full overflow-hidden">
                    {slides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                          idx === currentSlide 
                            ? 'opacity-100 scale-100' 
                            : 'opacity-0 scale-95'
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-white text-2xl font-bold">{slide.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <button
                    onClick={prevSlide}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all duration-300 transform hover:scale-110 z-10 ${isDarkMode ? 'bg-gray-700/80 hover:bg-gray-600 text-white' : 'bg-white/80 hover:bg-white text-gray-800'}`}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all duration-300 transform hover:scale-110 z-10 ${isDarkMode ? 'bg-gray-700/80 hover:bg-gray-600 text-white' : 'bg-white/80 hover:bg-white text-gray-800'}`}
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-3 rounded-full transition-all duration-300 ${
                          idx === currentSlide 
                            ? 'w-8 bg-gradient-to-r from-orange-400 to-amber-500' 
                            : 'w-3 bg-white/60 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="order-1 md:order-2 space-y-6">
              <div className={`p-8 rounded-2xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200'}`}>
                <h2 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Selamat Datang di Graha Arraya Korwil 3
                </h2>
                <p className={`text-lg leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Website ini menyediakan informasi transparansi keuangan perumahan Graha Arraya Korwil 3. Semua warga dapat melihat laporan keuangan secara real-time untuk memastikan pengelolaan dana yang transparan dan akuntabel.
                </p>
                <div className={`mt-6 p-4 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-l-4 border-green-500' : 'bg-green-50 border-l-4 border-green-500'}`}>
                  <p className={`font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Tentang Perumahan Kami:</p>
                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Perumahan modern dengan tiga tipe hunian yang dirancang untuk memenuhi kebutuhan keluarga Indonesia, dilengkapi dengan fasilitas lengkap dan lokasi strategis di Desa Cibadak.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards - Modern Design */}
        <section className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Fitur Utama
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: DollarSign, title: "Pemasukan", desc: "Lihat riwayat pemasukan kas dari iuran warga", link: "/pemasukan", color: "from-orange-500 to-amber-500" },
              { icon: FileText, title: "Pengeluaran", desc: "Lihat riwayat pengeluaran kas untuk keperluan perumahan", link: "/pengeluaran", color: "from-amber-500 to-orange-500" },
              { icon: TrendingUp, title: "Saldo KAS", desc: "Lihat grafik saldo kas dan trend pemasukan/pengeluaran", link: "/saldo", color: "from-green-500 to-emerald-500" },
              { icon: Users, title: "Struktur", desc: "Lihat struktur organisasi pengelola keuangan", link: "/struktural", color: "from-emerald-500 to-green-500" },
              { icon: ClipboardList, title: "Rencana Pembelanjaan", desc: "Lihat rencana pembelian dan progress status", link: "/rencana-pembelanjaan", color: "from-orange-400 to-yellow-500" },
              { icon: Package, title: "Pembelajaan Anggaran", desc: "Lihat daftar aset dan kondisi barang yang dibeli", link: "/pembelajaan-anggaran", color: "from-yellow-500 to-orange-500" }
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Border Gradient */}
                  <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${isDarkMode ? 'border-gray-700 group-hover:border-orange-500' : 'border-gray-200 group-hover:border-orange-300'}`} />
                  
                  {/* Content */}
                  <div className="relative p-6 space-y-4">
                    <div className={`inline-block p-3 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-orange-100'}`}>
                      <Icon className={`w-6 h-6 transition-colors duration-300 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                    <h3 className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.desc}
                    </p>
                    <Button
                      asChild
                      className={`w-full transition-all duration-300 group/btn ${isDarkMode ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'}`}
                    >
                      <Link href={feature.link}>Lihat Detail</Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Info Section */}
        <section className="grid gap-8 md:grid-cols-2 mb-16">
          <div className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${isDarkMode ? 'border-gray-700 group-hover:border-green-500' : 'border-gray-200 group-hover:border-green-300'}`} />
            <div className="relative space-y-4">
              <div className={`inline-block p-3 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-green-100'}`}>
                <Users className={`w-6 h-6 transition-colors duration-300 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Tentang Transparansi Keuangan
              </h3>
              <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Transparansi keuangan adalah komitmen kami untuk memastikan semua warga dapat melihat dan memahami bagaimana dana perumahan dikelola.
              </p>
              <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Setiap pencatatan pemasukan dan pengeluaran dapat diakses oleh semua warga kapan saja melalui website ini.
              </p>
            </div>
          </div>

          <div className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${isDarkMode ? 'border-gray-700 group-hover:border-orange-500' : 'border-gray-200 group-hover:border-orange-300'}`} />
            <div className="relative space-y-4">
              <div className={`inline-block p-3 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-orange-100'}`}>
                <ClipboardList className={`w-6 h-6 transition-colors duration-300 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <h3 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Prinsip Pengelolaan
              </h3>
              <ul className="space-y-3">
                {[
                  { icon: "✓", title: "Transparan", desc: "Semua data terbuka untuk publik" },
                  { icon: "✓", title: "Akuntabel", desc: "Setiap transaksi tercatat dengan detail" },
                  { icon: "✓", title: "Tepercaya", desc: "Laporan real-time tanpa manipulasi" }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className={`font-bold transition-colors duration-300 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{item.icon}</span>
                    <div>
                      <p className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
                      <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100'}`}>
        <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className={`text-center space-y-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-semibold">Graha Arraya Korwil 3 | Desa Cibadak, Kecamatan Ciampea, Bogor</p>
            <p>© 2026 - Transparansi Keuangan Perumahan </p>
            <p className="text-sm">Membangun kepercayaan melalui transparansi finansial</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

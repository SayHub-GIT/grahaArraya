// BankCarouselButton.tsx (di dalam saldo.tsx aja bisa)
import Image from "next/image"
import { useState } from "react"

interface Bank {
  name: string
  number: string
}

const banks: Bank[] = [
  { name: "BCA", number: "5665142849" },
  { name: "BCA", number: "5665142849" },
  { name: "BCA", number: "5665142849" },
  { name: "BCA", number: "5665142849" },
]

export function BankCarouselButton() {
  const [index, setIndex] = useState(0)
  const length = banks.length

  const prev = () => setIndex((prev) => (prev === 0 ? length - 1 : prev - 1))
  const next = () => setIndex((prev) => (prev === length - 1 ? 0 : prev + 1))

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-60">
        <div className="flex justify-center">
          {/* Card */}
          <div className="bg-gray-50 p-4 rounded-xl shadow-lg flex flex-col items-center hover:scale-105 transition-transform">
            <Image
              src={`/${banks[index].name.toLowerCase()}.png`}
              alt={`Bank ${banks[index].name}`}
              width={120}
              height={60}
              className="object-contain"
            />
            <p className="mt-2 font-semibold">{banks[index].number}</p>
            <p className="text-xs text-muted-foreground mt-1">a.n Mohamad Irpani</p>
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
        >
          ›
        </button>
      </div>
    </div>
  )
}

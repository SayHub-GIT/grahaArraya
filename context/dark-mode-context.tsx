'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type DarkModeContextType = {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('isDarkMode')
    if (saved === 'true') setIsDarkMode(true)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      localStorage.setItem('isDarkMode', String(!prev))
      return !prev
    })
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext)
  if (!ctx) throw new Error('useDarkMode must be used inside DarkModeProvider')
  return ctx
}

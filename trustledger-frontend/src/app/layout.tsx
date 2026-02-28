'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TRUSTLEDGER - Real-Time Financial Intelligence',
  description: 'Financial Security & Banking Platform',
}

function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply saved accessibility settings
    const applySettings = () => {
      const largeText = localStorage.getItem('largeText') === 'true'
      const highContrast = localStorage.getItem('highContrast') === 'true'
      const voiceMode = localStorage.getItem('voiceMode') === 'true'
      const simpleMode = localStorage.getItem('simpleMode') === 'true'
      const darkMode = localStorage.getItem('darkMode') === 'true'
      
      if (largeText) {
        document.body.classList.add('large-text')
      }
      if (highContrast) {
        document.body.classList.add('high-contrast')
      }
      if (voiceMode) {
        document.body.classList.add('voice-mode')
      }
      if (simpleMode) {
        document.body.classList.add('simple-mode')
      }
      if (darkMode || highContrast) {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      }
    }
    
    applySettings()
    
    // Listen for storage changes
    const handleStorageChange = () => {
      applySettings()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  return children
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
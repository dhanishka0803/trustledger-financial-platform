'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const publicRoutes = ['/', '/login', '/signup']
    
    if (publicRoutes.includes(pathname)) {
      setIsChecking(false)
      return
    }

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    
    if (!isLoggedIn) {
      router.replace('/login')
    } else {
      setIsChecking(false)
    }
  }, [pathname, router])

  if (isChecking) {
    return null
  }

  return <>{children}</>
}

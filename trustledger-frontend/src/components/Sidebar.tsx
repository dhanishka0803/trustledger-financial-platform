'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  Shield, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Settings, 
  Users, 
  BarChart3,
  Leaf,
  Bell,
  CreditCard,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Fraud Detection', href: '/fraud', icon: Shield },
  { name: 'Market Analytics', href: '/market', icon: TrendingUp },
  { name: 'Compliance', href: '/compliance', icon: FileText },
  { name: 'AI Assistant', href: '/assistant', icon: MessageSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Green Finance', href: '/green', icon: Leaf },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Close sidebar on mobile when clicking a link
    if (isMobile && onMobileClose) {
      e.preventDefault()
      onMobileClose()
      // Small delay to allow animation to complete
      setTimeout(() => {
        router.push(href)
      }, 150)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-fade-in"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "bg-gradient-to-b from-teal-900 to-slate-900 shadow-lg transition-all duration-300 z-50",
        isMobile ? (
          cn(
            "fixed inset-y-0 left-0 transform md:relative md:translate-x-0",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )
        ) : (
          collapsed ? "w-16" : "w-64"
        ),
        isMobile ? "w-64" : ""
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-teal-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-lg animate-scale-in">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {(!collapsed || isMobile) && (
              <span className="text-xl font-bold text-white tracking-tight animate-fade-in">
                TRUSTLEDGER
              </span>
            )}
          </div>
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg text-white hover:bg-teal-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105",
                    isActive
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-teal-100 hover:bg-teal-800 hover:text-white"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <item.icon className={cn("flex-shrink-0", (collapsed && !isMobile) ? "w-5 h-5" : "w-5 h-5 mr-3")} />
                  {(!collapsed || isMobile) && item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Collapse Toggle - Desktop Only */}
        {!isMobile && (
          <div className="absolute bottom-4 left-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg bg-teal-800 hover:bg-teal-700 transition-colors hover:scale-110"
            >
              <BarChart3 className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
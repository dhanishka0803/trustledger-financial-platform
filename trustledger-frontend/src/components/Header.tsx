'use client'

import { useState, useEffect } from 'react'
import { Bell, Moon, Sun, User, Settings, LogOut, Shield, CreditCard, FileText, HelpCircle, Palette, Menu, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

import { logout } from '@/utils/navigation'

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [voiceMode, setVoiceMode] = useState(false)

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'User'
    const email = localStorage.getItem('userEmail') || 'user@trustledger.com'
    setUserName(name)
    setUserEmail(email)
    
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    }
    
    const savedVoiceMode = localStorage.getItem('voiceMode') === 'true'
    setVoiceMode(savedVoiceMode)
    
    // Calculate notification count
    const userId = localStorage.getItem('userId') || 'user'
    const transactions = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]')
    const highRiskTransactions = transactions.filter((t: any) => t.fraud_score > 70)
    const isAccountFrozen = localStorage.getItem('isAccountFrozen') === 'true'
    
    let count = 0
    if (highRiskTransactions.length > 0) count++
    if (isAccountFrozen) count++
    
    setNotifications(count)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', String(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }

  const toggleVoiceMode = () => {
    const newVoiceMode = !voiceMode
    setVoiceMode(newVoiceMode)
    localStorage.setItem('voiceMode', String(newVoiceMode))
    
    if (newVoiceMode && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Voice mode enabled. You can now navigate using voice commands.')
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) return
    logout()
  }

  const getNotifications = () => {
    if (typeof window === 'undefined') return []
    
    const isAccountFrozen = localStorage.getItem('isAccountFrozen') === 'true'
    const userId = localStorage.getItem('userId') || 'user'
    const transactions = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]')
    const highRiskTransactions = transactions.filter((t: any) => t.fraud_score > 70)
    
    const notifications = []
    
    if (highRiskTransactions.length > 0) {
      notifications.push(
        <DropdownMenuItem key="fraud" className="flex flex-col items-start p-3">
          <div className="flex items-start space-x-2 w-full">
            <Shield className="w-4 h-4 text-red-500 mt-1" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Fraud Alert</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{highRiskTransactions.length} suspicious transaction(s) detected</p>
              <p className="text-xs text-gray-400 mt-1">Just now</p>
            </div>
          </div>
        </DropdownMenuItem>
      )
    }
    
    if (isAccountFrozen) {
      notifications.push(
        <DropdownMenuItem key="frozen" className="flex flex-col items-start p-3">
          <div className="flex items-start space-x-2 w-full">
            <Shield className="w-4 h-4 text-orange-500 mt-1" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Account Frozen</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Your account is currently frozen for security</p>
              <p className="text-xs text-gray-400 mt-1">Active</p>
            </div>
          </div>
        </DropdownMenuItem>
      )
    }
    
    if (notifications.length === 0) {
      notifications.push(
        <DropdownMenuItem key="clear" className="flex flex-col items-start p-3">
          <div className="flex items-start space-x-2 w-full">
            <Shield className="w-4 h-4 text-green-500 mt-1" />
            <div className="flex-1">
              <p className="font-semibold text-sm">All Clear</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">No security issues detected</p>
            </div>
          </div>
        </DropdownMenuItem>
      )
    }
    
    return notifications
  }

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-6 py-4">
        {/* App Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="p-2 md:hidden"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">TRUSTLEDGER</span>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Voice Mode Toggle - Accessible for disabled users */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleVoiceMode}
            className={`p-2 ${voiceMode ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300' : ''}`}
            title={voiceMode ? 'Disable Voice Mode' : 'Enable Voice Mode for Accessibility'}
            aria-pressed={voiceMode}
          >
            {voiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="p-2"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative p-2" title="Notifications">
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {getNotifications()}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-teal-600 font-semibold">
                View All Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div>
                  <p className="font-semibold">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
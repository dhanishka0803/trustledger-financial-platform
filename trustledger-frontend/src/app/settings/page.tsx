'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, User, Bell, Palette, Lock, HelpCircle, Loader2, Moon, Sun, Volume2, Type, Eye, Smartphone } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import * as Switch from '@radix-ui/react-switch'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

const ToggleSwitch = ({ checked, onChange, disabled = false }: SwitchProps) => (
  <Switch.Root
    checked={checked}
    onCheckedChange={onChange}
    disabled={disabled}
    className={`w-14 h-7 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
      checked ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <Switch.Thumb
      className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
        checked ? 'translate-x-8' : 'translate-x-1'
      }`}
    />
  </Switch.Root>
)

export default function Settings() {
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [simpleMode, setSimpleMode] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [fraudAlerts, setFraudAlerts] = useState(true)
  const [transactionAlerts, setTransactionAlerts] = useState(true)
  const [marketUpdates, setMarketUpdates] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Load settings on mount
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setLargeText(localStorage.getItem('largeText') === 'true')
      setHighContrast(localStorage.getItem('highContrast') === 'true')
      setVoiceMode(localStorage.getItem('voiceMode') === 'true')
      setSimpleMode(localStorage.getItem('simpleMode') === 'true')
      setDarkMode(localStorage.getItem('darkMode') === 'true' || document.documentElement.classList.contains('dark'))
      setFraudAlerts(localStorage.getItem('fraudAlerts') !== 'false')
      setTransactionAlerts(localStorage.getItem('transactionAlerts') !== 'false')
      setMarketUpdates(localStorage.getItem('marketUpdates') !== 'false')
      setEmailNotifications(localStorage.getItem('emailNotifications') !== 'false')
    }
  }, [])

  const showSavedMessage = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleLargeText = (enabled: boolean) => {
    setLargeText(enabled)
    if (typeof window !== 'undefined') {
      if (enabled) {
        document.body.classList.add('large-text')
      } else {
        document.body.classList.remove('large-text')
      }
      localStorage.setItem('largeText', String(enabled))
    }
    showSavedMessage()
  }

  const toggleHighContrast = (enabled: boolean) => {
    setHighContrast(enabled)
    if (typeof window !== 'undefined') {
      if (enabled) {
        document.body.classList.add('high-contrast')
        document.documentElement.classList.add('dark')
        setDarkMode(true)
      } else {
        document.body.classList.remove('high-contrast')
        if (!darkMode) {
          document.documentElement.classList.remove('dark')
        }
      }
      localStorage.setItem('highContrast', String(enabled))
    }
    showSavedMessage()
  }

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled)
    if (typeof window !== 'undefined') {
      if (enabled) {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else {
        if (!highContrast) {
          document.documentElement.classList.remove('dark')
          document.body.classList.remove('dark')
        }
      }
      localStorage.setItem('darkMode', String(enabled))
    }
    showSavedMessage()
  }

  const toggleVoiceMode = (enabled: boolean) => {
    setVoiceMode(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem('voiceMode', String(enabled))
      if (enabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Voice mode enabled. You can now use voice commands and hear responses.')
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }
    }
    showSavedMessage()
  }

  const toggleSimpleMode = (enabled: boolean) => {
    setSimpleMode(enabled)
    if (typeof window !== 'undefined') {
      if (enabled) {
        document.body.classList.add('simple-mode')
      } else {
        document.body.classList.remove('simple-mode')
      }
      localStorage.setItem('simpleMode', String(enabled))
    }
    showSavedMessage()
  }

  const toggleNotification = (type: string, enabled: boolean) => {
    localStorage.setItem(type, String(enabled))
    switch (type) {
      case 'fraudAlerts':
        setFraudAlerts(enabled)
        break
      case 'transactionAlerts':
        setTransactionAlerts(enabled)
        break
      case 'marketUpdates':
        setMarketUpdates(enabled)
        break
      case 'emailNotifications':
        setEmailNotifications(enabled)
        break
    }
    showSavedMessage()
  }

  if (!mounted) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage your account preferences and accessibility options</p>
              </div>
              {saved && (
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg animate-fade-in">
                  ✅ Settings saved successfully!
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-white">
                    <User className="w-5 h-5 mr-2 text-teal-600" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Full Name</label>
                    <Input 
                      defaultValue={typeof window !== 'undefined' ? localStorage.getItem('userName') || 'User' : 'User'} 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email</label>
                    <Input 
                      defaultValue={typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'user@trustledger.com' : 'user@trustledger.com'} 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Phone</label>
                    <Input 
                      defaultValue="+91 9876543210" 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">
                    Save Profile Changes
                  </Button>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-white">
                    <Shield className="w-5 h-5 mr-2 text-teal-600" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Current Password</label>
                    <Input 
                      type="password" 
                      placeholder="Enter current password" 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">New Password</label>
                    <Input 
                      type="password" 
                      placeholder="Enter new password" 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Confirm Password</label>
                    <Input 
                      type="password" 
                      placeholder="Confirm new password" 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              {/* Accessibility Settings */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-white">
                    <Eye className="w-5 h-5 mr-2 text-teal-600" />
                    Accessibility Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Type className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium dark:text-white">Large Text Mode</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Increase font size for better readability</p>
                      </div>
                    </div>
                    <ToggleSwitch checked={largeText} onChange={toggleLargeText} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Moon className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium dark:text-white">Dark Mode</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Switch to dark theme</p>
                      </div>
                    </div>
                    <ToggleSwitch checked={darkMode} onChange={toggleDarkMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Palette className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium dark:text-white">High Contrast</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enhanced contrast for visual accessibility</p>
                      </div>
                    </div>
                    <ToggleSwitch checked={highContrast} onChange={toggleHighContrast} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium dark:text-white">Voice Mode</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enable voice commands and audio feedback</p>
                      </div>
                    </div>
                    <ToggleSwitch checked={voiceMode} onChange={toggleVoiceMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium dark:text-white">Simple Mode</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Simplified interface with larger buttons</p>
                      </div>
                    </div>
                    <ToggleSwitch checked={simpleMode} onChange={toggleSimpleMode} />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-white">
                    <Bell className="w-5 h-5 mr-2 text-teal-600" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium dark:text-white">Fraud Alerts</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about suspicious activities</p>
                    </div>
                    <ToggleSwitch 
                      checked={fraudAlerts} 
                      onChange={(enabled) => toggleNotification('fraudAlerts', enabled)} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium dark:text-white">Transaction Alerts</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notifications for all transactions</p>
                    </div>
                    <ToggleSwitch 
                      checked={transactionAlerts} 
                      onChange={(enabled) => toggleNotification('transactionAlerts', enabled)} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium dark:text-white">Market Updates</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Stock market and investment news</p>
                    </div>
                    <ToggleSwitch 
                      checked={marketUpdates} 
                      onChange={(enabled) => toggleNotification('marketUpdates', enabled)} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium dark:text-white">Email Notifications</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                    </div>
                    <ToggleSwitch 
                      checked={emailNotifications} 
                      onChange={(enabled) => toggleNotification('emailNotifications', enabled)} 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-white">
                    <HelpCircle className="w-5 h-5 mr-2 text-teal-600" />
                    Help & Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto py-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                      <div className="text-center">
                        <div className="font-semibold">User Guide</div>
                        <div className="text-sm opacity-80">Learn how to use TRUSTLEDGER</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                      <div className="text-center">
                        <div className="font-semibold">Contact Support</div>
                        <div className="text-sm opacity-80">Get help from our team</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                      <div className="text-center">
                        <div className="font-semibold">Privacy Policy</div>
                        <div className="text-sm opacity-80">Review our privacy terms</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
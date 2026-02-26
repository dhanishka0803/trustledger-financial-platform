'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, User, Bell, Palette, Lock, HelpCircle, Loader2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { authAPI } from '@/lib/api'

export default function Settings() {
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [simpleMode, setSimpleMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load settings on mount
  useEffect(() => {
    setLargeText(localStorage.getItem('largeText') === 'true')
    setHighContrast(localStorage.getItem('highContrast') === 'true')
    setVoiceMode(localStorage.getItem('voiceMode') === 'true')
    setSimpleMode(localStorage.getItem('simpleMode') === 'true')
  }, [])

  const saveToBackend = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await authAPI.updateSettings({
        large_text: largeText,
        high_contrast: highContrast,
        voice_mode: voiceMode,
        simple_mode: simpleMode
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
    setSaving(false)
  }

  const toggleLargeText = () => {
    const newValue = !largeText
    setLargeText(newValue)
    if (newValue) {
      document.body.classList.add('large-text')
    } else {
      document.body.classList.remove('large-text')
    }
    localStorage.setItem('largeText', String(newValue))
    saveToBackend()
  }

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    if (newValue) {
      document.body.classList.add('high-contrast')
      document.documentElement.classList.add('dark')
    } else {
      document.body.classList.remove('high-contrast')
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('highContrast', String(newValue))
    saveToBackend()
  }

  const toggleVoiceMode = () => {
    const newValue = !voiceMode
    setVoiceMode(newValue)
    localStorage.setItem('voiceMode', String(newValue))
    if (newValue && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Voice mode enabled')
      speechSynthesis.speak(utterance)
    }
    saveToBackend()
  }

  const toggleSimpleMode = () => {
    const newValue = !simpleMode
    setSimpleMode(newValue)
    if (newValue) {
      document.body.classList.add('simple-mode')
    } else {
      document.body.classList.remove('simple-mode')
    }
    localStorage.setItem('simpleMode', String(newValue))
    saveToBackend()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600 mb-6">Manage your account preferences</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input defaultValue={localStorage.getItem('userName') || 'User'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input defaultValue={localStorage.getItem('userEmail') || 'user@trustledger.com'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input defaultValue="+91 9876543210" />
                  </div>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Accessibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Large Text Mode</span>
                    <Button 
                      variant={largeText ? "default" : "outline"} 
                      size="sm"
                      onClick={toggleLargeText}
                    >
                      {largeText ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>High Contrast Mode</span>
                    <Button 
                      variant={highContrast ? "default" : "outline"} 
                      size="sm"
                      onClick={toggleHighContrast}
                    >
                      {highContrast ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Voice Mode</span>
                    <Button 
                      variant={voiceMode ? "default" : "outline"} 
                      size="sm"
                      onClick={toggleVoiceMode}
                    >
                      {voiceMode ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Simple Mode</span>
                    <Button 
                      variant={simpleMode ? "default" : "outline"} 
                      size="sm"
                      onClick={toggleSimpleMode}
                    >
                      {simpleMode ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Fraud Alerts</span>
                    <Button variant="default" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transaction Alerts</span>
                    <Button variant="default" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Market Updates</span>
                    <Button variant="default" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <Button variant="default" size="sm">Enabled</Button>
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

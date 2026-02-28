'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Eye, EyeOff, Volume2, Type, Contrast } from 'lucide-react'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [loading, setLoading] = useState(false)

  const speak = (text: string) => {
    if ('speechSynthesis' in window && voiceMode) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const handleLogin = async () => {
    console.log('Login attempt started')
    if (!username || !password) {
      speak('Please enter username and password')
      alert('Please enter both username and password')
      return
    }

    setLoading(true)
    console.log('Setting loading to true')

    try {
      // Check for registered users from signup
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      console.log('Registered users:', registeredUsers) // Debug log
      console.log('Trying to login with:', { username, password }) // Debug log
      
      // Show registered users in alert for debugging
      if (registeredUsers.length > 0) {
        console.log('Available users:', registeredUsers.map(u => `${u.username}/${u.email}`).join(', '))
      }
      
      const foundUser = registeredUsers.find((user: any) => 
        (user.username === username || user.email === username) && user.password === password
      )
      
      console.log('Looking for:', { username, password }) // Debug log
      console.log('Found user:', foundUser) // Debug log

      if (foundUser) {
        console.log('Registered user login successful')
        
        // DON'T clear localStorage - just set auth data
        localStorage.setItem('userType', 'user')
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userName', foundUser.name)
        localStorage.setItem('userEmail', foundUser.email)
        localStorage.setItem('userId', foundUser.id || Date.now().toString())
        localStorage.setItem('hasTransactions', 'false')
        
        // Restore accessibility settings if they exist
        if (foundUser.accessibilitySettings) {
          Object.keys(foundUser.accessibilitySettings).forEach(key => {
            localStorage.setItem(key, foundUser.accessibilitySettings[key])
          })
        }
        
        speak('Login successful')
        setUsername('')
        setPassword('')
        
        console.log('About to redirect to dashboard')
        // Force navigation to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 100)
        return
      }
      
      // Default demo accounts
      if (username === 'admin' && password === 'admin123') {
        console.log('Admin login successful')
        localStorage.clear()
        localStorage.setItem('userType', 'admin')
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userName', 'Admin User')
        localStorage.setItem('userEmail', 'admin@trustledger.com')
        speak('Admin login successful')
        
        setUsername('')
        setPassword('')
        
        // Force navigation to admin
        window.location.href = '/admin'
        
      } else if (username === 'user' && password === 'user123') {
        console.log('User login successful')
        localStorage.clear()
        localStorage.setItem('userType', 'user')
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userName', 'Demo User')
        localStorage.setItem('userEmail', 'user@trustledger.com')
        localStorage.setItem('userId', '1')
        localStorage.setItem('hasTransactions', 'false')
        localStorage.setItem('isNewUser', 'true')
        speak('Login successful')
        
        setUsername('')
        setPassword('')
        
        // Force navigation to dashboard
        window.location.href = '/dashboard'
        
      } else {
        setLoading(false)
        speak('Invalid credentials')
        alert('Invalid credentials. Please check your username and password or sign up for a new account.')
        setUsername('')
        setPassword('')
      }
    } catch (error) {
      console.error('Login failed:', error)
      setLoading(false)
      alert('Login failed. Please try again.')
      setUsername('')
      setPassword('')
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      highContrast ? 'bg-black' : 'bg-gradient-to-br from-teal-50 to-emerald-100'
    } ${largeText ? 'large-text' : ''}`}>
      
      {/* Accessibility Controls */}
      <div className="fixed top-4 right-4 flex flex-col space-y-2 z-10">
        <Button
          size="sm"
          variant={largeText ? "default" : "outline"}
          onClick={() => setLargeText(!largeText)}
          className={largeText ? "bg-teal-600" : ""}
        >
          <Type className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={highContrast ? "default" : "outline"}
          onClick={() => setHighContrast(!highContrast)}
          className={highContrast ? "bg-teal-600" : ""}
        >
          <Contrast className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={voiceMode ? "default" : "outline"}
          onClick={() => {
            setVoiceMode(!voiceMode)
            speak(voiceMode ? 'Voice mode disabled' : 'Voice mode enabled')
          }}
          className={voiceMode ? "bg-teal-600" : ""}
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      </div>

      <Card className={`w-full max-w-md shadow-xl transform transition-all duration-300 hover:scale-105 ${highContrast ? 'bg-gray-900 text-white border-white' : ''}`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">TRUSTLEDGER</CardTitle>
          <p className={highContrast ? 'text-gray-300' : 'text-gray-500'}>
            Sign in to your account
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => speak('Enter your username')}
                className={`${largeText ? 'text-lg p-4' : ''} ${
                  highContrast ? 'bg-gray-800 border-white text-white' : ''
                }`}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => speak('Enter your password')}
                  className={`${largeText ? 'text-lg p-4' : ''} ${
                    highContrast ? 'bg-gray-800 border-white text-white' : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit"
              className={`w-full bg-teal-600 hover:bg-teal-700 transform transition-all duration-200 hover:scale-105 ${largeText ? 'text-lg p-4' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : 'Sign In'}
            </Button>
          </form>
          
          <div className="text-center">
            <p className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link href="/signup" className="text-teal-600 hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </div>


        </CardContent>
      </Card>
    </div>
  )
}

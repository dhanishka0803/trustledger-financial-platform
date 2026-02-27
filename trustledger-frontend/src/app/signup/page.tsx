'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Eye, EyeOff, Volume2, Users, Type, Contrast } from 'lucide-react'
import Link from 'next/link'
import { authAPI } from '@/lib/api'

export default function SignUp() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    guardianName: '',
    guardianContact: '',
    needsAccessibility: false,
    accessibilityNeeds: {
      visualImpairment: false,
      hearingImpairment: false,
      motorDisability: false,
      cognitiveDisability: false
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [simpleMode, setSimpleMode] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '', color: 'gray' })

  const checkPasswordStrength = (password: string) => {
    let score = 0
    let feedback = []
    
    if (password.length >= 8) score += 1
    else feedback.push('At least 8 characters')
    
    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('One uppercase letter')
    
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('One lowercase letter')
    
    if (/\d/.test(password)) score += 1
    else feedback.push('One number')
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else feedback.push('One special character')
    
    const strength = {
      0: { label: 'Very Weak', color: 'red' },
      1: { label: 'Weak', color: 'red' },
      2: { label: 'Fair', color: 'yellow' },
      3: { label: 'Good', color: 'blue' },
      4: { label: 'Strong', color: 'green' },
      5: { label: 'Very Strong', color: 'green' }
    }[score] || { label: 'Very Weak', color: 'red' }
    
    return {
      score,
      feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Strong password!',
      color: strength.color,
      label: strength.label
    }
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'password') {
      const strength = checkPasswordStrength(value)
      setPasswordStrength(strength)
    }
    
    if (voiceMode) {
      speak(`${field} updated`)
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email) {
        speak('Please fill in all required fields')
        return
      }
    }
    setStep(step + 1)
    speak(`Step ${step + 1} of 3`)
  }

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      speak('Passwords do not match')
      alert('Passwords do not match')
      return
    }
    
    // Check password strength
    const strength = checkPasswordStrength(formData.password)
    if (strength.score < 3) {
      speak('Password is too weak')
      alert('Please create a stronger password. Your password should have at least 8 characters with uppercase, lowercase, numbers, and special characters.')
      return
    }
    
    try {
      // Register with backend
      const username = formData.email.split('@')[0] || formData.name.toLowerCase().replace(/\s+/g, '')
      const response = await authAPI.register({
        username: username,
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        phone: formData.mobile
      })
      
      const { access_token, user } = response.data
      
      // Save auth data
      localStorage.setItem('token', access_token)
      localStorage.setItem('userType', 'user')
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userName', formData.name)
      localStorage.setItem('userEmail', formData.email)
      localStorage.setItem('userId', user.id.toString())
      localStorage.setItem('isNewUser', 'true')
      
      // Save accessibility preferences
      if (formData.needsAccessibility) {
        localStorage.setItem('accessibilityEnabled', 'true')
        localStorage.setItem('accessibilityNeeds', JSON.stringify(formData.accessibilityNeeds))
        
        if (formData.accessibilityNeeds.visualImpairment) {
          localStorage.setItem('largeText', 'true')
          localStorage.setItem('highContrast', 'true')
          localStorage.setItem('voiceMode', 'true')
          document.body.classList.add('large-text', 'high-contrast')
          document.documentElement.classList.add('dark')
        }
        if (formData.accessibilityNeeds.cognitiveDisability) {
          localStorage.setItem('simpleMode', 'true')
          document.body.classList.add('simple-mode')
        }
        if (formData.accessibilityNeeds.motorDisability) {
          localStorage.setItem('largeButtons', 'true')
          document.body.classList.add('large-buttons')
        }
      }
      
      speak('Account created successfully')
      window.location.href = '/dashboard'
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.'
      speak(msg)
      alert(msg)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      highContrast ? 'bg-black' : 'bg-gray-50'
    } ${largeText ? 'large-text' : ''}`}>

      <Card className={`w-full max-w-md ${highContrast ? 'bg-gray-900 text-white border-white' : ''}`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {simpleMode ? 'Join TRUSTLEDGER' : 'Create Your Account'}
          </CardTitle>
          <p className={highContrast ? 'text-gray-300' : 'text-gray-600'}>
            {simpleMode ? 'Step by step signup' : `Step ${step} of 4`}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  {simpleMode ? 'Your Full Name' : 'Full Name'} *
                </label>
                <Input
                  id="name"
                  placeholder={simpleMode ? 'Enter your full name' : 'John Doe'}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onFocus={() => speak('Enter your full name')}
                  className={`${largeText ? 'text-lg p-4' : ''} ${
                    highContrast ? 'bg-gray-800 border-white text-white' : ''
                  }`}
                  aria-describedby="name-help"
                />
                <p id="name-help" className="text-xs text-gray-500 mt-1">
                  {simpleMode ? 'This will be shown on your account' : 'Your legal name as per ID'}
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  {simpleMode ? 'Your Email Address' : 'Email Address'} *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={simpleMode ? 'Enter your email' : 'john@example.com'}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => speak('Enter your email address')}
                  className={`${largeText ? 'text-lg p-4' : ''} ${
                    highContrast ? 'bg-gray-800 border-white text-white' : ''
                  }`}
                />
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium mb-2">
                  {simpleMode ? 'Your Phone Number' : 'Mobile Number'}
                </label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder={simpleMode ? 'Enter your phone number' : '+91 9876543210'}
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  onFocus={() => speak('Enter your phone number')}
                  className={`${largeText ? 'text-lg p-4' : ''} ${
                    highContrast ? 'bg-gray-800 border-white text-white' : ''
                  }`}
                />
              </div>

              <Button 
                onClick={handleNext} 
                className={`w-full ${largeText ? 'text-lg p-4' : ''}`}
                onFocus={() => speak('Continue to next step')}
              >
                {simpleMode ? 'Continue' : 'Next Step'}
              </Button>
            </>
          )}

          {/* Step 2: Accessibility Question */}
          {step === 2 && (
            <>
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg mb-2">
                  Do you need special accessibility features?
                </h3>
                <p className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                  We provide features for visual, hearing, motor, and cognitive disabilities
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  variant={formData.needsAccessibility ? "default" : "outline"}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, needsAccessibility: true }))
                    speak('Accessibility features will be enabled')
                  }}
                  className="w-full text-left justify-start h-auto py-4"
                >
                  <div>
                    <div className="font-semibold">Yes, I need accessibility features</div>
                    <div className="text-sm opacity-80">Enable voice, large text, and other helpful features</div>
                  </div>
                </Button>

                <Button
                  variant={!formData.needsAccessibility ? "default" : "outline"}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, needsAccessibility: false }))
                    speak('Standard interface selected')
                  }}
                  className="w-full text-left justify-start h-auto py-4"
                >
                  <div>
                    <div className="font-semibold">No, use standard interface</div>
                    <div className="text-sm opacity-80">Regular app without special features</div>
                  </div>
                </Button>
              </div>

              {formData.needsAccessibility && (
                <div className="mt-6 space-y-3 p-4 border rounded-lg">
                  <p className="font-medium mb-2">Select your needs:</p>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accessibilityNeeds.visualImpairment}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        accessibilityNeeds: { ...prev.accessibilityNeeds, visualImpairment: e.target.checked }
                      }))}
                      className="w-5 h-5"
                    />
                    <span>Visual impairment (Large text, Voice, High contrast)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accessibilityNeeds.hearingImpairment}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        accessibilityNeeds: { ...prev.accessibilityNeeds, hearingImpairment: e.target.checked }
                      }))}
                      className="w-5 h-5"
                    />
                    <span>Hearing impairment (Text alerts, Visual notifications)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accessibilityNeeds.motorDisability}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        accessibilityNeeds: { ...prev.accessibilityNeeds, motorDisability: e.target.checked }
                      }))}
                      className="w-5 h-5"
                    />
                    <span>Motor disability (Large buttons, Voice input)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accessibilityNeeds.cognitiveDisability}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        accessibilityNeeds: { ...prev.accessibilityNeeds, cognitiveDisability: e.target.checked }
                      }))}
                      className="w-5 h-5"
                    />
                    <span>Cognitive disability (Simple mode, Easy language)</span>
                  </label>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className={`flex-1 ${largeText ? 'text-lg p-4' : ''}`}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  className={`flex-1 ${largeText ? 'text-lg p-4' : ''}`}
                >
                  {simpleMode ? 'Continue' : 'Next Step'}
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  {simpleMode ? 'Create Password' : 'Password'} *
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={simpleMode ? 'Create a strong password' : 'Enter password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onFocus={() => speak('Create your password')}
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">Password Strength</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.color === 'green' ? 'text-green-600' :
                        passwordStrength.color === 'blue' ? 'text-blue-600' :
                        passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {passwordStrength.feedback}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.color === 'green' ? 'bg-green-500' :
                          passwordStrength.color === 'blue' ? 'bg-blue-500' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{passwordStrength.feedback}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  {simpleMode ? 'Type Password Again' : 'Confirm Password'} *
                </label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={simpleMode ? 'Type the same password again' : 'Confirm password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onFocus={() => speak('Confirm your password')}
                  className={`${largeText ? 'text-lg p-4' : ''} ${
                    highContrast ? 'bg-gray-800 border-white text-white' : ''
                  } ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                      ? 'border-red-500' 
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-500'
                      : ''
                  }`}
                />
                {formData.confirmPassword && (
                  <p className={`text-xs mt-1 ${
                    formData.password === formData.confirmPassword 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formData.password === formData.confirmPassword 
                      ? '✓ Passwords match' 
                      : '✗ Passwords do not match'
                    }
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className={`flex-1 ${largeText ? 'text-lg p-4' : ''}`}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  className={`flex-1 ${largeText ? 'text-lg p-4' : ''}`}
                >
                  {simpleMode ? 'Continue' : 'Next Step'}
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Guardian (Optional) */}
          {step === 4 && (
            <>
              <div className="text-center mb-4">
                <Users className="w-12 h-12 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold">
                  {simpleMode ? 'Add Helper (Optional)' : 'Guardian Mode Setup'}
                </h3>
                <p className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                  {simpleMode ? 'Add someone who can help you' : 'Add a trusted person to help with your account'}
                </p>
              </div>

              <div>
                <label htmlFor="guardianName" className="block text-sm font-medium mb-2">
                  {simpleMode ? 'Helper Name' : 'Guardian Name'}
                </label>
                <Input
                  id="guardianName"
                  placeholder={simpleMode ? 'Name of person who helps you' : 'Guardian full name'}
                  value={formData.guardianName}
                  onChange={(e) => handleInputChange('guardianName', e.target.value)}
                  className={`${largeText ? 'text-lg p-4' : ''} ${
                    highContrast ? 'bg-gray-800 border-white text-white' : ''
                  }`}
                />
              </div>

              <div>
                <label htmlFor="guardianContact" className="block text-sm font-medium mb-2">
                  {simpleMode ? 'Helper Phone/Email' : 'Guardian Contact'}
                </label>
                <Input
                  id="guardianContact"
                  placeholder={simpleMode ? 'Their phone or email' : 'Phone or email'}
                  value={formData.guardianContact}
                  onChange={(e) => handleInputChange('guardianContact', e.target.value)}
                  className={`${largeText ? 'text-lg p-4' : ''} ${
                    highContrast ? 'bg-gray-800 border-white text-white' : ''
                  }`}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(3)}
                  className={`flex-1 ${largeText ? 'text-lg p-4' : ''}`}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSignUp}
                  className={`flex-1 ${largeText ? 'text-lg p-4' : ''}`}
                  onFocus={() => speak('Create your account')}
                >
                  {simpleMode ? 'Create Account' : 'Complete Signup'}
                </Button>
              </div>
            </>
          )}

          <div className="text-center pt-4">
            <p className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link href="/login" className="text-teal-600 hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VoiceNavigationProps {
  currentPage?: string
}

export default function VoiceNavigation({ currentPage = '' }: VoiceNavigationProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const recognitionRef = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
    
    // Check if voice mode is enabled
    const voiceMode = localStorage.getItem('voiceMode') === 'true'
    setVoiceEnabled(voiceMode)

    if (SpeechRecognition && voiceMode) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase().trim()
        setTranscript(command)
        handleVoiceCommand(command)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [voiceEnabled])

  const speak = (text: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      speechSynthesis.cancel() // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      setTranscript('')
      recognitionRef.current.start()
      speak('Listening for command')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command:', command)

    // Navigation commands
    if (command.includes('go to dashboard') || command.includes('dashboard')) {
      speak('Going to dashboard')
      router.push('/dashboard')
    }
    else if (command.includes('go to transactions') || command.includes('transactions')) {
      speak('Going to transactions')
      router.push('/transactions')
    }
    else if (command.includes('go to fraud') || command.includes('fraud detection')) {
      speak('Going to fraud detection')
      router.push('/fraud')
    }
    else if (command.includes('go to market') || command.includes('market analytics')) {
      speak('Going to market analytics')
      router.push('/market')
    }
    else if (command.includes('go to compliance') || command.includes('compliance')) {
      speak('Going to compliance')
      router.push('/compliance')
    }
    else if (command.includes('go to reports') || command.includes('reports')) {
      speak('Going to reports')
      router.push('/reports')
    }
    else if (command.includes('go to settings') || command.includes('settings')) {
      speak('Going to settings')
      router.push('/settings')
    }
    else if (command.includes('go to green') || command.includes('green finance')) {
      speak('Going to green finance')
      router.push('/green')
    }
    else if (command.includes('go to assistant') || command.includes('ai assistant')) {
      speak('Going to AI assistant')
      router.push('/assistant')
    }
    
    // Account commands
    else if (command.includes('logout') || command.includes('sign out')) {
      speak('Logging out')
      localStorage.clear()
      router.push('/')
    }
    else if (command.includes('freeze account')) {
      speak('Account freeze feature - please use the dashboard button')
    }
    
    // Information commands
    else if (command.includes('balance') || command.includes('my balance')) {
      speak('Your current balance information is displayed on the dashboard')
    }
    else if (command.includes('help') || command.includes('commands')) {
      speakHelp()
    }
    else if (command.includes('what page') || command.includes('where am i')) {
      speak(`You are currently on the ${currentPage || 'main'} page`)
    }
    
    // Accessibility commands
    else if (command.includes('large text') || command.includes('bigger text')) {
      toggleLargeText()
    }
    else if (command.includes('high contrast') || command.includes('dark mode')) {
      toggleHighContrast()
    }
    
    else {
      speak('Command not recognized. Say "help" to hear available commands.')
    }
  }

  const speakHelp = () => {
    const helpText = `Available voice commands: 
    Navigation: Go to dashboard, transactions, fraud detection, market analytics, compliance, reports, settings, green finance, or AI assistant.
    Account: Logout, freeze account.
    Information: Balance, help, what page.
    Accessibility: Large text, high contrast.
    Say any command clearly after clicking the microphone button.`
    speak(helpText)
  }

  const toggleLargeText = () => {
    const current = localStorage.getItem('largeText') === 'true'
    const newValue = !current
    localStorage.setItem('largeText', String(newValue))
    
    if (newValue) {
      document.body.classList.add('large-text')
      speak('Large text mode enabled')
    } else {
      document.body.classList.remove('large-text')
      speak('Large text mode disabled')
    }
  }

  const toggleHighContrast = () => {
    const current = localStorage.getItem('highContrast') === 'true'
    const newValue = !current
    localStorage.setItem('highContrast', String(newValue))
    
    if (newValue) {
      document.body.classList.add('high-contrast')
      document.documentElement.classList.add('dark')
      speak('High contrast mode enabled')
    } else {
      document.body.classList.remove('high-contrast')
      document.documentElement.classList.remove('dark')
      speak('High contrast mode disabled')
    }
  }

  const toggleVoiceMode = () => {
    const newValue = !voiceEnabled
    setVoiceEnabled(newValue)
    localStorage.setItem('voiceMode', String(newValue))
    
    if (newValue) {
      speak('Voice navigation enabled. Click the microphone to give commands.')
    } else {
      speak('Voice navigation disabled')
    }
  }

  if (!isSupported) {
    return null // Don't render if speech recognition is not supported
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Voice Mode Toggle */}
        <Button
          size="sm"
          variant={voiceEnabled ? "default" : "outline"}
          onClick={toggleVoiceMode}
          className={`${voiceEnabled ? 'bg-teal-600 hover:bg-teal-700' : ''} shadow-lg`}
          title="Toggle Voice Navigation"
        >
          <Volume2 className="w-4 h-4" />
        </Button>

        {/* Voice Command Button */}
        {voiceEnabled && (
          <Button
            size="lg"
            onClick={isListening ? stopListening : startListening}
            className={`${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                : 'bg-teal-600 hover:bg-teal-700'
            } shadow-lg`}
            title={isListening ? 'Stop Listening' : 'Start Voice Command'}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
        )}

        {/* Transcript Display */}
        {transcript && voiceEnabled && (
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg max-w-xs">
            <p className="text-xs text-gray-600 dark:text-gray-400">Command:</p>
            <p className="text-sm font-medium">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  )
}
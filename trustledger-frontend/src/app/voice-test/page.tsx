'use client'

import { Button } from '@/components/ui/button'

export default function VoiceTest() {
  const testVoice = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Hello! Voice is working in TRUSTLEDGER')
      speechSynthesis.speak(utterance)
    } else {
      alert('Voice not supported')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button onClick={testVoice} className="text-lg px-8 py-4">
        Test Voice
      </Button>
    </div>
  )
}
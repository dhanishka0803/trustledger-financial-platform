'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Brain, Sparkles, Volume2, VolumeX, Mic, MicOff } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { aiAPI } from '@/lib/api'

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI financial assistant. I can help with fraud alerts, spending analysis, market insights, compliance, and more. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setVoiceMode(localStorage.getItem('voiceMode') === 'true')
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speak = (text: string) => {
    if (!voiceMode || !('speechSynthesis' in window)) return
    
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }

    recognition.start()
    recognitionRef.current = recognition
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userInput = input
    setMessages(prev => [...prev, { role: 'user', content: userInput }])
    setInput('')
    setIsTyping(true)
    
    try {
      const response = await aiAPI.chat(userInput)
      const aiResponse = response.data.response
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
      
      // Speak the response if voice mode is enabled
      if (voiceMode) {
        setTimeout(() => speak(aiResponse), 500)
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please make sure the backend server is running and try again.' }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <div className="container mx-auto px-6 py-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Financial Assistant</h1>
                <p className="text-slate-600">Intelligent chatbot for finance management</p>
              </div>
              <div className="flex items-center space-x-3">
                {voiceMode && (
                  <Button
                    variant={isSpeaking ? "default" : "outline"}
                    size="sm"
                    onClick={isSpeaking ? stopSpeaking : () => messages.length > 0 && speak(messages[messages.length - 1].content)}
                    className={isSpeaking ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                    {isSpeaking ? 'Stop' : 'Speak'}
                  </Button>
                )}
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-md">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">AI Powered</span>
                </div>
              </div>
            </div>

            <Card className="h-[calc(100vh-250px)] flex flex-col shadow-lg border-slate-200">
              <CardHeader className="border-b bg-white">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-indigo-600" />
                    <span className="text-slate-800">Chat with AI</span>
                  </div>
                  {voiceMode && (
                    <Button
                      variant={listening ? "destructive" : "outline"}
                      size="sm"
                      onClick={listening ? stopListening : startListening}
                    >
                      {listening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      {listening ? 'Listening...' : 'Voice Input'}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-lg shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-slate-800 border border-slate-200'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center mb-2">
                          <Brain className="w-4 h-4 mr-2 text-indigo-600" />
                          <span className="text-xs font-semibold text-indigo-600">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-slate-500 ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="border-t bg-white p-4">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about your finances, transactions, fraud alerts, or market data..."
                    className="flex-1 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {voiceMode && (
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    🎤 Voice mode enabled - Click microphone for voice input, or press Speak to hear responses
                  </p>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

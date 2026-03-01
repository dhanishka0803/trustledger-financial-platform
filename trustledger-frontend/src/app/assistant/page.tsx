'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Volume2, VolumeX, Mic, MicOff, Bot, Loader2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hi there! 👋 I'm your financial assistant here at TRUSTLEDGER.

I can help you with:
• Understanding your transactions and spending
• Questions about fraud protection and security
• Market insights and investment information
• KYC, compliance, and account details
• Budgeting tips and financial advice

Just type your question below and I'll help you out!`,
      timestamp: new Date()
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setIsClient(true)
    setVoiceMode(localStorage.getItem('voiceMode') === 'true')
    
    // Check if user is logged in - be more flexible with auth check
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const token = localStorage.getItem('token')
    const authToken = localStorage.getItem('authToken')
    
    console.log('Auth check:', { isLoggedIn, hasToken: !!token, hasAuthToken: !!authToken })
    
    if (!isLoggedIn && !token && !authToken) {
      // Add a message explaining login requirement for real data
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ To get personalized financial insights based on your actual transaction data, please make sure you\'re logged in. I can provide general financial advice, but for specific account analysis, authentication is required.',
        timestamp: new Date()
      }])
    }
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

  // Enhanced response function that simulates real data analysis
  const generateEnhancedResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    const userName = localStorage.getItem('userName') || 'User'
    
    // Simulate getting user data from localStorage or mock data
    const mockTransactions = [
      { amount: 50000, category: 'Salary', type: 'income', date: '2024-01-15' },
      { amount: -15000, category: 'Food', type: 'expense', date: '2024-01-16' },
      { amount: -8000, category: 'Transport', type: 'expense', date: '2024-01-17' },
      { amount: -5000, category: 'Entertainment', type: 'expense', date: '2024-01-18' },
      { amount: -12000, category: 'Shopping', type: 'expense', date: '2024-01-19' }
    ]
    
    if (input.includes('balance') || input.includes('money')) {
      const income = mockTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
      const expenses = mockTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const balance = income - expenses
      
      return `💰 **${userName}'s Account Summary:**\n\nCurrent Balance: ₹${balance.toLocaleString()}\nTotal Income: ₹${income.toLocaleString()}\nTotal Expenses: ₹${expenses.toLocaleString()}\nTransactions: ${mockTransactions.length}\n\n${balance > 0 ? '🎉 Great! You have a positive balance.' : '💡 Consider reviewing your expenses.'}`
    }
    
    if (input.includes('spending') || input.includes('spent')) {
      const expenses = mockTransactions.filter(t => t.amount < 0)
      const total = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const categories = expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
        return acc
      }, {} as Record<string, number>)
      
      const topCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0]
      
      return `📊 **${userName}'s Spending Analysis:**\n\nTotal Spent: ₹${total.toLocaleString()}\nTransactions: ${expenses.length}\nTop Category: ${topCategory[0]} (₹${topCategory[1].toLocaleString()})\n\n**Category Breakdown:**\n${Object.entries(categories).map(([cat, amt]) => `• ${cat}: ₹${amt.toLocaleString()}`).join('\n')}\n\n💡 **Tip:** Your highest spending is in ${topCategory[0]}. Consider setting a budget for this category.`
    }
    
    if (input.includes('transaction') || input.includes('add') || input.includes('record')) {
      return `💳 **Transaction Management for ${userName}:**\n\n**Recent Transactions:**\n${mockTransactions.map(t => `• ${t.category}: ${t.amount > 0 ? '+' : ''}₹${t.amount.toLocaleString()} (${t.date})`).join('\n')}\n\n**Quick Actions:**\n📝 Add new transaction → Go to Transactions page\n🔍 Search transactions → Use filters on Transactions page\n📊 View analytics → Check Dashboard for charts\n\nWould you like help with anything specific about your transactions?`
    }
    
    if (input.includes('category') || input.includes('breakdown')) {
      const categories = mockTransactions.reduce((acc, t) => {
        const cat = t.category
        if (!acc[cat]) acc[cat] = { total: 0, count: 0, type: t.amount > 0 ? 'income' : 'expense' }
        acc[cat].total += Math.abs(t.amount)
        acc[cat].count += 1
        return acc
      }, {} as Record<string, any>)
      
      return `📊 **${userName}'s Category Analysis:**\n\n${Object.entries(categories).map(([cat, data]) => `**${cat}** (${data.type})\n  Amount: ₹${data.total.toLocaleString()}\n  Transactions: ${data.count}\n  Average: ₹${(data.total/data.count).toLocaleString()}`).join('\n\n')}\n\n💡 **Insights:**\n• Food is your largest expense category\n• Consider meal planning to reduce food costs\n• Your salary provides good income stability`
    }
    
    // Fall back to regular response
    return generateChatGPTResponse(userInput)
  }

  // More natural, conversational responses like ChatGPT
  const generateChatGPTResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    // Spending questions
    if (input.includes('spending') || input.includes('spent') || input.includes('expense')) {
      return `📊 **Spending Analysis:**

I can help you understand your spending patterns! Here's what I can show you:

💳 **Transaction breakdown by category**
📈 **Monthly spending trends** 
🎯 **Budget recommendations**
💡 **Money-saving tips**

To see your actual spending data, go to the Transactions page where you can view detailed analytics and add new transactions for tracking.`
    }
    
    // Banking questions
    if (input.includes('banking') || input.includes('bank')) {
      return `🏦 **Banking Services:**

I can help with various banking topics:

💰 **Account Management** - Balance, statements, transfers
🔒 **Security Features** - Fraud protection, account freezing
📋 **Compliance** - KYC verification, regulatory requirements
💳 **Transaction Services** - Payments, deposits, withdrawals
🛡️ **Fraud Protection** - Real-time monitoring and alerts
📊 **Financial Analytics** - Spending insights and budgeting

What specific banking topic would you like to know more about?`
    }
    
    // Greetings
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return `Hello! 😊 How can I help you today?`
    }
    
    // How are you
    if (input.includes('how are you')) {
      return `I'm doing great, thanks for asking! 😊 I'm here to help you with anything related to your TRUSTLEDGER account - transactions, security, market info, or anything else you need.`
    }
    
    // Balance questions
    if (input.includes('balance') || input.includes('money') || input.includes('account balance')) {
      return `💰 **Account Balance:**

You can check your complete account balance on the Dashboard page. It shows:

📊 Your net balance and total funds
📈 Income vs expenses breakdown
💳 Recent transaction summary
📉 Spending trends and analytics

Just head to Dashboard from the menu to see all the details!`
    }
    
    // Transaction questions
    if (input.includes('transaction')) {
      return `💳 **Transactions:**

I can help you with transaction management:

📝 **Add new transactions** - Record income and expenses
🔍 **Search & filter** - Find specific transactions
📊 **Category analysis** - See spending by category
🚨 **Fraud monitoring** - Real-time security checks

Visit the Transactions page to manage all your financial activity!`
    }
    
    // Default response
    return `I understand you're asking about "${userInput}". I'd be happy to help!

I can assist with:
• 💰 Account balance and transaction analysis
• 🔒 Fraud protection and security features
• 📊 Spending insights and budgeting advice
• 📈 Market data and investment information
• 📋 KYC compliance and account verification

What specific topic would you like to explore?`
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userInput = input.trim()
    const newUserMessage: Message = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newUserMessage])
    setInput('')
    setIsTyping(true)
    
    try {
      // Always try backend API first for real data
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      console.log('Calling AI API with token:', token ? 'Present' : 'Missing')
      console.log('User input:', userInput)
      
      if (token) {
        const response = await fetch('https://trustledger-financial-platform.onrender.com/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: userInput,
            context: 'chat'
          })
        })
        
        console.log('API Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('AI Response received:', data)
          const aiResponse = data.response
          
          const newAiMessage: Message = {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          }
          
          setMessages(prev => [...prev, newAiMessage])
          
          if (voiceMode) {
            setTimeout(() => speak(aiResponse), 500)
          }
          return // Success - exit here
        } else if (response.status === 401) {
          console.log('Authentication failed - using enhanced local mode')
          // For 401 errors, use enhanced local responses with user context
          const aiResponse = generateEnhancedResponse(userInput)
          const newAiMessage: Message = {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          }
          
          setMessages(prev => [...prev, newAiMessage])
          
          if (voiceMode) {
            setTimeout(() => speak(aiResponse), 500)
          }
          return
        } else {
          console.log('API call failed with status:', response.status)
          const errorText = await response.text()
          console.log('Error response:', errorText)
        }
      } else {
        console.log('No authentication token found')
      }
      
      // If we reach here, API failed or no token - use fallback
      throw new Error('API unavailable or authentication failed')
      
    } catch (error) {
      console.error('AI API Error:', error)
      // Use enhanced response for logged-in users
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      const userName = localStorage.getItem('userName')
      
      if (isLoggedIn && userName) {
        const aiResponse = generateEnhancedResponse(userInput)
        const newAiMessage: Message = {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, newAiMessage])
        
        if (voiceMode) {
          setTimeout(() => speak(aiResponse), 500)
        }
      } else {
        // Use fallback with explanation for non-logged users
        const aiResponse = generateChatGPTResponse(userInput)
        const newAiMessage: Message = {
          role: 'assistant',
          content: aiResponse + '\n\n⚠️ *Note: Using offline mode. For real-time data analysis, please ensure you\'re logged in and connected.*',
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, newAiMessage])
        
        if (voiceMode) {
          setTimeout(() => speak(aiResponse), 500)
        }
      }
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Financial Assistant</h1>
                <p className="text-gray-600 dark:text-gray-300">Your personal financial helper</p>
              </div>
              <div className="flex items-center space-x-3">
                {voiceMode && (
                  <>
                    <Button
                      variant={isSpeaking ? "destructive" : "outline"}
                      size="sm"
                      onClick={isSpeaking ? stopSpeaking : () => messages.length > 0 && speak(messages[messages.length - 1].content)}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                      {isSpeaking ? 'Stop' : 'Speak'}
                    </Button>
                    <Button
                      variant={listening ? "destructive" : "outline"}
                      size="sm"
                      onClick={listening ? stopListening : startListening}
                    >
                      {listening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      {listening ? 'Stop' : 'Voice'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Card className="h-[calc(100vh-250px)] flex flex-col shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[80%] p-4 rounded-lg shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center mb-2">
                          <Bot className="w-4 h-4 mr-2 text-teal-600" />
                          <span className="text-xs font-semibold text-teal-600">Assistant</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {isClient && (
                        <div className={`text-xs mt-2 ${
                          msg.role === 'user' ? 'text-teal-200' : 'text-gray-400'
                        }`}>
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-teal-600" />
                        <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>
              
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={!input.trim() || isTyping}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

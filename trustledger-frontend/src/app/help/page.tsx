'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  MessageCircle, 
  Shield, 
  Phone, 
  Mail, 
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Video,
  FileText,
  Users
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click 'Sign Up' on the login page, fill in your details, and verify your email address. You can also use demo accounts: user/user123 or admin/admin123."
      },
      {
        q: "How do I add my first transaction?",
        a: "Go to Transactions page, click 'Add Transaction', select Income/Expense, enter amount, merchant, and category. The system will automatically calculate fraud risk."
      },
      {
        q: "What are the demo login credentials?",
        a: "User account: username 'user', password 'user123'. Admin account: username 'admin', password 'admin123'."
      }
    ]
  },
  {
    category: "Fraud Detection",
    questions: [
      {
        q: "How does fraud detection work?",
        a: "Our AI analyzes transaction patterns, amounts, locations, and merchant data in real-time. Each transaction gets a risk score from 0-100."
      },
      {
        q: "What should I do if a transaction is flagged?",
        a: "Review the transaction details in Fraud Detection page. If it's legitimate, you can approve it. If suspicious, report it immediately."
      },
      {
        q: "How accurate is the fraud detection?",
        a: "Our system maintains 95%+ accuracy with less than 2% false positives, powered by Pathway ML algorithms."
      }
    ]
  },
  {
    category: "AI Assistant",
    questions: [
      {
        q: "What can I ask the AI Assistant?",
        a: "Ask about spending patterns, budget recommendations, financial goals, transaction analysis, and personalized financial advice."
      },
      {
        q: "Does the AI use my real data?",
        a: "Yes, the AI analyzes your actual transaction data to provide personalized insights and recommendations."
      }
    ]
  }
]

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq => 
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

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
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Help & Support Center
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                Get help with TRUSTLEDGER features and find answers to common questions
              </p>
              
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search help articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-white">
                    <Phone className="w-5 h-5 mr-2 text-teal-600" />
                    Phone Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">24/7 Support Hotline</p>
                  <p className="font-semibold text-lg dark:text-white">+1 (555) 987-6543</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Available 24 hours a day, 7 days a week
                  </p>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-white">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">General Support</p>
                  <p className="font-semibold dark:text-white">support@trustledger.com</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-2 mt-3">Security Issues</p>
                  <p className="font-semibold dark:text-white">security@trustledger.com</p>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-white">
                    <Shield className="w-5 h-5 mr-2 text-red-600" />
                    Emergency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Fraud Hotline</p>
                  <p className="font-semibold text-lg text-red-600">+1 (555) 911-FRAUD</p>
                  <Button className="w-full mt-3 bg-red-600 hover:bg-red-700">
                    Report Fraud Now
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <HelpCircle className="w-6 h-6 mr-2 text-teal-600" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No results found for "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredFAQs.map((category) => (
                      <div key={category.category}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          {category.category}
                        </h3>
                        <div className="space-y-2">
                          {category.questions.map((faq, index) => {
                            const faqId = `${category.category}-${index}`
                            const isExpanded = expandedFAQ === faqId
                            
                            return (
                              <div key={faqId} className="border dark:border-gray-700 rounded-lg">
                                <button
                                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                                  onClick={() => setExpandedFAQ(isExpanded ? null : faqId)}
                                >
                                  <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                  )}
                                </button>
                                {isExpanded && (
                                  <div className="px-4 pb-3">
                                    <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Still need help?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Live Chat
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Support Ticket
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
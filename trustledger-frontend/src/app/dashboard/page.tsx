'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Plus, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import VoiceNavigation from '@/components/VoiceNavigation'
import { transactionAPI, fraudAPI, authAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [hasTransactions, setHasTransactions] = useState(false)
  const [isAccountFrozen, setIsAccountFrozen] = useState(false)
  const [freezing, setFreezing] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [fraudStats, setFraudStats] = useState<any>(null)
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.replace('/login')
      return
    }
    
    // Check if account is frozen
    const accountFrozen = localStorage.getItem('isAccountFrozen') === 'true'
    setIsAccountFrozen(accountFrozen)
    
    // Load data from backend
    loadDashboardData()
    
    // Load accessibility preferences
    const largeText = localStorage.getItem('largeText') === 'true'
    const highContrast = localStorage.getItem('highContrast') === 'true'
    const simpleMode = localStorage.getItem('simpleMode') === 'true'
    
    if (largeText) document.body.classList.add('large-text')
    if (highContrast) {
      document.body.classList.add('high-contrast')
      document.documentElement.classList.add('dark')
    }
    if (simpleMode) document.body.classList.add('simple-mode')
  }, [])

  // Add effect to refresh data when returning to dashboard
  useEffect(() => {
    const handleFocus = () => {
      loadDashboardData()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Always try to load from API first
      const [statsRes, fraudRes, txnRes, alertsRes] = await Promise.all([
        transactionAPI.getStats(30).catch(() => ({ data: null })),
        fraudAPI.getStats().catch(() => ({ data: null })),
        transactionAPI.getAll({ limit: 10 }).catch(() => ({ data: [] })),
        fraudAPI.getAlerts().catch(() => ({ data: [] })),
      ])
      
      // Check if we have any transactions
      let hasTxns = false
      if (statsRes.data && statsRes.data.total_transactions > 0) {
        hasTxns = true
        setStats(statsRes.data)
      } else if (txnRes.data && Array.isArray(txnRes.data) && txnRes.data.length > 0) {
        hasTxns = true
        // Create basic stats from transaction data
        const transactions = txnRes.data
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
        const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
        setStats({
          net_balance: income - expenses,
          total_income: income,
          total_transactions: transactions.length,
          avg_transaction: transactions.length > 0 ? (income + expenses) / transactions.length : 0,
          daily_spending: [],
          categories: {}
        })
      }
      
      setHasTransactions(hasTxns)
      localStorage.setItem('hasTransactions', hasTxns ? 'true' : 'false')
      
      if (fraudRes.data) setFraudStats(fraudRes.data)
      if (txnRes.data) setTransactions(Array.isArray(txnRes.data) ? txnRes.data : [])
      if (alertsRes.data) setFraudAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : [])
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      // Fallback to localStorage check
      setHasTransactions(localStorage.getItem('hasTransactions') === 'true')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = () => {
    router.push('/transactions')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Activity className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading your dashboard...</p>
                </div>
              </div>
            ) : !hasTransactions ? (
              <div className="text-center py-12">
                <div className="mb-8">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop&crop=center" 
                    alt="Modern financial dashboard with charts and analytics" 
                    className="w-80 h-52 object-cover rounded-xl shadow-xl mx-auto mb-6 border-4 border-white"
                  />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to TRUSTLEDGER</h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Your AI-powered financial intelligence platform is ready. Start monitoring transactions with real-time fraud detection, 
                  market analytics, and comprehensive security features designed to protect your financial future.
                </p>
                <Button 
                  onClick={handleAddTransaction}
                  className="bg-teal-700 hover:bg-teal-800 text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Transaction
                </Button>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Shield className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">AI Fraud Protection</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Advanced machine learning algorithms monitor every transaction in real-time, 
                      detecting suspicious patterns and protecting your account 24/7 with instant alerts.
                    </p>
                  </div>
                  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Real-Time Monitoring</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Get instant notifications about account activity, suspicious transactions, 
                      and security events. Stay informed with comprehensive alerts and detailed insights.
                    </p>
                  </div>
                  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Smart Analytics</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Understand your spending patterns with detailed analytics, market insights, 
                      and personalized recommendations to optimize your financial health and growth.
                    </p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-teal-50 rounded-lg max-w-2xl mx-auto">
                  <p className="text-sm text-teal-800">
                    <strong>🔒 Bank-Grade Security:</strong> Your data is protected with enterprise-level encryption, 
                    multi-factor authentication, and compliance with international financial security standards.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Real-time financial intelligence powered by AI</p>
                  </div>
                  <Button 
                    className={isAccountFrozen ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                    disabled={freezing}
                    onClick={async () => {
                      if (isAccountFrozen) {
                        // Unfreeze account
                        if (window.confirm('Are you sure you want to unfreeze your account? This will restore all transaction access.')) {
                          setFreezing(true)
                          try {
                            await authAPI.unfreezeAccount()
                            setIsAccountFrozen(false)
                            localStorage.setItem('isAccountFrozen', 'false')
                            alert('Your account has been unfrozen successfully!')
                          } catch (error) {
                            console.error('Failed to unfreeze account:', error)
                            alert('Failed to unfreeze account. Please try again.')
                          } finally {
                            setFreezing(false)
                          }
                        }
                      } else {
                        // Freeze account
                        if (window.confirm('Are you sure you want to freeze your account? This will temporarily disable all transactions and access.')) {
                          setFreezing(true)
                          try {
                            await authAPI.freezeAccount()
                            setIsAccountFrozen(true)
                            localStorage.setItem('isAccountFrozen', 'true')
                            alert('Your account has been frozen. Please contact support to unfreeze.')
                          } catch (error) {
                            console.error('Failed to freeze account:', error)
                            alert('Failed to freeze account. Please try again.')
                          } finally {
                            setFreezing(false)
                          }
                        }
                      }
                    }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {isAccountFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">₹{stats ? Math.abs(stats.net_balance).toLocaleString('en-IN') : '...'}</div>
                      <div className="flex items-center text-green-600 text-sm mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Income: ₹{stats ? stats.total_income.toLocaleString('en-IN') : '...'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats ? stats.total_transactions : '...'}</div>
                      <div className="flex items-center text-blue-600 text-sm mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Avg: ₹{stats ? stats.avg_transaction.toLocaleString('en-IN') : '...'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">AI Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${fraudStats && fraudStats.average_risk_score > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {fraudStats ? `${Math.round(fraudStats.average_risk_score)}/100` : '...'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {fraudStats ? `${fraudStats.high_risk_count} high-risk alerts` : 'Loading...'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Carbon Footprint</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">2.4 kg</div>
                      <div className="flex items-center text-green-600 text-sm mt-1">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        -8% this month
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Spending Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Spending Trend (Last 30 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats?.daily_spending?.length > 0 ? stats.daily_spending.map((d: any) => ({
                        day: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                        amount: d.amount
                      })) : [
                        { day: 'No data', amount: 0 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Spending (₹)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={stats?.categories ? Object.entries(stats.categories).map(([name, value]: [string, any], i: number) => ({
                              name,
                              value: Math.round(value),
                              color: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][i % 8]
                            })) : [
                              { name: 'No data', value: 100, color: '#d1d5db' },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ₹${entry.value.toLocaleString('en-IN')}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(stats?.categories ? Object.entries(stats.categories).map(([name, value]: [string, any], i: number) => ({
                              name,
                              value: Math.round(value),
                              color: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][i % 8]
                            })) : [
                              { name: 'No data', value: 100, color: '#d1d5db' },
                            ]).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>AI Fraud Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {fraudAlerts && fraudAlerts.length > 0 ? (
                          fraudAlerts.slice(0, 5).map((alert: any, index: number) => (
                            <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                              alert.risk_level === 'critical' || alert.risk_level === 'high' 
                                ? 'bg-red-50' 
                                : 'bg-yellow-50'
                            }`}>
                              <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                                alert.risk_level === 'critical' || alert.risk_level === 'high'
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                              }`} />
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {alert.risk_level === 'critical' || alert.risk_level === 'high' 
                                    ? 'High Risk Alert' 
                                    : 'Medium Risk Alert'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ₹{alert.amount?.toLocaleString('en-IN')} to {alert.merchant} - {alert.timestamp ? new Date(alert.timestamp).toLocaleDateString('en-IN') : 'recently'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Risk Score: {alert.risk_score}/100
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-semibold text-green-900">Account Secure</p>
                              <p className="text-sm text-green-700">No suspicious activity detected</p>
                              <p className="text-xs text-green-600 mt-1">AI monitoring active 24/7</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <VoiceNavigation currentPage="Dashboard" />
    </div>
  )
}
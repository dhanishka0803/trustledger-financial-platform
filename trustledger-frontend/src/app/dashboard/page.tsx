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
  const router = useRouter()

  useEffect(() => {
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

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // For new users, set default empty state
      const isNewUser = localStorage.getItem('isNewUser') === 'true'
      if (isNewUser) {
        setStats({
          net_balance: 0,
          total_income: 0,
          total_transactions: 0,
          avg_transaction: 0,
          daily_spending: [],
          categories: {}
        })
        setFraudStats({
          average_risk_score: 0,
          high_risk_count: 0
        })
        setTransactions([])
        setFraudAlerts([])
        setHasTransactions(false)
        localStorage.setItem('hasTransactions', 'false')
        localStorage.removeItem('isNewUser')
        setLoading(false)
        return
      }
      
      // Try to load from API, but don't fail if it doesn't work
      const [statsRes, fraudRes, txnRes, alertsRes] = await Promise.all([
        transactionAPI.getStats(30).catch(() => ({ data: null })),
        fraudAPI.getStats().catch(() => ({ data: null })),
        transactionAPI.getAll({ limit: 10 }).catch(() => ({ data: [] })),
        fraudAPI.getAlerts().catch(() => ({ data: [] })),
      ])
      
      if (statsRes.data) {
        setStats(statsRes.data)
        const hasTxns = statsRes.data.total_transactions > 0
        setHasTransactions(hasTxns)
        localStorage.setItem('hasTransactions', hasTxns ? 'true' : 'false')
      } else {
        // Fallback for when API is not available
        setHasTransactions(false)
        localStorage.setItem('hasTransactions', 'false')
      }
      
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
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
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
              <div className="text-center py-20">
                <div className="mb-8">
                  <img 
                    src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop&crop=center" 
                    alt="Financial growth and analytics" 
                    className="w-64 h-48 object-cover rounded-lg shadow-lg mx-auto mb-6"
                  />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to TRUSTLEDGER</h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start your financial journey with AI-powered fraud detection and real-time transaction monitoring.
                </p>
                <Button 
                  onClick={handleAddTransaction}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Transaction
                </Button>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                  <div className="p-4 bg-white rounded-lg shadow">
                    <Shield className="w-6 h-6 text-teal-600 mb-2" />
                    <h3 className="font-semibold text-gray-900">Fraud Protection</h3>
                    <p className="text-sm text-gray-600">AI-powered detection monitors your transactions 24/7</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow">
                    <Activity className="w-6 h-6 text-teal-600 mb-2" />
                    <h3 className="font-semibold text-gray-900">Real-Time Alerts</h3>
                    <p className="text-sm text-gray-600">Get instant notifications about suspicious activity</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow">
                    <TrendingUp className="w-6 h-6 text-teal-600 mb-2" />
                    <h3 className="font-semibold text-gray-900">Smart Insights</h3>
                    <p className="text-sm text-gray-600">Understand your spending patterns with detailed analytics</p>
                  </div>
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
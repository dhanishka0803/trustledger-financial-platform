'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, AlertTriangle, Activity, Shield, Settings, LogOut, BarChart3, Loader2, Eye, DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

interface Transaction {
  id: string
  user_id: string
  merchant: string
  amount: number
  category: string
  timestamp: string
  fraud_score: number
  risk_level: string
}

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    fraudCases: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalIncome: 0,
    totalExpenses: 0,
    avgTransactionValue: 0
  })

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      const userType = localStorage.getItem('userType')
      
      if (!isLoggedIn || userType !== 'admin') {
        router.push('/login')
        return
      }
      
      loadAdminData()
    }
    
    setTimeout(checkAuth, 300)
  }, [router])

  const loadAdminData = () => {
    try {
      setLoading(true)
      
      // Load all transactions from multiple sources
      const allTransactions: Transaction[] = []
      const users = ['user', 'admin']
      
      // Get all registered users
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      
      users.forEach(userId => {
        const userTransactions = localStorage.getItem(`transactions_${userId}`)
        if (userTransactions) {
          const parsed = JSON.parse(userTransactions)
          allTransactions.push(...parsed)
        }
      })
      
      // Also check for general transactions
      const generalTransactions = localStorage.getItem('transactions')
      if (generalTransactions) {
        const parsed = JSON.parse(generalTransactions)
        allTransactions.push(...parsed)
      }
      
      // Add registered users' transactions
      registeredUsers.forEach((user: any) => {
        const userTxns = localStorage.getItem(`transactions_${user.id}`)
        if (userTxns) {
          const parsed = JSON.parse(userTxns)
          allTransactions.push(...parsed)
        }
      })
      
      // Remove duplicates based on id
      const uniqueTransactions = allTransactions.filter((tx, index, self) => 
        index === self.findIndex((t) => t.id === tx.id)
      )
      
      setTransactions(uniqueTransactions)
      
      // Calculate statistics
      const totalTransactions = uniqueTransactions.length
      const totalIncome = uniqueTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = uniqueTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const totalRevenue = totalIncome + totalExpenses
      const fraudCases = uniqueTransactions.filter(t => t.fraud_score > 70).length
      const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
      
      setStats({
        totalUsers: registeredUsers.length + 2, // +2 for demo users
        activeUsers: registeredUsers.length > 0 ? registeredUsers.length : 1,
        fraudCases,
        totalTransactions,
        totalRevenue: Math.abs(totalRevenue),
        totalIncome,
        totalExpenses,
        avgTransactionValue
      })
      
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    try {
      localStorage.clear()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/'
    }
  }

  const handleNavigation = async (path: string) => {
    try {
      setLoading(true)
      await router.push(path)
    } catch (error) {
      console.error('Navigation failed:', error)
      window.location.href = path
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">TRUSTLEDGER Admin</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">System Administration Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadAdminData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Overview</h2>
            <p className="text-gray-600 dark:text-gray-300">Monitor and manage TRUSTLEDGER platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Total Users</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500">Registered users</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Total Transactions</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{stats.totalTransactions}</div>
                <p className="text-xs text-gray-500">All user transactions</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Fraud Cases</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.fraudCases}</div>
                <p className="text-xs text-red-500">{stats.fraudCases > 0 ? 'Requires attention' : 'All clear'}</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Total Volume</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-gray-500">Transaction volume</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats.totalIncome)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  From {transactions.filter(t => t.amount > 0).length} income transactions
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(stats.totalExpenses)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  From {transactions.filter(t => t.amount < 0).length} expense transactions
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <DollarSign className="w-5 h-5 mr-2 text-teal-500" />
                  Net Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stats.totalIncome - stats.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.totalIncome - stats.totalExpenses)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Average: {formatCurrency(stats.avgTransactionValue)} per transaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">All Transactions</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">Monitor all user transactions and fraud scores</p>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Users need to create transactions first</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 dark:text-white">Transaction ID</th>
                        <th className="text-left py-2 dark:text-white">User</th>
                        <th className="text-left py-2 dark:text-white">Merchant</th>
                        <th className="text-right py-2 dark:text-white">Amount</th>
                        <th className="text-center py-2 dark:text-white">Risk Score</th>
                        <th className="text-center py-2 dark:text-white">Risk Level</th>
                        <th className="text-left py-2 dark:text-white">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 20).map((transaction, index) => (
                        <tr key={transaction.id || index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-2 font-mono text-xs dark:text-gray-300">
                            {transaction.id || `TXN${index + 1}`}
                          </td>
                          <td className="py-2 dark:text-gray-300">
                            {transaction.user_id || 'User'}
                          </td>
                          <td className="py-2 dark:text-gray-300">
                            {transaction.merchant}
                          </td>
                          <td className={`py-2 text-right font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              transaction.fraud_score >= 90 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              transaction.fraud_score >= 70 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              transaction.fraud_score >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {transaction.fraud_score || 0}/100
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              transaction.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                              transaction.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                              transaction.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {transaction.risk_level || 'low'}
                            </span>
                          </td>
                          <td className="py-2 text-xs text-gray-500 dark:text-gray-400">
                            {transaction.timestamp ? new Date(transaction.timestamp).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length > 20 && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Showing 20 of {transactions.length} transactions
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Volume:</span>
                    <span className="font-semibold dark:text-white">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Avg Transaction:</span>
                    <span className="font-semibold dark:text-white">{formatCurrency(stats.avgTransactionValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Count:</span>
                    <span className="font-semibold dark:text-white">{stats.totalTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Fraud Rate:</span>
                    <span className="font-semibold text-red-600">
                      {stats.totalTransactions > 0 ? ((stats.fraudCases / stats.totalTransactions) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => handleNavigation('/fraud')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                  Review Fraud Cases
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleNavigation('/transactions')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                  View All Transactions
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleNavigation('/reports')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                  Financial Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
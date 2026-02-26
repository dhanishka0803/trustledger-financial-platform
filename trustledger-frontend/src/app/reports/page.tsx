'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Calendar, TrendingUp, Brain, Plus, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { transactionAPI, aiAPI } from '@/lib/api'

export default function Reports() {
  const [hasReports, setHasReports] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      setLoading(true)
      const [statsRes, insightsRes] = await Promise.all([
        transactionAPI.getStats(90).catch(() => ({ data: null })),
        aiAPI.getInsights().catch(() => ({ data: null }))
      ])
      
      if (statsRes.data && statsRes.data.total_transactions > 0) {
        setHasReports(true)
        setStats(statsRes.data)
      }
      
      if (insightsRes.data) {
        setInsights(insightsRes.data)
      }
    } catch (err) {
      console.error('Failed to load reports data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Generate monthly data from real transactions
  const generateMonthlyData = () => {
    if (!stats || !stats.daily_spending || stats.daily_spending.length === 0) {
      return [
        { month: 'No Data', income: 0, expenses: 0 },
      ]
    }

    // Group by month
    const monthlyData: Record<string, { income: number; expenses: number }> = {}
    
    stats.daily_spending.forEach((day: any) => {
      const date = new Date(day.date)
      const monthKey = date.toLocaleDateString('en-IN', { month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 }
      }
      monthlyData[monthKey].expenses += day.amount || 0
    })

    // Add income data if available
    if (stats.total_income > 0) {
      const months = Object.keys(monthlyData)
      const avgIncome = stats.total_income / Math.max(months.length, 1)
      months.forEach(month => {
        monthlyData[month].income = avgIncome
      })
    }

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: Math.round(data.income),
      expenses: Math.round(data.expenses)
    }))
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Activity className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading your reports...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {!hasReports ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Reports Yet</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Start making transactions to generate your AI-powered financial reports.
                </p>
                <Button 
                  onClick={() => window.location.href = '/transactions'}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transactions
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Financial Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your financial summary - Last 90 days
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="hidden md:block">
                      <img 
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=120&fit=crop&crop=center" 
                        alt="Financial reports and analytics" 
                        className="w-32 h-20 object-cover rounded-lg shadow-md"
                      />
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                      <Brain className="w-5 h-5" />
                      <span className="font-semibold">AI Generated</span>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        ₹{stats?.total_income?.toLocaleString('en-IN') || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        ₹{stats?.total_expenses?.toLocaleString('en-IN') || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Net Savings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${
                        (stats?.net_balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₹{Math.abs(stats?.net_balance || 0).toLocaleString('en-IN')}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats?.total_transactions || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Income vs Expenses Trend */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Income vs Expenses Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={generateMonthlyData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']} />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income (₹)" />
                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses (₹)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                {stats?.categories && Object.keys(stats.categories).length > 0 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(stats.categories).map(([category, amount]: [string, any], index: number) => (
                          <div key={category} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{category}</p>
                            <p className="text-lg font-bold text-gray-900">
                              ₹{Math.round(amount).toLocaleString('en-IN')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Financial Insights */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>AI Financial Insights</CardTitle>
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights ? (
                        <>
                          {insights.savings_rate !== undefined && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-green-900 dark:text-green-200">
                                    Savings Rate: {insights.savings_rate}%
                                  </p>
                                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    {insights.savings_rate >= 20 
                                      ? "Great job! You're saving above the recommended 20%."
                                      : "Try to save at least 20% of your income for better financial health."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {insights.top_category && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                                    Top Spending Category
                                  </p>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    Your highest spending was on {insights.top_category}. 
                                    {insights.top_category === 'Shopping' && ' Consider reviewing your shopping habits.'}
                                    {insights.top_category === 'Food & Dining' && ' Cooking at home more often could save money.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {insights.recommendation && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-purple-900 dark:text-purple-200">
                                    AI Recommendation
                                  </p>
                                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                                    {insights.recommendation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {stats?.net_balance > 0 ? (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-green-900 dark:text-green-200">Positive Cash Flow</p>
                                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    You're spending less than you earn. Great financial habit!
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-yellow-900 dark:text-yellow-200">Expense Advisory</p>
                                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                    Your expenses exceed your income. Consider reviewing your spending patterns.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-semibold text-blue-900 dark:text-blue-200">Transaction Summary</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                  You made {stats?.total_transactions || 0} transactions in the last 90 days.
                                  Average transaction: ₹{stats?.avg_transaction?.toLocaleString('en-IN') || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

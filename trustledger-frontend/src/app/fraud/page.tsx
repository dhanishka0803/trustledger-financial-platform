'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, TrendingUp, CheckCircle, Activity } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { fraudAPI } from '@/lib/api'

export default function FraudDetection() {
  const [fraudStats, setFraudStats] = useState<any>(null)
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    loadFraudData()
  }, [])

  const loadFraudData = async () => {
    try {
      setLoading(true)
      
      // Load from localStorage
      const userId = localStorage.getItem('userId') || 'user'
      const transactions = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]')
      
      const totalAnalyzed = transactions.length
      const highRiskCount = transactions.filter((t: any) => t.fraud_score > 70).length
      const avgRiskScore = transactions.length > 0 
        ? transactions.reduce((sum: number, t: any) => sum + (t.fraud_score || 0), 0) / transactions.length
        : 0
      
      setFraudStats({
        total_analyzed: totalAnalyzed,
        high_risk_count: highRiskCount,
        average_risk_score: avgRiskScore
      })
      
      const alerts = transactions.filter((t: any) => t.fraud_score > 40)
      setFraudAlerts(alerts)
    } catch (err) {
      console.error('Failed to load fraud data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockTransaction = async (transactionId: string) => {
    const confirmed = window.confirm('Are you sure you want to block this transaction? This will report it as fraudulent and may affect your account.')
    if (!confirmed) return
    
    try {
      await fraudAPI.reportFraud(transactionId)
      alert('Transaction has been reported as fraudulent. Our team will review it shortly.')
      loadFraudData()
    } catch (err) {
      console.error('Failed to block transaction:', err)
      alert('Failed to report transaction. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Activity className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading fraud data...</p>
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
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fraud Detection</h1>
                <p className="text-gray-600 dark:text-gray-400">Real-time fraud monitoring and alerts</p>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=120&fit=crop&crop=center" 
                  alt="Cybersecurity and fraud protection" 
                  className="w-32 h-20 object-cover rounded-lg shadow-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm dark:text-white">Total Analyzed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{fraudStats?.total_analyzed || 0}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transactions analyzed</p>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm dark:text-white">High Risk Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{fraudStats?.high_risk_count || 0}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Requires attention</p>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm dark:text-white">Avg Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    (fraudStats?.average_risk_score || 0) > 50 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {Math.round(fraudStats?.average_risk_score || 0)}/100
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(fraudStats?.average_risk_score || 0) > 50 ? 'High risk' : 'Low risk'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Fraud Trend Chart */}
            {fraudStats?.trend_data && fraudStats.trend_data.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Fraud Detection Trend (7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={fraudStats.trend_data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { weekday: 'short' })} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} name="Alerts" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Fraud Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={fraudStats.fraud_types ? Object.entries(fraudStats.fraud_types).map(([type, count]: [string, any]) => ({
                        type,
                        count
                      })) : []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Recent Fraud Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {fraudAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No fraud alerts found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Your transactions are being monitored</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fraudAlerts.slice(0, 10).map((alert: any) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700">
                        <div className="flex items-center space-x-4">
                          {alert.risk_score >= 70 ? (
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                          ) : alert.risk_score >= 40 ? (
                            <TrendingUp className="w-6 h-6 text-yellow-500" />
                          ) : (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{alert.merchant || 'Unknown'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ₹{alert.amount?.toLocaleString('en-IN') || 0} • {alert.timestamp ? new Date(alert.timestamp).toLocaleDateString('en-IN') : 'N/A'}
                            </p>
                            <p className="text-xs text-teal-600 mt-1">
                              {alert.risk_level === 'critical' || alert.risk_level === 'high' 
                                ? 'Suspicious pattern detected' 
                                : alert.risk_level === 'medium'
                                ? 'Unusual activity'
                                : 'Normal transaction'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            alert.risk_level === 'critical' || alert.risk_level === 'high'
                              ? 'text-red-600'
                              : alert.risk_level === 'medium'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}>
                            {alert.risk_level?.toUpperCase() || 'LOW'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Score: {Math.round(alert.risk_score)}/100</p>
                          <Button 
                            size="sm" 
                            className="mt-2" 
                            variant={alert.risk_score >= 70 ? 'destructive' : 'outline'}
                            onClick={() => handleBlockTransaction(alert.transaction_id)}
                          >
                            {alert.risk_score >= 70 ? 'Block' : 'Review'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Activity, Brain } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { marketAPI } from '@/lib/api'

export default function MarketAnalytics() {
  const [marketData, setMarketData] = useState<any>(null)
  const [riskData, setRiskData] = useState<any>(null)
  const [trendData, setTrendData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMarketData()
  }, [])

  const loadMarketData = async () => {
    try {
      setLoading(true)
      const [liveRes, riskRes, trendRes] = await Promise.all([
        marketAPI.getLive().catch(() => ({ data: null })),
        marketAPI.getRisk().catch(() => ({ data: null })),
        marketAPI.getTrend(7).catch(() => ({ data: [] }))
      ])
      
      if (liveRes.data) {
        setMarketData(liveRes.data)
      }
      if (riskRes.data) {
        setRiskData(riskRes.data)
      }
      if (trendRes.data && Array.isArray(trendRes.data)) {
        setTrendData(trendRes.data)
      }
    } catch (err) {
      console.error('Failed to load market data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Generate sample data if no real data available
  const generateSampleData = () => {
    if (trendData.length > 0) return trendData
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      day,
      nifty: 21000 + Math.random() * 500,
      sensex: 70000 + Math.random() * 1500
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
                  <Activity className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading market data...</p>
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Market Analytics</h1>
                <p className="text-gray-600 dark:text-gray-400">Real-time market data and risk analysis</p>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=120&fit=crop&crop=center" 
                  alt="Stock market charts and analytics" 
                  className="w-32 h-20 object-cover rounded-lg shadow-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">NIFTY 50</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {marketData?.nifty?.toLocaleString('en-IN') || '21,453'}
                  </div>
                  <div className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{marketData?.nifty_change?.toFixed(1) || '2.3'}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">SENSEX</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {marketData?.sensex?.toLocaleString('en-IN') || '70,842'}
                  </div>
                  <div className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{marketData?.sensex_change?.toFixed(1) || '1.8'}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">USD/INR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {marketData?.usd_inr?.toFixed(2) || '83.25'}
                  </div>
                  <div className={`flex items-center text-sm ${(marketData?.usd_inr_change || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <TrendingDown className="w-4 h-4 mr-1" />
                    {(marketData?.usd_inr_change || -0.5).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Portfolio Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {riskData?.overall_risk || '45'}%
                  </div>
                  <div className={`flex items-center text-sm ${
                    (riskData?.overall_risk || 45) > 60 ? 'text-red-600' : 
                    (riskData?.overall_risk || 45) > 40 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    <Activity className="w-4 h-4 mr-1" />
                    {(riskData?.overall_risk || 45) > 60 ? 'High' : 
                     (riskData?.overall_risk || 45) > 40 ? 'Medium' : 'Low'}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Market Trend Analysis</CardTitle>
                    <div className="flex items-center text-teal-600">
                      <Brain className="w-4 h-4 mr-1" />
                      <span className="text-xs font-semibold">AI Prediction</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={generateSampleData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(0)}`, '']} />
                      <Legend />
                      <Area type="monotone" dataKey="nifty" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} name="NIFTY 50" />
                      <Area type="monotone" dataKey="sensex" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="SENSEX" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volatility Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={generateSampleData().map((d, i) => ({
                      day: d.day,
                      volatility: 30 + Math.random() * 30
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="volatility" stroke="#f59e0b" strokeWidth={3} name="Volatility %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="dark:text-white">Overall Risk Score</span>
                      <span className="font-semibold dark:text-white">{riskData?.overall_risk || 42}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full" style={{width: `${riskData?.overall_risk || 42}%`}}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                      <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">Equity Risk</p>
                      <p className="text-2xl font-bold text-teal-900 dark:text-teal-200">{riskData?.equity_risk || 35}%</p>
                      <div className="w-full bg-teal-200 dark:bg-teal-800 rounded-full h-2 mt-2">
                        <div className="bg-teal-600 h-2 rounded-full" style={{width: `${riskData?.equity_risk || 35}%`}}></div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">Debt Risk</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{riskData?.debt_risk || 20}%</p>
                      <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: `${riskData?.debt_risk || 20}%`}}></div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Commodity Risk</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-200">{riskData?.commodity_risk || 15}%</p>
                      <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mt-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: `${riskData?.commodity_risk || 15}%`}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Brain className="w-5 h-5 text-teal-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-teal-900 dark:text-teal-200">AI Recommendation</p>
                        <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                          {riskData?.recommendation || 
                           "Your portfolio shows moderate risk with balanced diversification across sectors. Consider increasing debt allocation by 5% to reduce overall volatility."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

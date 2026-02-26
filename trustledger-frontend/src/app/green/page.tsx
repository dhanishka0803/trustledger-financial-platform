'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, TrendingDown, Award, Brain } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function GreenFinance() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Green Finance</h1>
                <p className="text-gray-600 dark:text-gray-400">Track your carbon footprint and eco-friendly spending</p>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&h=120&fit=crop&crop=center" 
                  alt="Sustainable finance and green energy" 
                  className="w-32 h-20 object-cover rounded-lg shadow-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Carbon Footprint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">2.4 kg</div>
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    -8% this month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Eco Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">42</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">17% of total</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Trees Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Equivalent impact</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Green Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">78/100</div>
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <Award className="w-4 h-4 mr-1" />
                    Eco Champion
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Carbon Footprint Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={[
                      { month: 'Jan', carbon: 3.2 },
                      { month: 'Feb', carbon: 2.9 },
                      { month: 'Mar', carbon: 2.7 },
                      { month: 'Apr', carbon: 2.5 },
                      { month: 'May', carbon: 2.6 },
                      { month: 'Jun', carbon: 2.4 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="carbon" stroke="#10b981" strokeWidth={3} name="Carbon (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spending by Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Eco-Friendly', value: 35, color: '#10b981' },
                          { name: 'Neutral', value: 45, color: '#3b82f6' },
                          { name: 'High Impact', value: 20, color: '#ef4444' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Eco-Friendly', value: 35, color: '#10b981' },
                          { name: 'Neutral', value: 45, color: '#3b82f6' },
                          { name: 'High Impact', value: 20, color: '#ef4444' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Eco Recommendations</CardTitle>
                  <div className="flex items-center text-green-600">
                    <Brain className="w-5 h-5 mr-2" />
                    <span className="text-sm font-semibold">AI Powered</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Leaf className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-200">Switch to Public Transport</p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        You spent ₹4,200 on fuel this month. Using metro could save ₹2,800 and reduce 15kg CO2.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Leaf className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-200">Choose Eco-Friendly Brands</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        42% of your shopping is from high-impact brands. Switch to eco-certified alternatives.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-purple-900 dark:text-purple-200">Green Achievement Unlocked!</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        You've reduced your carbon footprint by 8% this month. Keep it up!
                      </p>
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

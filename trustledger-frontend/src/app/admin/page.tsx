'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, AlertTriangle, Activity, Shield, Settings, LogOut, BarChart3, Loader2 } from 'lucide-react'

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeUsers: 891,
    fraudCases: 23,
    totalTransactions: 45678
  })

  useEffect(() => {
    // Check authentication after a small delay
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      const userType = localStorage.getItem('userType')
      
      console.log('Admin auth check:', { isLoggedIn, userType })
      
      if (!isLoggedIn || userType !== 'admin') {
        console.log('Admin auth failed, redirecting to login')
        router.push('/login')
      } else {
        console.log('Admin auth successful')
      }
    }
    
    setTimeout(checkAuth, 300)
  }, [router])

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
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TRUSTLEDGER Admin</h1>
              <p className="text-sm text-gray-600">System Administration Panel</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">System Overview</h2>
            <p className="text-gray-600">Monitor and manage TRUSTLEDGER platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-gray-500">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-gray-500">71.5% of total users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fraud Cases</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.fraudCases}</div>
                <p className="text-xs text-red-500">Requires attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
                <p className="text-xs text-gray-500">+8.2% from yesterday</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">View and manage user accounts</p>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => alert('User management feature - View all registered users, manage accounts, and monitor user activity.')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                  Manage Users
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fraud Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Review fraud alerts and cases</p>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => handleNavigation('/fraud')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                  Review Cases
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Configure system parameters</p>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => alert('System settings - Configure fraud detection thresholds, notification settings, and system parameters.')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
                  System Config
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">High-risk transaction detected</p>
                      <p className="text-sm text-gray-600">User ID: 1247 - Amount: ₹50,000</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-teal-600 hover:bg-teal-700" 
                    onClick={() => alert('Fraud case details: High-risk transaction of ₹50,000 detected. User ID: 1247. Requires manual review.')}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Review'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">New user registration</p>
                      <p className="text-sm text-gray-600">User: demo@trustledger.com</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => alert('User details: New user demo@trustledger.com registered successfully. Account status: Active.')}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'View'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">System health check passed</p>
                      <p className="text-sm text-gray-600">All services operational</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => alert('System status: All services operational. Last health check: ' + new Date().toLocaleString())}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Details'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  Filter,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Utensils,
  Car,
  Film,
  Home,
  Zap,
  Heart,
  Briefcase,
  MoreHorizontal,
  Trash2,
  AlertTriangle,
  Shield
} from 'lucide-react'
import { transactionAPI, fraudAPI } from '@/lib/api'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const categoryIcons: Record<string, any> = {
  'Shopping': ShoppingCart,
  'Food & Dining': Utensils,
  'Transport': Car,
  'Entertainment': Film,
  'Groceries': Home,
  'Investment': Briefcase,
  'Utilities': Zap,
  'Fuel': Zap,
  'Transfer': ArrowUpCircle,
  'Insurance': Heart,
  'Healthcare': Heart,
  'Income': DollarSign,
  'Other': MoreHorizontal,
}

const categories = [
  'Shopping',
  'Food & Dining', 
  'Transport',
  'Entertainment',
  'Groceries',
  'Investment',
  'Utilities',
  'Fuel',
  'Transfer',
  'Insurance',
  'Healthcare',
  'Income',
  'Other'
]

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    category: 'Shopping',
    description: '',
    location: '',
    type: 'expense'
  })
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const response = await transactionAPI.getAll({ limit: 50 })
      setTransactions(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        setMessage({ type: 'error', text: 'Please enter a valid amount' })
        setSubmitting(false)
        return
      }

      const finalAmount = formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount)

      const response = await transactionAPI.create({
        merchant: formData.merchant,
        amount: finalAmount,
        category: formData.category,
        description: formData.description,
        location: formData.location
      })

      if (response.data) {
        setMessage({ type: 'success', text: 'Transaction added successfully!' })
        setFormData({
          merchant: '',
          amount: '',
          category: 'Shopping',
          description: '',
          location: '',
          type: 'expense'
        })
        setShowAddForm(false)
        loadTransactions()
        // Update localStorage to reflect new transaction
        localStorage.setItem('hasTransactions', 'true')
      }
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to add transaction' 
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (transactionId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')
    if (!confirmed) return
    
    try {
      await transactionAPI.delete(transactionId)
      // Show success message
      alert('Transaction deleted successfully!')
      loadTransactions()
    } catch (err) {
      console.error('Failed to delete transaction:', err)
      alert('Failed to delete transaction. Please try again.')
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                <p className="text-gray-600">Manage your financial transactions</p>
              </div>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-teal-700 hover:bg-teal-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>

            {/* Add Transaction Form */}
            {showAddForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  {message && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      message.type === 'success' 
                        ? 'bg-green-50 text-green-800' 
                        : 'bg-red-50 text-red-800'
                    }`}>
                      {message.text}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Transaction Type */}
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={formData.type === 'expense' ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        <ArrowDownCircle className="w-4 h-4 mr-2" />
                        Expense
                      </Button>
                      <Button
                        type="button"
                        variant={formData.type === 'income' ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <ArrowUpCircle className="w-4 h-4 mr-2" />
                        Income
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Merchant / Description</label>
                        <Input
                          placeholder="e.g., Amazon, Swiggy, Salary"
                          value={formData.merchant}
                          onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <Input
                          placeholder="e.g., Mumbai, Online"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                      <Input
                        placeholder="Add any notes..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={submitting}
                        className="bg-teal-700 hover:bg-teal-800"
                      >
                        {submitting ? 'Adding...' : 'Add Transaction'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{totalIncome.toLocaleString('en-IN')}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ₹{totalExpenses.toLocaleString('en-IN')}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Net Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₹{(totalIncome - totalExpenses).toLocaleString('en-IN')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="p-2 border rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading transactions...</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found</p>
                    <p className="text-sm text-gray-400">Add your first transaction to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTransactions.map((transaction: any) => {
                      const IconComponent = categoryIcons[transaction.category] || MoreHorizontal
                      const isIncome = transaction.amount > 0
                      
                      return (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isIncome ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                isIncome ? 'text-green-600' : 'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.merchant}</p>
                              <p className="text-sm text-gray-500">
                                {transaction.category} • {transaction.location || 'N/A'} • {
                                  new Date(transaction.timestamp).toLocaleDateString('en-IN')
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-bold ${
                                isIncome ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {isIncome ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                              </p>
                              {transaction.fraud_score > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Shield className="w-3 h-3 text-blue-500" />
                                  <span className={
                                    transaction.risk_level === 'high' || transaction.risk_level === 'critical'
                                      ? 'text-red-500'
                                      : 'text-gray-500'
                                  }>
                                    Risk: {Math.round(transaction.fraud_score)}/100
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(transaction.transaction_id)}
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
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

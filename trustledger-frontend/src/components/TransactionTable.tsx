'use client'

import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const transactions = [
  {
    id: 'TXN001',
    merchant: 'Amazon India',
    amount: -2499,
    category: 'Shopping',
    time: '2 hours ago',
    riskScore: 15,
    status: 'safe'
  },
  {
    id: 'TXN002',
    merchant: 'Unknown Merchant',
    amount: -15000,
    category: 'Transfer',
    time: '4 hours ago',
    riskScore: 85,
    status: 'high-risk'
  },
  {
    id: 'TXN003',
    merchant: 'Swiggy',
    amount: -450,
    category: 'Food',
    time: '6 hours ago',
    riskScore: 10,
    status: 'safe'
  },
  {
    id: 'TXN004',
    merchant: 'ATM Withdrawal',
    amount: -5000,
    category: 'Cash',
    time: '1 day ago',
    riskScore: 45,
    status: 'medium-risk'
  },
]

export default function TransactionTable() {
  const getRiskBadge = (score: number, status: string) => {
    if (status === 'safe') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Safe</Badge>
    } else if (status === 'medium-risk') {
      return <Badge variant="secondary">Medium Risk</Badge>
    } else {
      return <Badge variant="destructive">High Risk</Badge>
    }
  }

  const getRiskIcon = (status: string) => {
    if (status === 'safe') {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else if (status === 'medium-risk') {
      return <Clock className="w-4 h-4 text-yellow-500" />
    } else {
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3">Transaction ID</th>
            <th className="px-6 py-3">Merchant</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">Time</th>
            <th className="px-6 py-3">Risk Score</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {transaction.id}
              </td>
              <td className="px-6 py-4">{transaction.merchant}</td>
              <td className={`px-6 py-4 font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{Math.abs(transaction.amount).toLocaleString()}
              </td>
              <td className="px-6 py-4">{transaction.category}</td>
              <td className="px-6 py-4 text-gray-500">{transaction.time}</td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  {getRiskIcon(transaction.status)}
                  <span>{transaction.riskScore}/100</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {getRiskBadge(transaction.riskScore, transaction.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
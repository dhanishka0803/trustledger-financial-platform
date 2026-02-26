'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { day: 'Mon', amount: 2400 },
  { day: 'Tue', amount: 1398 },
  { day: 'Wed', amount: 9800 },
  { day: 'Thu', amount: 3908 },
  { day: 'Fri', amount: 4800 },
  { day: 'Sat', amount: 3800 },
  { day: 'Sun', amount: 4300 },
]

export default function SpendingChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`₹${value}`, 'Amount']}
          labelFormatter={(label) => `Day: ${label}`}
        />
        <Bar dataKey="amount" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}
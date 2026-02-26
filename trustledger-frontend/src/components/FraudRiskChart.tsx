'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { time: '00:00', risk: 15 },
  { time: '04:00', risk: 12 },
  { time: '08:00', risk: 25 },
  { time: '12:00', risk: 45 },
  { time: '16:00', risk: 32 },
  { time: '20:00', risk: 23 },
  { time: '24:00', risk: 18 },
]

export default function FraudRiskChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Risk Score']}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="risk" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
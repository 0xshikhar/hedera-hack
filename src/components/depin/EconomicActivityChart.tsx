'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { month: 'Jan', staked: 12, rewards: 2.5, transactions: 45 },
  { month: 'Feb', staked: 18, rewards: 4.2, transactions: 68 },
  { month: 'Mar', staked: 25, rewards: 6.8, transactions: 92 },
  { month: 'Apr', staked: 34, rewards: 9.5, transactions: 128 },
  { month: 'May', staked: 42, rewards: 12.3, transactions: 165 },
  { month: 'Jun', staked: 51, rewards: 15.8, transactions: 203 },
];

export function EconomicActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={mockData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="staked" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="TVL (U2U)" />
        <Area type="monotone" dataKey="rewards" stackId="2" stroke="#10b981" fill="#10b981" name="Rewards Paid (U2U)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

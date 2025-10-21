'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { date: 'Jan', uptime: 98.5, bandwidth: 65, storage: 45 },
  { date: 'Feb', uptime: 99.0, bandwidth: 70, storage: 50 },
  { date: 'Mar', uptime: 99.2, bandwidth: 75, storage: 55 },
  { date: 'Apr', uptime: 99.5, bandwidth: 80, storage: 60 },
  { date: 'May', uptime: 99.3, bandwidth: 85, storage: 65 },
  { date: 'Jun', uptime: 99.7, bandwidth: 88, storage: 70 },
];

export function NetworkHealthChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={mockData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="uptime" stroke="#10b981" name="Uptime %" />
        <Line type="monotone" dataKey="bandwidth" stroke="#3b82f6" name="Bandwidth Util %" />
        <Line type="monotone" dataKey="storage" stroke="#a855f7" name="Storage Util %" />
      </LineChart>
    </ResponsiveContainer>
  );
}

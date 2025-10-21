'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { region: 'Asia', providers: 12, bandwidth: 5200, storage: 48 },
  { region: 'Europe', providers: 8, bandwidth: 3800, storage: 32 },
  { region: 'N. America', providers: 6, bandwidth: 2900, storage: 24 },
  { region: 'S. America', providers: 3, bandwidth: 1200, storage: 12 },
  { region: 'Africa', providers: 2, bandwidth: 800, storage: 8 },
];

export function ProviderDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={mockData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="region" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="providers" fill="#3b82f6" name="Providers" />
        <Bar dataKey="storage" fill="#a855f7" name="Storage (TB)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

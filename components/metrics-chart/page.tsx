// components/MetricsChart.tsx
"use client"

import type { Metric } from "@/app/utils/types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";



export function MetricsChart({ data }: { data: Metric[] }) {
  return (
    <div className="w-full h-[400px]  p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Performance dos Backofficers</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="sellerName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="cotacoes" fill="#3b82f6" name="Cotações" />
          <Bar dataKey="fechamentos" fill="#10b981" name="Fechamentos" />
          <Bar dataKey="servicos" fill="#f59e0b" name="Serviços" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

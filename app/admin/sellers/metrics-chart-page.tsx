'use client';

import type { Metric } from "@/app/utils/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Props = {
  data: Metric[];
};

export function MetricsChart({ data }: Props) {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="sellerName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="cotacoes" fill="#FF3366" />
          <Bar dataKey="fechamentos" fill="#6A4C93" />
          <Bar dataKey="servicos" fill="#2EC4B6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

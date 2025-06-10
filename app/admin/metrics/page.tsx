'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { MetricsChart } from "@/components/metrics-chart/page";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

type Metric = {
  backofficer: string;
  cotacoes: number;
  fechamentos: number;
  servicos: number;
};

const COLORS = [
  "#FF3366", // Vermelho terroso
  "#FF6B35",
  "#E94F37", // Laranja queimado
  "#6A4C93", // Azul vibrante
  "#2EC4B6", // Verde água
  "#3F88C5", // Roxo profundo
  "#F9C22E", // Amarelo ouro
  "#44BBA4", // Turquesa
  "#A63A50", // Vinho
];

export default function Page() {
  const [data, setData] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const startDisplay = start || new Date(new Date().setDate(1)).toISOString().split('T')[0];
  const endDisplay = end || new Date().toISOString().split('T')[0];

  function formatDateToBR(dateStr: string) {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pt-BR");
  }

  const fetchMetrics = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (startDate) params.append("start", startDate);
      if (endDate) params.append("end", endDate);

      const res = await fetch(`/api/v1/metrics?${params.toString()}`, {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error("Falha ao buscar métricas");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err)
      setError("Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMetrics(start, end);
  };

  const generatePieData = (type: keyof Metric) => {
    return data.map(d => ({
      name: d.backofficer,
      value: d[type],
    }));
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-6">Métricas</h1>

          <form onSubmit={handleSubmit} className="flex gap-4 items-end mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Início</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Fim</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Filtrar
            </button>
          </form>

          {loading && <p>Carregando métricas...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {(start || end) && (
            <p className="text-sm text-gray-600 mb-2">
              Exibindo dados de{" "}
              <span className="font-medium">
                {formatDateToBR(startDisplay)}
              </span>{" "}
              até{" "}
              <span className="font-medium">
                {formatDateToBR(endDisplay)}
              </span>
            </p>
          )}

          {!loading && !error && (
            <>
              <MetricsChart data={data} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {["cotacoes", "fechamentos", "servicos"].map((key) => (
    <div key={key} className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-6 mt-20 capitalize text-center">{key}</h2>
      <ResponsiveContainer width="100%" height={350} >
        <PieChart>
          <Pie
            data={generatePieData(key as keyof Metric)}
            dataKey="value"
            nameKey="name"
            cx="50%" // centraliza o gráfico horizontalmente
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            wrapperStyle={{ marginTop: 60 }}
            content={({ payload }) => (
              <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-8">
                {payload?.map((entry, index) => (
                  <li key={`item-${index}`} className="flex items-center gap-2 text-sm">
                    <span
                      className="inline-block w-3 h-3 rounded"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.value}
                  </li>
                ))}
              </ul>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  ))}
</div>

            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

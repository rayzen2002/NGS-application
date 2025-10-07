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

type MetricBackofficer = {
  backofficer: string;
  cotacoes: number;
  fechamentos: number;
  servicos: number;
};

const COLORS = [
  "#FF3366", "#FF6B35", "#E94F37", "#6A4C93", "#2EC4B6",
  "#3F88C5", "#F9C22E", "#44BBA4", "#A63A50",
];

export default function Page() {
  const [data, setData] = useState<MetricBackofficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fullMonth, setFullMonth] = useState(false);

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
      if (fullMonth && startDate) {
        // se "ver mês inteiro" estiver marcado, ajusta para início/fim do mês
        const date = new Date(startDate);
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        params.append("start", firstDay.toISOString().split("T")[0]);
        params.append("end", lastDay.toISOString().split("T")[0]);
      } else {
        if (startDate) params.append("start", startDate);
        if (endDate) params.append("end", endDate);
      }

      const res = await fetch(`/api/v1/metrics?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao buscar métricas");

      const json: MetricBackofficer[] = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [fullMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMetrics(start, end);
  };

  const generatePieData = (type: keyof MetricBackofficer) => {
    return data.map(d => ({
      name: d.backofficer,
      value: d[type],
    }));
  };

  // Mapeia MetricBackofficer para Metric para usar no MetricsChart
  const mappedData = data.map(d => ({
    sellerId: 0,
    sellerName: d.backofficer,
    cotacoes: d.cotacoes,
    fechamentos: d.fechamentos,
    servicos: d.servicos,
    total: d.cotacoes + d.fechamentos + d.servicos,
    taxaConversao: d.fechamentos / (d.cotacoes || 1),
  }));

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
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={fullMonth}
                onChange={() => setFullMonth(!fullMonth)}
                id="fullMonth"
              />
              <label htmlFor="fullMonth" className="text-gray-700 text-sm">Ver mês inteiro</label>
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
              <span className="font-medium">{formatDateToBR(startDisplay)}</span>{" "}
              até{" "}
              <span className="font-medium">{formatDateToBR(endDisplay)}</span>
            </p>
          )}

          {!loading && !error && data.length > 0 && (
            <>
              <MetricsChart data={mappedData} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {["cotacoes", "fechamentos", "servicos"].map(key => (
                  <div key={key} className="flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-6 capitalize text-center">{key}</h2>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={generatePieData(key as keyof MetricBackofficer)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {data.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ marginTop: 60 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && !error && data.length === 0 && (
            <p className="text-gray-600">Nenhum dado encontrado para o período selecionado.</p>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

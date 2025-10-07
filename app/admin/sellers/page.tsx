'use client';

import type { Metric } from "@/app/utils/types";
import { AppSidebar } from "@/components/app-sidebar";
import { MetricsChart } from "@/components/metrics-chart/page";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#FF3366", "#FF6B35", "#E94F37", "#6A4C93", "#2EC4B6", "#3F88C5", "#F9C22E", "#44BBA4", "#A63A50"];

export default function Page() {
  const [data, setData] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [month, setMonth] = useState<number | "">("");
  const [week, setWeek] = useState<number | "">("");
  const [fullMonth, setFullMonth] = useState(false); // <-- Checkbox

  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  function formatDateToBR(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("pt-BR");
  }

  const fetchMetrics = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (startDate) params.append("start", startDate);
      if (endDate) params.append("end", endDate);

      const res = await fetch(`/api/v1/sellers?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao buscar métricas");

      const json: { summary: Metric[]; startDate: string; endDate: string } = await res.json();
      setData(json.summary);
      setStart(json.startDate);
      setEnd(json.endDate);
    } catch (err) {
      console.error(err);
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

    const year = new Date().getFullYear();

    if (month) {
      const firstDayOfMonth = new Date(year, month - 1, 1);

      let startOfPeriod: Date;
      let endOfPeriod: Date;

      if (fullMonth) {
        // Se "Ver mês inteiro" estiver marcado
        startOfPeriod = new Date(year, month - 1, 1);
        endOfPeriod = new Date(year, month, 0); // último dia do mês
      } else if (week) {
        startOfPeriod = new Date(firstDayOfMonth);
        startOfPeriod.setDate(1 + (week - 1) * 7);
        startOfPeriod.setHours(0, 0, 0, 0);

        endOfPeriod = new Date(startOfPeriod);
        endOfPeriod.setDate(startOfPeriod.getDate() + 6);
        endOfPeriod.setHours(23, 59, 59, 999);
      } else {
        // semana atual do mês
        startOfPeriod = new Date();
        endOfPeriod = new Date();
      }

      fetchMetrics(
        startOfPeriod.toISOString().split("T")[0],
        endOfPeriod.toISOString().split("T")[0]
      );
    } else {
      fetchMetrics();
    }
  };

  const generatePieData = (type: keyof Metric) =>
    data.map(d => ({ name: d.sellerName, value: d[type] }));

  const generateTaxaFechamentoData = () =>
    data.map(d => ({ name: d.sellerName, value: d.taxaConversao }));

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-6">Rendimento dos Vendedores</h1>

          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mês</label>
              <select
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                className="border rounded px-3 py-2"
              >
                <option value="">Selecione</option>
                {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Semana do Mês</label>
              <select
                value={week}
                onChange={e => setWeek(Number(e.target.value))}
                className="border rounded px-3 py-2"
                disabled={fullMonth} // desabilita se "ver mês inteiro" estiver marcado
              >
                <option value="">Selecione</option>
                {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fullMonth"
                checked={fullMonth}
                onChange={e => setFullMonth(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="fullMonth" className="text-sm text-gray-700">Ver mês inteiro</label>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Filtrar
            </button>
          </form>

          {start && end && (
            <p className="text-sm text-gray-600 mb-2">
              Exibindo dados de <span className="font-medium">{formatDateToBR(start)}</span> até{" "}
              <span className="font-medium">{formatDateToBR(end)}</span>
            </p>
          )}

          {loading && <p>Carregando métricas...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && data.length > 0 && (
            <>
              <MetricsChart data={data} />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
                {["cotacoes", "fechamentos", "servicos"].map(key => (
                  <div key={key} className="flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-6 capitalize text-center">{key}</h2>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={generatePieData(key as keyof Metric)}
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

                {/* Taxa de fechamento */}
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-6 text-center">Taxa de Fechamento (%)</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={generateTaxaFechamentoData()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                      >
                        {data.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      <Legend wrapperStyle={{ marginTop: 60 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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

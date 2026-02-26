'use client';

import type { Metric } from "@/app/utils/types";
import { AppSidebar } from "@/components/app-sidebar";
import { MetricsChart } from "@/components/metrics-chart/page";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

const COLORS = ["#FF3366", "#FF6B35", "#E94F37", "#6A4C93", "#2EC4B6", "#3F88C5", "#F9C22E", "#44BBA4", "#A63A50"];

// ─── Tipos auxiliares ───────────────────────────────────────────────────────

interface SellerStats extends Metric {
  rankCotacoes: number;
  rankFechamentos: number;
  rankTaxa: number;
  avgCotacoesPorDia: number;
  eficiencia: number; // fechamentos / servicos ratio
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon: React.ReactNode;
  trend?: number; // % de variação (opcional)
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function SummaryCard({ title, value, subtitle, color = "#3F88C5", icon, trend }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className="text-2xl" style={{ color }}>{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-800">{value}</span>
        {trend !== undefined && (
          <span className={`text-sm font-medium mb-1 ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const colors = ["#F9C22E", "#9CA3AF", "#CD7F32"];
  const labels = ["🥇", "🥈", "🥉"];
  if (rank <= 3) return <span className="text-lg">{labels[rank - 1]}</span>;
  return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
}

function PerformanceBadge({ taxa }: { taxa: number }) {
  if (taxa >= 70) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Excelente</span>;
  if (taxa >= 50) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Bom</span>;
  if (taxa >= 30) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Regular</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Atenção</span>;
}

function MiniProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function Page() {
  const [data, setData] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [month, setMonth] = useState<number | "">("");
  const [week, setWeek] = useState<number | "">("");
  const [fullMonth, setFullMonth] = useState(false);

  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"visao-geral" | "ranking" | "graficos" | "radar">("visao-geral");

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

  useEffect(() => { fetchMetrics(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const year = new Date().getFullYear();
    if (month) {
      const firstDayOfMonth = new Date(year, month - 1, 1);
      let startOfPeriod: Date;
      let endOfPeriod: Date;
      if (fullMonth) {
        startOfPeriod = new Date(year, month - 1, 1);
        endOfPeriod = new Date(year, month, 0);
      } else if (week) {
        startOfPeriod = new Date(firstDayOfMonth);
        startOfPeriod.setDate(1 + (week - 1) * 7);
        startOfPeriod.setHours(0, 0, 0, 0);
        endOfPeriod = new Date(startOfPeriod);
        endOfPeriod.setDate(startOfPeriod.getDate() + 6);
        endOfPeriod.setHours(23, 59, 59, 999);
      } else {
        startOfPeriod = new Date();
        endOfPeriod = new Date();
      }
      fetchMetrics(startOfPeriod.toISOString().split("T")[0], endOfPeriod.toISOString().split("T")[0]);
    } else {
      fetchMetrics();
    }
  };

  // ─── Estatísticas derivadas ────────────────────────────────────────────────

  const stats = useMemo<SellerStats[]>(() => {
    if (!data.length) return [];

    const sorted = {
      cotacoes: [...data].sort((a, b) => b.cotacoes - a.cotacoes),
      fechamentos: [...data].sort((a, b) => b.fechamentos - a.fechamentos),
      taxa: [...data].sort((a, b) => b.taxaConversao - a.taxaConversao),
    };

    const totalDays = start && end
      ? Math.max(1, (new Date(end).getTime() - new Date(start).getTime()) / 86400000 + 1)
      : 7;

    return data.map(d => ({
      ...d,
      rankCotacoes: sorted.cotacoes.findIndex(s => s.sellerName === d.sellerName) + 1,
      rankFechamentos: sorted.fechamentos.findIndex(s => s.sellerName === d.sellerName) + 1,
      rankTaxa: sorted.taxa.findIndex(s => s.sellerName === d.sellerName) + 1,
      avgCotacoesPorDia: parseFloat((d.cotacoes / totalDays).toFixed(2)),
      eficiencia: d.servicos > 0 ? parseFloat(((d.fechamentos / d.servicos) * 100).toFixed(1)) : 0,
    }));
  }, [data, start, end]);

  const globalStats = useMemo(() => {
    if (!stats.length) return null;
    const totalCotacoes = stats.reduce((s, d) => s + d.cotacoes, 0);
    const totalFechamentos = stats.reduce((s, d) => s + d.fechamentos, 0);
    const totalServicos = stats.reduce((s, d) => s + d.servicos, 0);
    const taxaGeral = totalCotacoes > 0 ? (totalFechamentos / totalCotacoes) * 100 : 0;
    const avgTaxa = stats.reduce((s, d) => s + d.taxaConversao, 0) / stats.length;
    const melhorTaxa = stats.reduce((best, d) => d.taxaConversao > best.taxaConversao ? d : best, stats[0]);
    const maiorVolume = stats.reduce((best, d) => d.cotacoes > best.cotacoes ? d : best, stats[0]);
    const desvio = Math.sqrt(stats.reduce((s, d) => s + Math.pow(d.taxaConversao - avgTaxa, 2), 0) / stats.length);
    return { totalCotacoes, totalFechamentos, totalServicos, taxaGeral, avgTaxa, melhorTaxa, maiorVolume, desvio };
  }, [stats]);

  const maxCotacoes = useMemo(() => Math.max(...data.map(d => d.cotacoes), 1), [data]);
  const maxFechamentos = useMemo(() => Math.max(...data.map(d => d.fechamentos), 1), [data]);

  const radarData = useMemo(() => {
    if (!stats.length) return [];
    const maxVals = {
      cotacoes: Math.max(...stats.map(s => s.cotacoes), 1),
      fechamentos: Math.max(...stats.map(s => s.fechamentos), 1),
      servicos: Math.max(...stats.map(s => s.servicos), 1),
      taxa: Math.max(...stats.map(s => s.taxaConversao), 1),
    };
    return [
      { subject: "Cotações", ...Object.fromEntries(stats.map(s => [s.sellerName, Math.round((s.cotacoes / maxVals.cotacoes) * 100)])) },
      { subject: "Fechamentos", ...Object.fromEntries(stats.map(s => [s.sellerName, Math.round((s.fechamentos / maxVals.fechamentos) * 100)])) },
      { subject: "Serviços", ...Object.fromEntries(stats.map(s => [s.sellerName, Math.round((s.servicos / maxVals.servicos) * 100)])) },
      { subject: "Taxa Conv.", ...Object.fromEntries(stats.map(s => [s.sellerName, Math.round((s.taxaConversao / maxVals.taxa) * 100)])) },
    ];
  }, [stats]);

  const generatePieData = (key: keyof Metric) => data.map(d => ({ name: d.sellerName, value: d[key] }));

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="p-6 md:p-8 bg-gray-50 min-h-screen">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Desempenho dos Vendedores</h1>
            {start && end && (
              <p className="text-sm text-gray-500 mt-1">
                Período: <span className="font-semibold text-gray-700">{formatDateToBR(start)}</span> → <span className="font-semibold text-gray-700">{formatDateToBR(end)}</span>
              </p>
            )}
          </div>

          {/* Filtros */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mês</label>
                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Todos</option>
                  {["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map((m, i) =>
                    <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Semana</label>
                <select value={week} onChange={e => setWeek(Number(e.target.value))} disabled={fullMonth} className="border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Selecione</option>
                  {[1,2,3,4,5].map(w => <option key={w} value={w}>Semana {w}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={fullMonth} onChange={e => setFullMonth(e.target.checked)} className="h-4 w-4 rounded accent-blue-600" />
                <span className="text-sm text-gray-700">Mês inteiro</span>
              </label>
              <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                Filtrar
              </button>
            </div>
          </form>

          {loading && (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}

          {error && <p className="text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{error}</p>}

          {!loading && !error && data.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p>Nenhum dado encontrado para o período selecionado.</p>
            </div>
          )}

          {!loading && !error && data.length > 0 && globalStats && (
            <>
              {/* KPIs globais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <SummaryCard icon="📋" title="Total de Cotações" value={globalStats.totalCotacoes} subtitle={`Média: ${(globalStats.totalCotacoes / stats.length).toFixed(1)} por vendedor`} color="#3F88C5" />
                <SummaryCard icon="✅" title="Total de Fechamentos" value={globalStats.totalFechamentos} subtitle={`Média: ${(globalStats.totalFechamentos / stats.length).toFixed(1)} por vendedor`} color="#2EC4B6" />
                <SummaryCard icon="📊" title="Taxa de Conv. Geral" value={`${globalStats.taxaGeral.toFixed(1)}%`} subtitle={`Desvio padrão: ${globalStats.desvio.toFixed(1)}%`} color="#6A4C93" />
                <SummaryCard icon="🏆" title="Melhor Taxa" value={`${globalStats.melhorTaxa.taxaConversao.toFixed(1)}%`} subtitle={globalStats.melhorTaxa.sellerName} color="#F9C22E" />
              </div>

              {/* KPIs secundários */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <SummaryCard icon="🔧" title="Total de Serviços" value={globalStats.totalServicos} color="#FF6B35" />
                <SummaryCard icon="📈" title="Maior Volume" value={globalStats.maiorVolume.cotacoes} subtitle={globalStats.maiorVolume.sellerName} color="#FF3366" />
                <SummaryCard icon="⚡" title="Taxa Média" value={`${globalStats.avgTaxa.toFixed(1)}%`} subtitle="Entre todos os vendedores" color="#44BBA4" />
                <SummaryCard icon="👥" title="Vendedores Ativos" value={stats.length} color="#A63A50" />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                {(["visao-geral", "ranking", "graficos", "radar"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
                      activeTab === tab
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {{ "visao-geral": "📊 Visão Geral", ranking: "🏆 Ranking", graficos: "🍕 Gráficos", radar: "🎯 Radar" }[tab]}
                  </button>
                ))}
              </div>

              {/* ── Tab: Visão Geral ── */}
              {activeTab === "visao-geral" && (
                <>
                  <MetricsChart data={data} />

                  {/* Tabela analítica */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 overflow-x-auto">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h2 className="text-lg font-bold text-gray-800">Análise Detalhada por Vendedor</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Comparativo completo com rankings e indicadores de eficiência</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Vendedor</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-center">Cotações</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-center">Fechamentos</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-center">Serviços</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-center">Taxa Conv.</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-center">Cotações/Dia</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-center">Eficiência*</th>
                          <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-center">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats
                          .sort((a, b) => b.taxaConversao - a.taxaConversao)
                          .map((s, idx) => (
                            <tr key={s.sellerName} className={`border-t border-gray-50 hover:bg-blue-50/30 transition-colors ${idx === 0 ? "bg-yellow-50/30" : ""}`}>
                              <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                                <RankBadge rank={idx + 1} />
                                {s.sellerName}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="font-semibold">{s.cotacoes}</div>
                                <MiniProgressBar value={s.cotacoes} max={maxCotacoes} color={COLORS[stats.indexOf(s) % COLORS.length]} />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="font-semibold">{s.fechamentos}</div>
                                <MiniProgressBar value={s.fechamentos} max={maxFechamentos} color={COLORS[stats.indexOf(s) % COLORS.length]} />
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600">{s.servicos}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-bold ${s.taxaConversao >= globalStats.avgTaxa ? "text-emerald-600" : "text-red-500"}`}>
                                  {s.taxaConversao.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-500">{s.avgCotacoesPorDia}</td>
                              <td className="px-4 py-3 text-center text-gray-500">{s.eficiencia}%</td>
                              <td className="px-4 py-3 text-center"><PerformanceBadge taxa={s.taxaConversao} /></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-gray-400 px-6 py-3 border-t border-gray-50">
                      * Eficiência = fechamentos ÷ serviços × 100
                    </p>
                  </div>
                </>
              )}

              {/* ── Tab: Ranking ── */}
              {activeTab === "ranking" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "🏅 Top Cotações", key: "cotacoes" as keyof Metric, color: "#3F88C5", label: "cot." },
                    { title: "🏅 Top Fechamentos", key: "fechamentos" as keyof Metric, color: "#2EC4B6", label: "fech." },
                    { title: "🏅 Top Taxa Conversão", key: "taxaConversao" as keyof Metric, color: "#6A4C93", label: "%" },
                  ].map(({ title, key, color, label }) => {
                    const sorted = [...stats].sort((a, b) => (b[key] as number) - (a[key] as number));
                    const max = sorted[0]?.[key] as number || 1;
                    return (
                      <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h2 className="text-base font-bold text-gray-800">{title}</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {sorted.map((s, i) => (
                            <div key={s.sellerName} className="flex items-center gap-3 px-5 py-3">
                              <RankBadge rank={i + 1} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-700 truncate">{s.sellerName}</div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                  <div className="h-1.5 rounded-full" style={{ width: `${((s[key] as number) / max) * 100}%`, backgroundColor: color }} />
                                </div>
                              </div>
                              <span className="text-sm font-bold ml-2" style={{ color }}>
                                {key === "taxaConversao" ? `${(s[key] as number).toFixed(1)}%` : s[key] as number} <span className="text-xs text-gray-400">{key !== "taxaConversao" ? label : ""}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Barras comparativas */}
                  <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-base font-bold text-gray-800 mb-4">Comparativo: Cotações vs Fechamentos</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="sellerName" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cotacoes" name="Cotações" fill="#3F88C5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="fechamentos" name="Fechamentos" fill="#2EC4B6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="servicos" name="Serviços" fill="#6A4C93" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Dispersão: Taxa vs Volume */}
                  <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-base font-bold text-gray-800 mb-1">Taxa de Conversão Individual</h2>
                    <p className="text-xs text-gray-400 mb-4">Linha pontilhada = média geral ({globalStats.avgTaxa.toFixed(1)}%)</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={[...stats].sort((a,b) => b.taxaConversao - a.taxaConversao)} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="sellerName" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                        <Bar dataKey="taxaConversao" name="Taxa de Conversão" radius={[4, 4, 0, 0]}>
                          {stats.map((s, idx) => (
                            <Cell key={s.sellerName} fill={s.taxaConversao >= globalStats.avgTaxa ? "#2EC4B6" : "#FF3366"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-3 justify-center text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block bg-[#2EC4B6]" /> Acima da média</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block bg-[#FF3366]" /> Abaixo da média</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: Gráficos ── */}
              {activeTab === "graficos" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                  {(["cotacoes", "fechamentos", "servicos"] as const).map(key => (
                    <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center">
                      <h2 className="text-base font-bold mb-4 capitalize text-gray-800">{key}</h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={generatePieData(key)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                            {data.map((_, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ))}

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center">
                    <h2 className="text-base font-bold mb-4 text-gray-800">Taxa de Fechamento (%)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.map(d => ({ name: d.sellerName, value: d.taxaConversao }))}
                          dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                          label={(entry) => `${entry.value.toFixed(1)}%`}
                        >
                          {data.map((_, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ── Tab: Radar ── */}
              {activeTab === "radar" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-base font-bold text-gray-800 mb-1">Radar Comparativo (normalizado 0–100)</h2>
                    <p className="text-xs text-gray-400 mb-4">Cada eixo representa a performance relativa ao melhor do período</p>
                    <ResponsiveContainer width="100%" height={380}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                        {stats.map((s, idx) => (
                          <Radar key={s.sellerName} name={s.sellerName} dataKey={s.sellerName}
                            stroke={COLORS[idx % COLORS.length]} fill={COLORS[idx % COLORS.length]} fillOpacity={0.12} />
                        ))}
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Cards de insight */}
                  <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <h2 className="text-base font-bold text-gray-800 mb-3">💡 Insights do Período</h2>
                      <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2">
                          <span>🏆</span>
                          <span>Melhor taxa de conversão: <strong>{globalStats.melhorTaxa.sellerName}</strong> com {globalStats.melhorTaxa.taxaConversao.toFixed(1)}%</span>
                        </li>
                        <li className="flex gap-2">
                          <span>📋</span>
                          <span>Maior volume de cotações: <strong>{globalStats.maiorVolume.sellerName}</strong> com {globalStats.maiorVolume.cotacoes} cotações</span>
                        </li>
                        <li className="flex gap-2">
                          <span>📊</span>
                          <span>Taxa média do time: <strong>{globalStats.avgTaxa.toFixed(1)}%</strong> (desvio: {globalStats.desvio.toFixed(1)}%)</span>
                        </li>
                        <li className="flex gap-2">
                          <span>⚠️</span>
                          <span>
                            {stats.filter(s => s.taxaConversao < globalStats.avgTaxa).length} vendedor(es) abaixo da média —{" "}
                            <span className="text-orange-600 font-medium">requerem atenção</span>
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span>✅</span>
                          <span>
                            {stats.filter(s => s.taxaConversao >= 70).length} vendedor(es) com performance <span className="text-emerald-600 font-medium">Excelente</span> (≥70%)
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Mini cards por vendedor */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <h2 className="text-base font-bold text-gray-800 mb-3">Resumo Individual</h2>
                      <div className="space-y-3">
                        {[...stats].sort((a, b) => b.taxaConversao - a.taxaConversao).map((s, idx) => (
                          <div key={s.sellerName} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                            <span className="text-lg"><RankBadge rank={idx + 1} /></span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-700">{s.sellerName}</div>
                              <div className="text-xs text-gray-400">{s.cotacoes} cot. · {s.fechamentos} fech. · {s.servicos} serv. · {s.avgCotacoesPorDia}/dia</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-sm font-bold ${s.taxaConversao >= globalStats.avgTaxa ? "text-emerald-600" : "text-red-500"}`}>
                                {s.taxaConversao.toFixed(1)}%
                              </span>
                              <PerformanceBadge taxa={s.taxaConversao} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

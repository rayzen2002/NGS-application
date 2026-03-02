'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ReportRaw {
  id: number;
  seller_id: number;
  started_at: string;
  activity_type: string;
  customer: string;
  additional_info: string;
  seller_name: string;
}

interface AdditionalInfo {
  tipo?: string;
  horario?: string;
  nomeCliente?: string;
  nomeDealer?: string;
  contatoCliente?: string;
  contatoDealer?: string;
  temDealer?: boolean;
  observacoes?: string;
  descricao?: string;
  vendedor?: string;
  data?: string;
  [key: string]: unknown;
}

interface Report extends ReportRaw {
  parsed: AdditionalInfo;
  sellerName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTIVITY_LABELS: Record<string, string> = {
  cotacao: "Cotação",
  fechamento: "Fechamento",
  pos_venda: "Pós-Venda",
  ligacao: "Ligação",
  visita: "Visita",
  whatsapp: "WhatsApp",
  email: "E-mail",
};

const ACTIVITY_ICONS: Record<string, string> = {
  cotacao: "📋",
  fechamento: "✅",
  pos_venda: "🔧",
  ligacao: "📞",
  visita: "🏪",
  whatsapp: "💬",
  email: "📧",
};

const ACTIVITY_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  cotacao:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    hex: "#3b82f6" },
  fechamento: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", hex: "#10b981" },
  pos_venda:  { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  hex: "#8b5cf6" },
  ligacao:    { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     hex: "#0ea5e9" },
  visita:     { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  hex: "#f97316" },
  whatsapp:   { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   hex: "#22c55e" },
  email:      { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    hex: "#f43f5e" },
};

function getColor(type: string) {
  return ACTIVITY_COLORS[type] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", hex: "#6b7280" };
}
function capitalize(name?: string) {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function parseReport(r: ReportRaw): Report {
  let parsed: AdditionalInfo = {};

  if (!r.additional_info) {
    parsed = {};
  } else {
    try {
      const json = JSON.parse(r.additional_info);

      if (typeof json === "object" && json !== null) {
        parsed = json as AdditionalInfo;
      } else {
        // se for número ou string simples
        parsed = { descricao: String(r.additional_info) };
      }
    } catch {
      // se não for JSON válido
      parsed = { descricao: r.additional_info };
    }
  }

  const sellerName =
    parsed.vendedor ??
    `Vendedor ${capitalize(r.seller_name)}`;

  return {
    ...r,
    parsed,
    sellerName,
  };
}

function formatDateBR(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function formatTimeBR(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function isoDate(iso: string) {
  return iso.split("T")[0];
}

// ─── Modal de detalhes ────────────────────────────────────────────────────────

function DetailModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const c = getColor(report.activity_type);
  const p = report.parsed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`${c.bg} px-6 py-5 border-b ${c.border} flex items-start justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ACTIVITY_ICONS[report.activity_type] ?? "📄"}</span>
            <div>
              <h2 className={`text-base font-bold ${c.text}`}>
                {ACTIVITY_LABELS[report.activity_type] ?? report.activity_type}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDateBR(report.started_at)} às {formatTimeBR(report.started_at)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl mt-0.5 transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <Row label="Vendedor" value={report.sellerName} />
          <Row label="Cliente / Empresa" value={report.customer} />

          {p.temDealer ? (
            <>
              <Row label="Dealer" value={p.nomeDealer} />
              <Row label="Contato do Dealer" value={p.contatoDealer} />
            </>
          ) : (
            <>
              {p.nomeCliente && <Row label="Nome do Cliente" value={p.nomeCliente} />}
              {p.contatoCliente && <Row label="Contato do Cliente" value={p.contatoCliente} />}
            </>
          )}

          {p.temDealer !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase w-32 shrink-0">Dealer</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.temDealer ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-gray-50 text-gray-500 border border-gray-100"}`}>
                {p.temDealer ? "🏪 Com Dealer" : "👤 Sem Dealer"}
              </span>
            </div>
          )}

          {(p.descricao || p.observacoes) && (
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase block mb-1.5">Descrição / Observações</span>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed whitespace-pre-wrap border border-gray-100">
                {p.descricao ?? p.observacoes}
              </p>
            </div>
          )}

          <div className="pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-300">ID do registro: #{report.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-semibold text-gray-400 uppercase w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

// ─── Chip de tipo de atividade ────────────────────────────────────────────────

function TypeChip({ type }: { type: string }) {
  const c = getColor(type);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {ACTIVITY_ICONS[type] ?? "📄"} {ACTIVITY_LABELS[type] ?? type}
    </span>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function VisualizadorRelatoriosPage() {
  const hoje = new Date().toISOString().split("T")[0];

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [modoFiltro, setModoFiltro] = useState<"range" | "dia">("dia");
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [diaEspecifico, setDiaEspecifico] = useState(hoje);

  // Seleção
  const [vendedorSelecionado, setVendedorSelecionado] = useState<string | null>(null);
  const [detalheReport, setDetalheReport] = useState<Report | null>(null);

  const fetchReports = async (start: string, end: string) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ start, end });
      const res = await fetch(`/api/v1/sellers/reports?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao buscar relatórios");
      const json: ReportRaw[] = await res.json();
      const parsed = json.map(parseReport);
      setReports(parsed);
      // Seleciona primeiro vendedor por padrão
      const vendedores = [...new Set(parsed.map(r => r.sellerName))];
      if (vendedores.length > 0 && !vendedorSelecionado) setVendedorSelecionado(vendedores[0]);
    } catch (e) {
      setError("Erro ao buscar dados. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const start = modoFiltro === "dia" ? diaEspecifico : dataInicio;
    const end = modoFiltro === "dia" ? diaEspecifico : dataFim;
    fetchReports(start, end);
  }, []);

  const handleFiltrar = () => {
    const start = modoFiltro === "dia" ? diaEspecifico : dataInicio;
    const end = modoFiltro === "dia" ? diaEspecifico : dataFim;
    setVendedorSelecionado(null);
    fetchReports(start, end);
  };

  // ─── Dados derivados ────────────────────────────────────────────────────────

  const vendedores = useMemo(() => [...new Set(reports.map(r => r.sellerName))].sort(), [reports]);

  const reportsFiltradosPorVendedor = useMemo(() =>
    vendedorSelecionado ? reports.filter(r => r.sellerName === vendedorSelecionado) : reports,
    [reports, vendedorSelecionado]
  );

  // Contagem global (todos os vendedores no período)
  const globalStats = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => { counts[r.activity_type] = (counts[r.activity_type] ?? 0) + 1; });
    return counts;
  }, [reports]);

  // Contagem por vendedor selecionado
  const sellerStats = useMemo(() => {
    const counts: Record<string, number> = {};
    reportsFiltradosPorVendedor.forEach(r => { counts[r.activity_type] = (counts[r.activity_type] ?? 0) + 1; });
    return counts;
  }, [reportsFiltradosPorVendedor]);

  // Dados para o gráfico de atividades por vendedor
  const barData = useMemo(() =>
    vendedores.map(v => {
      const r = reports.filter(r => r.sellerName === v);
      const obj: Record<string, string | number> = { name: v.split(" ")[0] };
      r.forEach(a => { obj[a.activity_type] = ((obj[a.activity_type] as number) ?? 0) + 1; });
      return obj;
    }),
    [reports, vendedores]
  );

  const allTypes = useMemo(() => [...new Set(reports.map(r => r.activity_type))], [reports]);

  // Agrupado por data para exibição de linha do tempo
  const reportsPorData = useMemo(() => {
    const map: Record<string, Report[]> = {};
    reportsFiltradosPorVendedor.forEach(r => {
      const d = isoDate(r.started_at);
      if (!map[d]) map[d] = [];
      map[d].push(r);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [reportsFiltradosPorVendedor]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <main className="p-6 md:p-8 bg-slate-50 min-h-screen">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Visualizador de Relatórios</h1>
            <p className="text-sm text-slate-400 mt-1">Consulta e análise das atividades diárias dos vendedores</p>
          </div>

          {/* Painel de filtros */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Toggle modo */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Tipo de filtro</label>
                <div className="flex rounded-xl border border-slate-200 overflow-hidden text-sm">
                  <button
                    onClick={() => setModoFiltro("dia")}
                    className={`px-4 py-2 font-medium transition-colors ${modoFiltro === "dia" ? "bg-slate-800 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                  >
                    Dia específico
                  </button>
                  <button
                    onClick={() => setModoFiltro("range")}
                    className={`px-4 py-2 font-medium transition-colors ${modoFiltro === "range" ? "bg-slate-800 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                  >
                    Intervalo de datas
                  </button>
                </div>
              </div>

              {modoFiltro === "dia" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Data</label>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => { const d = new Date(diaEspecifico); d.setDate(d.getDate()-1); setDiaEspecifico(d.toISOString().split("T")[0]); }} className="px-2 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm">←</button>
                    <input type="date" value={diaEspecifico} onChange={e => setDiaEspecifico(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                    <button onClick={() => { const d = new Date(diaEspecifico); d.setDate(d.getDate()+1); setDiaEspecifico(d.toISOString().split("T")[0]); }} className="px-2 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm">→</button>
                    <button onClick={() => setDiaEspecifico(hoje)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium">Hoje</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">De</label>
                    <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Até</label>
                    <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                </div>
              )}

              <button onClick={handleFiltrar} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors shadow-sm">
                🔍 Buscar
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin h-8 w-8 border-4 border-slate-400 border-t-transparent rounded-full" />
            </div>
          )}

          {error && <p className="text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100 mb-6">{error}</p>}

          {!loading && !error && reports.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-slate-500 font-medium">Nenhum relatório encontrado para o período</p>
            </div>
          )}

          {!loading && !error && reports.length > 0 && (
            <>
              {/* ── Estatísticas globais ── */}
              <section className="mb-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Visão geral do período — todos os vendedores</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 col-span-2 sm:col-span-1">
                    <div className="text-3xl font-bold text-slate-800">{reports.length}</div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">Total de atividades</div>
                  </div>
                  {Object.entries(globalStats).map(([type, count]) => {
                    const c = getColor(type);
                    return (
                      <div key={type} className={`${c.bg} rounded-2xl border ${c.border} p-4`}>
                        <div className={`text-3xl font-bold ${c.text}`}>{count}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-sm">{ACTIVITY_ICONS[type] ?? "📄"}</span>
                          <span className="text-xs text-slate-500 font-medium">{ACTIVITY_LABELS[type] ?? type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ── Gráfico de barras por vendedor ── */}
              {vendedores.length > 1 && (
                <section className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h2 className="text-sm font-bold text-slate-700 mb-4">Atividades por Vendedor</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      {allTypes.map(type => (
                        <Bar key={type} dataKey={type} name={ACTIVITY_LABELS[type] ?? type} stackId="a" fill={getColor(type).hex} radius={[0, 0, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </section>
              )}

              {/* ── Seletor de vendedor ── */}
              <section className="mb-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Selecionar Vendedor</h2>
                <div className="flex flex-wrap gap-2">
                  {vendedores.map(v => (
                    <button
                      key={v}
                      onClick={() => setVendedorSelecionado(v)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        vendedorSelecionado === v
                          ? "bg-slate-800 text-white border-slate-800 shadow-md"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      👤 {v}
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${vendedorSelecionado === v ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {reports.filter(r => r.sellerName === v).length}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* ── Estatísticas do vendedor selecionado ── */}
              {vendedorSelecionado && (
                <section className="mb-6">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Estatísticas — {vendedorSelecionado}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-slate-800 text-white rounded-2xl p-4 col-span-2 sm:col-span-1">
                      <div className="text-3xl font-bold">{reportsFiltradosPorVendedor.length}</div>
                      <div className="text-xs text-slate-300 mt-1 font-medium">Total de atividades</div>
                    </div>
                    {Object.entries(sellerStats).map(([type, count]) => {
                      const c = getColor(type);
                      const total = globalStats[type] ?? 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={type} className={`${c.bg} rounded-2xl border ${c.border} p-4`}>
                          <div className={`text-3xl font-bold ${c.text}`}>{count}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm">{ACTIVITY_ICONS[type] ?? "📄"}</span>
                            <span className="text-xs text-slate-500 font-medium">{ACTIVITY_LABELS[type] ?? type}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">{pct}% do total</div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── Timeline de relatórios ── */}
              {vendedorSelecionado && reportsPorData.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Relatórios detalhados — {vendedorSelecionado}
                  </h2>

                  <div className="space-y-6">
                    {reportsPorData.map(([data, reportsDodia]) => (
                      <div key={data}>
                        {/* Separador de data */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-px flex-1 bg-slate-200" />
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            📅 {formatDateBR(data)}
                          </span>
                          <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        {/* Cards do dia */}
                        <div className="space-y-2">
                          {reportsDodia
                            .sort((a, b) => a.started_at.localeCompare(b.started_at))
                            .map(report => {
                              const c = getColor(report.activity_type);
                              const p = report.parsed;
                              return (
                                <div
                                  key={report.id}
                                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group"
                                >
                                  <div className="flex items-center gap-4 px-5 py-4">
                                    {/* Ícone e hora */}
                                    <div className="flex flex-col items-center gap-0.5 w-10 shrink-0">
                                      <span className="text-2xl">{ACTIVITY_ICONS[report.activity_type] ?? "📄"}</span>
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {p.horario ?? formatTimeBR(report.started_at)}
                                      </span>
                                    </div>

                                    {/* Info principal */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <TypeChip type={report.activity_type} />
                                        {p.temDealer && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                                            🏪 Dealer
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm font-semibold text-slate-800 truncate">{report.customer}</p>
                                      {p.temDealer ? (
                                        <p className="text-xs text-slate-400 mt-0.5">Dealer: {p.nomeDealer ?? "—"}</p>
                                      ) : (
                                        <p className="text-xs text-slate-400 mt-0.5">{p.contatoCliente ?? ""}</p>
                                      )}
                                    </div>

                                    {/* Preview da descrição */}
                                    {(p.descricao ?? p.observacoes) && (
                                      <p className="hidden md:block text-xs text-slate-400 max-w-xs truncate">
                                        {p.descricao ?? p.observacoes}
                                      </p>
                                    )}

                                    {/* Botão lupa */}
                                    <button
                                      onClick={() => setDetalheReport(report)}
                                      className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all group-hover:border-slate-300"
                                      title="Ver detalhes"
                                    >
                                      🔍
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Modal de detalhes */}
        {detalheReport && (
          <DetailModal report={detalheReport} onClose={() => setDetalheReport(null)} />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

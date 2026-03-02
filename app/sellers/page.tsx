'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useRef, useState } from "react";

// ─── Tipos ──────────────────────────────────────────────────────────────────

type TipoAtividade = "cotacao" | "fechamento" | "pos_venda";

interface Atividade {
  id: string;
  tipo: TipoAtividade;
  temDealer: boolean;
  // Sem dealer
  nomeCliente: string;
  contatoCliente: string;
  // Com dealer
  nomeDealer: string;
  contatoDealer: string;
  // Comum
  descricao: string;
  horario: string;
}

interface RelatorioState {
  vendedor: string;
  data: string;
  atividades: Atividade[];
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<TipoAtividade, string> = {
  cotacao: "Cotação",
  fechamento: "Fechamento",
  pos_venda: "Pós-Venda",
};

const TIPO_COLORS: Record<TipoAtividade, { bg: string; text: string; border: string; dot: string }> = {
  cotacao: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  fechamento: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  pos_venda: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
};

const TIPO_ICONS: Record<TipoAtividade, string> = {
  cotacao: "📋",
  fechamento: "✅",
  pos_venda: "🔧",
};

function gerarId() {
  return Math.random().toString(36).slice(2, 10);
}

function atividadeVazia(): Atividade {
  return {
    id: gerarId(),
    tipo: "cotacao",
    temDealer: false,
    nomeCliente: "",
    contatoCliente: "",
    nomeDealer: "",
    contatoDealer: "",
    descricao: "",
    horario: new Date().toTimeString().slice(0, 5),
  };
}

function formatarData(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ─── Componente de Card de Atividade (edição) ─────────────────────────────────

function CardAtividade({
  atividade,
  index,
  onChange,
  onRemove,
}: {
  atividade: Atividade;
  index: number;
  onChange: (id: string, field: keyof Atividade, value: string | boolean) => void;
  onRemove: (id: string) => void;
}) {
  const c = TIPO_COLORS[atividade.tipo];
  return (
    <div className={`rounded-2xl border-2 ${c.border} ${c.bg} p-5 relative transition-all`}>
      {/* Header do card */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xl">{TIPO_ICONS[atividade.tipo]}</span>
        <span className="text-sm font-bold text-gray-500">Atividade #{index + 1}</span>

        {/* Tipo */}
        <div className="flex gap-1">
          {(["cotacao", "fechamento", "pos_venda"] as TipoAtividade[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onChange(atividade.id, "tipo", t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                atividade.tipo === t
                  ? `${TIPO_COLORS[t].bg} ${TIPO_COLORS[t].text} ${TIPO_COLORS[t].border} border-2 shadow-sm`
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
              }`}
            >
              {TIPO_ICONS[t]} {TIPO_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Horário */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-gray-400">⏰</span>
          <input
            type="time"
            value={atividade.horario}
            onChange={e => onChange(atividade.id, "horario", e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>

        {/* Remover */}
        <button
          type="button"
          onClick={() => onRemove(atividade.id)}
          className="text-gray-300 hover:text-red-400 transition-colors text-lg ml-1"
          title="Remover atividade"
        >
          ✕
        </button>
      </div>

      {/* Checkbox dealer */}
      <label className="flex items-center gap-2 mb-4 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={atividade.temDealer}
          onChange={e => onChange(atividade.id, "temDealer", e.target.checked)}
          className="h-4 w-4 rounded accent-blue-600"
        />
        <span className="text-sm font-medium text-gray-700">Possui Dealer</span>
        <span className="text-xs text-gray-400">(intermediário/revendedor)</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sem dealer: dados do cliente */}
        {!atividade.temDealer && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome do Cliente *</label>
              <input
                type="text"
                value={atividade.nomeCliente}
                onChange={e => onChange(atividade.id, "nomeCliente", e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contato do Cliente *</label>
              <input
                type="text"
                value={atividade.contatoCliente}
                onChange={e => onChange(atividade.id, "contatoCliente", e.target.value)}
                placeholder="(00) 00000-0000 ou e-mail"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              />
            </div>
          </>
        )}

        {/* Com dealer */}
        {atividade.temDealer && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome do Dealer *</label>
              <input
                type="text"
                value={atividade.nomeDealer}
                onChange={e => onChange(atividade.id, "nomeDealer", e.target.value)}
                placeholder="Ex: Auto Peças Central"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contato do Dealer *</label>
              <input
                type="text"
                value={atividade.contatoDealer}
                onChange={e => onChange(atividade.id, "contatoDealer", e.target.value)}
                placeholder="(00) 00000-0000 ou e-mail"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              />
            </div>
          </>
        )}

        {/* Descrição */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Descrição da Conversa / Pedido de Serviço *
          </label>
          <textarea
            value={atividade.descricao}
            onChange={e => onChange(atividade.id, "descricao", e.target.value)}
            placeholder="Descreva o andamento da conversa, o produto/serviço solicitado, condições, próximos passos..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white resize-y"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Componente de visualização para o PDF ────────────────────────────────────

function RelatorioImprimivel({ relatorio }: { relatorio: RelatorioState }) {
  const cotacoes = relatorio.atividades.filter(a => a.tipo === "cotacao");
  const fechamentos = relatorio.atividades.filter(a => a.tipo === "fechamento");
  const posVenda = relatorio.atividades.filter(a => a.tipo === "pos_venda");
  const comDealer = relatorio.atividades.filter(a => a.temDealer);

  return (
    <div id="relatorio-pdf" className="hidden print:block bg-white text-gray-900 font-sans text-sm p-8">
      {/* Cabeçalho */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatório Diário de Atividades</h1>
        <div className="flex gap-8 mt-2 text-sm text-gray-600">
          <span><strong>Vendedor:</strong> {relatorio.vendedor || "—"}</span>
          <span><strong>Data:</strong> {formatarData(relatorio.data)}</span>
          <span><strong>Total de atividades:</strong> {relatorio.atividades.length}</span>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{cotacoes.length}</div>
          <div className="text-xs text-gray-500 mt-1">Cotações</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{fechamentos.length}</div>
          <div className="text-xs text-gray-500 mt-1">Fechamentos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{posVenda.length}</div>
          <div className="text-xs text-gray-500 mt-1">Pós-Venda</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">{comDealer.length}</div>
          <div className="text-xs text-gray-500 mt-1">Com Dealer</div>
        </div>
      </div>

      {/* Atividades */}
      <h2 className="text-base font-bold mb-3 text-gray-800">Detalhamento das Atividades</h2>
      <div className="space-y-4">
        {relatorio.atividades.map((a, i) => (
          <div key={a.id} className="border border-gray-200 rounded-lg p-4 break-inside-avoid">
            <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-2">
              <span className="font-bold text-gray-700">#{i + 1}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                a.tipo === "cotacao" ? "bg-blue-100 text-blue-700"
                : a.tipo === "fechamento" ? "bg-emerald-100 text-emerald-700"
                : "bg-purple-100 text-purple-700"
              }`}>
                {TIPO_LABELS[a.tipo]}
              </span>
              {a.horario && <span className="text-xs text-gray-400">⏰ {a.horario}</span>}
              {a.temDealer && <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700">Com Dealer</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              {!a.temDealer ? (
                <>
                  <div><span className="font-semibold text-gray-500">Cliente:</span> {a.nomeCliente || "—"}</div>
                  <div><span className="font-semibold text-gray-500">Contato:</span> {a.contatoCliente || "—"}</div>
                </>
              ) : (
                <>
                  <div><span className="font-semibold text-gray-500">Dealer:</span> {a.nomeDealer || "—"}</div>
                  <div><span className="font-semibold text-gray-500">Contato Dealer:</span> {a.contatoDealer || "—"}</div>
                </>
              )}
            </div>
            <div className="text-xs">
              <span className="font-semibold text-gray-500">Descrição:</span>
              <p className="mt-1 text-gray-700 leading-relaxed whitespace-pre-wrap">{a.descricao || "—"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div className="border-t border-gray-200 mt-8 pt-4 text-xs text-gray-400 flex justify-between">
        <span>Gerado em {new Date().toLocaleString("pt-BR")}</span>
        <span>Relatório diário — uso interno</span>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function RelatorioVendedoresPage() {
  const hoje = new Date().toISOString().split("T")[0];

  const [relatorio, setRelatorio] = useState<RelatorioState>({
    vendedor: "",
    data: hoje,
    atividades: [],
  });

  const [filtroData, setFiltroData] = useState<string>(hoje);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvoCom, setSalvoCom] = useState<string | null>(null);

  // Carrega do localStorage ao mudar a data do filtro
  useEffect(() => {
    const key = `relatorio_${filtroData}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setRelatorio(JSON.parse(stored));
      } catch {
        setRelatorio({ vendedor: "", data: filtroData, atividades: [] });
      }
    } else {
      setRelatorio({ vendedor: "", data: filtroData, atividades: [] });
    }
    setModoVisualizacao(false);
  }, [filtroData]);

  const salvarRelatorio = async () => {
  try {
    if (!relatorio.vendedor.trim()) {
      alert("Informe o nome do vendedor.");
      return;
    }

    if (relatorio.atividades.length === 0) {
      alert("Adicione pelo menos uma atividade antes de salvar.");
      return;
    }

    setSalvando(true);

    const response = await fetch("/api/v1/sellers/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(relatorio),
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar no servidor");
    }

    // Mantém localStorage se quiser histórico local
    const key = `relatorio_${relatorio.data}`;
    localStorage.setItem(key, JSON.stringify(relatorio));

    setSalvoCom(new Date().toLocaleTimeString("pt-BR"));
    setTimeout(() => setSalvoCom(null), 3000);

  } catch (error) {
    console.error(error);
    alert("Erro ao salvar relatório no servidor.");
  } finally {
    setSalvando(false);
  }
};

  const exportarPDF = () => {
    window.print();
  };

  const adicionarAtividade = () => {
    setRelatorio(r => ({
      ...r,
      atividades: [...r.atividades, atividadeVazia()],
    }));
  };

  const alterarAtividade = (id: string, field: keyof Atividade, value: string | boolean) => {
    setRelatorio(r => ({
      ...r,
      atividades: r.atividades.map(a =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }));
  };

  const removerAtividade = (id: string) => {
    setRelatorio(r => ({
      ...r,
      atividades: r.atividades.filter(a => a.id !== id),
    }));
  };

  const moverAtividade = (id: string, direcao: "up" | "down") => {
    setRelatorio(r => {
      const idx = r.atividades.findIndex(a => a.id === id);
      if (idx < 0) return r;
      const novas = [...r.atividades];
      const dest = direcao === "up" ? idx - 1 : idx + 1;
      if (dest < 0 || dest >= novas.length) return r;
      [novas[idx], novas[dest]] = [novas[dest], novas[idx]];
      return { ...r, atividades: novas };
    });
  };

  const cotacoes = relatorio.atividades.filter(a => a.tipo === "cotacao").length;
  const fechamentos = relatorio.atividades.filter(a => a.tipo === "fechamento").length;
  const posVenda = relatorio.atividades.filter(a => a.tipo === "pos_venda").length;

  return (
    <SidebarProvider>
      <SidebarInset>
        <SiteHeader />

        {/* Conteúdo imprimível (só aparece no print) */}
        <RelatorioImprimivel relatorio={relatorio} />

        {/* Interface principal (oculta no print) */}
        <main className="p-6 md:p-8 bg-gray-50 min-h-screen print:hidden">

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relatório Diário</h1>
              <p className="text-sm text-gray-500 mt-0.5">Registro de atividades do vendedor por dia</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setModoVisualizacao(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                {modoVisualizacao ? "✏️ Editar" : "👁️ Visualizar"}
              </button>
              <button
                onClick={salvarRelatorio}
                disabled={salvando}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {salvando ? "⏳ Salvando..." : "💾 Salvar"}
              </button>
              <button
                onClick={exportarPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 transition-colors shadow-sm"
              >
                🖨️ Exportar PDF
              </button>
            </div>
          </div>

          {salvoCom && (
            <div className="mb-4 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
              ✅ Relatório salvo às {salvoCom}
            </div>
          )}

          {/* Filtro de data */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Selecionar Data</label>
                <input
                  type="date"
                  value={filtroData}
                  onChange={e => setFiltroData(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome do Vendedor</label>
                <input
                  type="text"
                  value={relatorio.vendedor}
                  onChange={e => setRelatorio(r => ({ ...r, vendedor: e.target.value }))}
                  placeholder="Seu nome completo"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[220px]"
                />
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => {
                    const d = new Date(filtroData);
                    d.setDate(d.getDate() - 1);
                    setFiltroData(d.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm"
                  title="Dia anterior"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setFiltroData(hoje)}
                  className="px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 text-sm"
                >
                  Hoje
                </button>
                <button
                  onClick={() => {
                    const d = new Date(filtroData);
                    d.setDate(d.getDate() + 1);
                    setFiltroData(d.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm"
                  title="Próximo dia"
                >
                  Próximo →
                </button>
              </div>
            </div>
          </div>

          {/* Resumo do dia */}
          {relatorio.atividades.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Cotações", value: cotacoes, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: "📋" },
                { label: "Fechamentos", value: fechamentos, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: "✅" },
                { label: "Pós-Venda", value: posVenda, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", icon: "🔧" },
                { label: "Total", value: relatorio.atividades.length, color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-100", icon: "📊" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} ${s.border} border rounded-2xl p-4 flex flex-col gap-1`}>
                  <span className="text-xl">{s.icon}</span>
                  <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Modo visualização */}
          {modoVisualizacao && relatorio.atividades.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    Relatório de {formatarData(relatorio.data)}
                    {relatorio.vendedor && ` — ${relatorio.vendedor}`}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">{relatorio.atividades.length} atividade(s) registrada(s)</p>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {relatorio.atividades.map((a, i) => {
                  const c = TIPO_COLORS[a.tipo];
                  return (
                    <div key={a.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-400">#{i + 1}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.bg} ${c.text} border ${c.border}`}>
                          {TIPO_ICONS[a.tipo]} {TIPO_LABELS[a.tipo]}
                        </span>
                        {a.horario && <span className="text-xs text-gray-400">⏰ {a.horario}</span>}
                        {a.temDealer && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                            🏪 Com Dealer
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-2">
                        {!a.temDealer ? (
                          <>
                            <div><span className="text-gray-400 text-xs">Cliente:</span> <span className="font-medium">{a.nomeCliente || "—"}</span></div>
                            <div><span className="text-gray-400 text-xs">Contato:</span> <span className="font-medium">{a.contatoCliente || "—"}</span></div>
                          </>
                        ) : (
                          <>
                            <div><span className="text-gray-400 text-xs">Dealer:</span> <span className="font-medium">{a.nomeDealer || "—"}</span></div>
                            <div><span className="text-gray-400 text-xs">Contato Dealer:</span> <span className="font-medium">{a.contatoDealer || "—"}</span></div>
                          </>
                        )}
                      </div>
                      {a.descricao && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 whitespace-pre-wrap">{a.descricao}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modo edição */}
          {!modoVisualizacao && (
            <div className="space-y-4">
              {relatorio.atividades.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-gray-600 font-medium">Nenhuma atividade registrada para este dia</h3>
                  <p className="text-sm text-gray-400 mt-1">Clique em "Adicionar Atividade" para começar</p>
                </div>
              )}

              {relatorio.atividades.map((atividade, idx) => (
                <div key={atividade.id} className="relative">
                  {/* Controles de ordem */}
                  <div className="absolute -left-8 top-4 flex flex-col gap-1 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => moverAtividade(atividade.id, "up")}
                      disabled={idx === 0}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
                      title="Mover para cima"
                    >▲</button>
                    <button
                      onClick={() => moverAtividade(atividade.id, "down")}
                      disabled={idx === relatorio.atividades.length - 1}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
                      title="Mover para baixo"
                    >▼</button>
                  </div>
                  <CardAtividade
                    atividade={atividade}
                    index={idx}
                    onChange={alterarAtividade}
                    onRemove={removerAtividade}
                  />
                </div>
              ))}

              {/* Botão adicionar */}
              <button
                onClick={adicionarAtividade}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-blue-200 text-blue-500 font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all text-sm"
              >
                <span className="text-xl">+</span> Adicionar Atividade
              </button>
            </div>
          )}

          {/* Botões de ação inferiores */}
          {relatorio.atividades.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <button
                onClick={salvarRelatorio}
                disabled={salvando}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {salvando ? "⏳ Salvando..." : "💾 Salvar Relatório"}
              </button>
              <button
                onClick={exportarPDF}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 transition-colors shadow-sm"
              >
                🖨️ Exportar PDF
              </button>
            </div>
          )}
        </main>
      </SidebarInset>

      {/* Estilos de impressão */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #relatorio-pdf, #relatorio-pdf * { visibility: visible; }
          #relatorio-pdf { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>
    </SidebarProvider>
    
  );
}

'use client'

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  User2,
  Users2,
  Link as LinkIcon,
} from "lucide-react";
import clsx from "clsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Fechamento {
  id: number;
  backofficer_id: number;
  backofficer_nome?: string;
  seller_id: number;
  seller_nome?: string;
  started_at: string;
  finished_at: string;
  activity_type: string;
  customer: string;
  trello_card_url?: string;
  dealer_id?: number;
  dealer_nome?: string;
  pagamento?: {
    pago: boolean;
    marcado_por?: number | null;
    marcado_em?: string | null;
    marcado_por_nome?: string | null;
    dealer?: string;
  };
}

export interface FechamentosResponse {
  fechamentos: Fechamento[];
}

export interface Dealer {
  id: number;
  name: string;
}

export default function Page() {
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [filtroPago, setFiltroPago] = useState(false);
  const [filtroPendente, setFiltroPendente] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastFechamento = currentPage * itemsPerPage;
  const indexOfFirstFechamento = indexOfLastFechamento - itemsPerPage;
  const currentFechamentos = fechamentos.slice(indexOfFirstFechamento, indexOfLastFechamento);

  useEffect(() => {
    async function fetchFechamentos() {
      const api = await fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/v1/fechamentos`);
      const apiJson: FechamentosResponse = await api.json();
      setFechamentos(apiJson.fechamentos);
    }
    fetchFechamentos();
  }, []);

  useEffect(() => {
    async function fetchDealers() {
      const api = await fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/v1/dealers/list`);
      const apiJson: { dealers: Dealer[] } = await api.json();
      setDealers(apiJson.dealers);
    }
    fetchDealers();
  }, []);

  async function togglePago(fechamentoId: number, novoStatus: boolean) {
    await fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/v1/fechamentos/pagamentos`, {
      method: "POST",
      body: JSON.stringify({ report_id: fechamentoId, pago: novoStatus }),
      headers: { "Content-Type": "application/json" },
    });

    function atualizarFechamento(item: Fechamento): Fechamento {
      return {
        ...item,
        pagamento: {
          ...item.pagamento,
          pago: true,
        },
      };
    }
    
    setFechamentos((prev) =>
      prev.map((item) => (item.id === fechamentoId ? atualizarFechamento(item) : item))
    );
    
    
  }

  async function updateDealer(fechamentoId: number, dealerId: number) {
    await fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/v1/fechamentos/atualizar-dealer`, {
      method: "POST",
      body: JSON.stringify({ report_id: fechamentoId, dealer_id: dealerId }),
      headers: { "Content-Type": "application/json" },
    });

    const dealerSelecionado = dealers.find((d) => d.id === dealerId);

    setFechamentos((prev) =>
      prev.map((f) =>
        f.id === fechamentoId
          ? {
              ...f,
              dealer_id: dealerId,
              dealer_nome: dealerSelecionado?.name || "",
            }
          : f
      )
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <h1 className="flex text-2xl font-semibold mb-6 items-center justify-center">
            Controle de Fechamentos
          </h1>

          <div className="max-w-3xl w-full mx-auto mb-4 px-4 md:px-0 space-y-2">
            <input
              type="text"
              placeholder="Filtrar por cliente..."
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <div className="flex gap-2">
              <div className="flex gap-4 items-center mb-2 max-w-3xl w-full mx-auto">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filtroPago}
                    onChange={(e) => setFiltroPago(e.target.checked)}
                    className="accent-green-600"
                  />
                  Mostrar apenas pagos
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filtroPendente}
                    onChange={(e) => setFiltroPendente(e.target.checked)}
                    className="accent-red-600"
                  />
                  Mostrar apenas pendentes
                </label>
              </div>

              <div className="flex flex-col flex-1">
                <label htmlFor="inicio" className="text-sm text-gray-600 mb-1">Data início</label>
                <input
                  id="inicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col flex-1">
                <label htmlFor="fim" className="text-sm text-gray-600 mb-1">Data fim</label>
                <input
                  id="fim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 max-w-3xl w-full mx-auto px-4 md:px-0">
            {currentFechamentos
              .filter((f) => {
                const isPago = f.pagamento?.pago ?? false;
                const passaFiltroCliente = f.customer.toLowerCase().includes(filtroCliente.toLowerCase());
                const passaFiltroDataInicio = !dataInicio || new Date(f.started_at) >= new Date(dataInicio);
                const passaFiltroDataFim = !dataFim || new Date(f.finished_at) <= new Date(dataFim);
                const passaFiltroPago = !filtroPago || isPago;
                const passaFiltroPendente = !filtroPendente || !isPago;
                return (
                  passaFiltroCliente &&
                  passaFiltroDataInicio &&
                  passaFiltroDataFim &&
                  passaFiltroPago &&
                  passaFiltroPendente
                );
              })
              .map((fechamento) => {
                const isPago = fechamento.pagamento?.pago ?? false;

                return (
                  <div
                    key={fechamento.id}
                    className={clsx(
                      "flex flex-col gap-4 md:flex-row md:items-center justify-between rounded-xl border px-4 py-3 transition",
                      isPago ? "bg-green-50 border-green-200" : "bg-white hover:bg-gray-50"
                    )}
                  >
                    <div className="flex flex-col gap-1 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-base">
                          #{fechamento.id} — {fechamento.customer}
                        </span>
                        {isPago && (
                          <div className="text-green-600 text-sm font-medium flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Pago
                            </div>
                            {fechamento.pagamento?.marcado_em && (
                              <span className="text-xs text-gray-500">
                                Marcado em {new Date(fechamento.pagamento.marcado_em).toLocaleString()}
                              </span>
                            )}
                            {fechamento.pagamento?.marcado_por && (
                              <span className="text-xs text-gray-500">
                                Por: {fechamento.pagamento.marcado_por_nome || `ID ${fechamento.pagamento.marcado_por}`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <User2 className="w-4 h-4" /> Vendedor: {fechamento.seller_nome}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users2 className="w-4 h-4" /> Backoffice: {fechamento.backofficer_nome}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Início: {new Date(fechamento.started_at).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Fim: {new Date(fechamento.finished_at).toLocaleString()}
                        </div>
                        {fechamento.trello_card_url && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="w-4 h-4" />
                            <a
                              href={fechamento.trello_card_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Trello
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <label className="text-sm text-gray-600">Dealer associado</label>
                      <Select
                        value={fechamento.dealer_id?.toString() || ""}
                        onValueChange={(value) => updateDealer(fechamento.id, Number(value))}
                      >
                        <SelectTrigger className="ldark: text-black font-semibold">
                        <SelectValue placeholder={fechamento.pagamento?.dealer ?? "Selecionar dealer"} />
                        </SelectTrigger>
                        <SelectContent className="dark: bg-blue-600 light:bg-amber-300 ">
                          {dealers.map((dealer) => (
                            <SelectItem key={dealer.id} value={dealer.id.toString()}>
                              {dealer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <label className="text-sm text-gray-600">Status de pagamento</label>
                      <button
                        onClick={() => togglePago(fechamento.id, !isPago)}
                        className={clsx(
                          "text-sm font-medium px-3 py-2 rounded-md border transition",
                          isPago
                            ? "bg-green-100 border-green-300 text-green-800 hover:bg-green-200 "
                            : "bg-red-100 border-red-300 text-red-800 hover:bg-red-200 "
                        )}
                      >
                        {isPago ? "Desmarcar como pago" : "Marcar como pago"}
                      </button>
                    </div>
                  </div>
                  
                );
              })}
              <div className="flex justify-center items-center mt-4 space-x-2">
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Anterior
  </button>
  <span>
    Página {currentPage} de {Math.ceil(fechamentos.length / itemsPerPage)}
  </span>
  <button
    disabled={currentPage === Math.ceil(fechamentos.length / itemsPerPage)}
    onClick={() => setCurrentPage(currentPage + 1)}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Próxima
  </button>
</div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

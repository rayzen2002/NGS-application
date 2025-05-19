/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Header } from "@/components/header/page";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


type UserPayload = {
  id: number;
  name: string;
  role: string;
};

type Seller = {
  id: number;
  name: string;
};
type Dado = Record<string, any>

const getVendedores = async (): Promise<Record<string, string>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/v1/sellers`);
  const data = await response.json();

  const vendedoresMap: Record<string, string> = {};
  
  // Preenche o mapa de vendedores com seller_id como chave e nome como valor
  data.users.forEach((user: { id: string; name: string }) => {
    vendedoresMap[user.id] = user.name;
  });

  return vendedoresMap;
};

function getCurrentDateTimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export const exportarExcel = async (
  dados: Dado[],
  backofficeName: string // nome do usuário logado
): Promise<void> => {
  // Obtém o mapeamento de vendedores
  const vendedoresMap = await getVendedores();

  const headers: Record<string, string> = {
    started_at: 'Início',
    finished_at: 'Fim',
    seller_id: 'Vendedor',
    seller_name: 'Nome',
    customer: 'Cliente',
    activity_type: 'Atividade',
  };

  const dadosRenomeados = dados.map((dado) => {
    const novoDado: Record<string, any> = {
      Backoffice: backofficeName, // adiciona o campo fixo para todos os registros
    };

    for (const chave in dado) {
      if (chave === 'seller_id') {
        novoDado['Vendedor'] = vendedoresMap[dado[chave]] || 'Desconhecido';
      } else if (
        chave !== 'backofficer_id' &&
        chave !== 'backofficer_user_name'
      ) {
        const novaChave = headers[chave] || chave;
        novoDado[novaChave] = dado[chave];
      }
    }

    return novoDado;
  });

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dadosRenomeados);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório Diário');

  const wbout: ArrayBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([wbout], {
    type: 'application/octet-stream',
  });

  const fileName = `relatorio_diario_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
  saveAs(blob, fileName);
};


// Chave para persistência via localStorage
const STORAGE_KEY = "relatoriosDiarios";

export default function RelatorioForm() {
  const [relatorios, setRelatorios] = useState([
    {
      activity_type: "cotacao",
      started_at: getCurrentDateTimeLocal(),
      finished_at: getCurrentDateTimeLocal(),
      customer: "",
      trello_card_url: "",
      seller_id: "",
    },
  ]);

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [backofficerId, setBackofficerId] = useState<number | null>(null);
  const [backofficerName, setBackofficerName] = useState<string | null>(null);

  
  const [showPreview, setShowPreview] = useState(false);

  const validarFormulario = () => {
    for (let i = 0; i < relatorios.length; i++) {
      const r = relatorios[i];
      if (!r.seller_id) {
        toast(`Selecione um vendedor para a atividade ${i + 1}`);
        return false;
      }
      // Você pode adicionar mais validações aqui se quiser
    }
    return true;
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRelatorios(JSON.parse(saved));
      } catch (err) {
        console.error("Erro ao parsear dados salvos:", err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(relatorios));
  }, [relatorios]);

  // Recupera informações do token e os vendedores
  useEffect(() => {
    const token = Cookies.get("token");
    
    if (token) {
      try {
        const decoded = jwtDecode<UserPayload>(token);
        setBackofficerId(decoded.id);
        setBackofficerName(decoded.name);
      } catch (err) {
        console.error("Erro ao decodificar o token:", err);
      }
    }
    fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/me`)
    .then((res) => res.json())
    .then((data) => setBackofficerName(data.user.username))
    .catch((err) => console.error("Erro ao buscar vendedores:", err));

    fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/v1/sellers?seller_only=true`)
      .then((res) => res.json())
      .then((data) => setSellers(data.users))
      .catch((err) => console.error("Erro ao buscar vendedores:", err));
  }, []);
  

  const addAtividade = () => {
    setRelatorios([
      ...relatorios,
      {
        activity_type: "cotacao",
        started_at: getCurrentDateTimeLocal(),
        finished_at: getCurrentDateTimeLocal(),
        customer: "",
        trello_card_url: "",
        seller_id: "",
      },
    ]);
  };

  const removeAtividade = (index: number) => {
    setRelatorios(relatorios.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...relatorios];
    updated[index][field as keyof typeof updated[number]] = value;
    setRelatorios(updated);
  };

  const handleSubmit = async () => {
    if(!validarFormulario()){
      return;
    }
    const payload = relatorios.map((r) => ({
      backofficer_id: backofficerId,
      backofficer_user_name: backofficerName,
      activity_type: r.activity_type,
      started_at: dayjs(r.started_at).format('DD/MM/YYYY hh:mm'),
      finished_at: dayjs(r.finished_at).format('DD/MM/YYYY hh:mm'),
      customer: r.customer,
      trello_card_url: r.activity_type === "fechamento" ? r.trello_card_url : null,
      seller_id: Number(r.seller_id),
    }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/v1/relatorios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      console.log(payload)
      if (response.ok) {
        toast("Relatório enviado com sucesso!");
        
        await exportarExcel(payload, backofficerName || 'Desconhecido');
        
        

        
        // Limpa o formulário e o armazenamento local
        setRelatorios([
          {
            activity_type: "cotacao",
            started_at: getCurrentDateTimeLocal(),
            finished_at: getCurrentDateTimeLocal(),
            customer: "",
            trello_card_url: "",
            seller_id: "",
          },
        ]);

        localStorage.setItem(STORAGE_KEY, JSON.stringify([{
          activity_type: "cotacao",
          started_at: getCurrentDateTimeLocal(),
          finished_at: getCurrentDateTimeLocal(),
          customer: "",
          trello_card_url: "",
          seller_id: "",
        }]));

        setShowPreview(false);
      } else {
        toast("Erro ao enviar relatório");
      }
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      toast("Erro ao conectar com o servidor");
    }
  };
  
  const generatePreview = () => {
    const previewText = relatorios
      .map((r, i) => {
        // Procurando o vendedor correspondente pelo ID
        const seller = sellers.find((s) => String(s.id) === r.seller_id);
        const sellerName = seller ? seller.name : "Não selecionado";
        
        return `Atividade ${i + 1}:\n Tipo: ${r.activity_type}\n Cliente: ${r.customer}\n Início: ${dayjs(r.started_at).format('DD/MM/YYYY hh:mm')}\n Término: ${dayjs(r.finished_at).format('DD/MM/YYYY hh:mm')}\n Vendedor: ${sellerName}`;
      })
      .join("\n-----------------\n");
    return previewText;
  };
  

  return (
    <div className="px-4 max-w-7xl mx-auto py-6">
      <Header activeTab="relatorios" />

      <h1 className="text-2xl font-semibold mb-6 mt-6">Relatório Diário</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-white">
              <th className="border border-gray-300 p-2">Tipo</th>
              <th className="border border-gray-300 p-2">Cliente</th>
              <th className="border border-gray-300 p-2">Início</th>
              <th className="border border-gray-300 p-2">Término</th>
              <th className="border border-gray-300 p-2">Link Trello</th>
              <th className="border border-gray-300 p-2">Vendedor</th>
              <th className="border border-gray-300 p-2 text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {relatorios.map((r, index) => (
              <tr key={index} className="border border-gray-300">
                <td className="border border-gray-300 p-2 bg-white dark:bg-gray-900">
                  <select
                    value={r.activity_type}
                    onChange={(e) => handleChange(index, "activity_type", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="cotacao">Cotação</option>
                    <option value="fechamento">Fechamento</option>
                    <option value="servico">Serviço</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-2 bg-white dark:bg-gray-900">
                  <input
                    type="text"
                    value={r.customer}
                    onChange={(e) => handleChange(index, "customer", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
                <td className="border border-gray-300 p-2 bg-white dark:bg-gray-900">
                  <input
                    type="datetime-local"
                    value={r.started_at}
                    onChange={(e) => handleChange(index, "started_at", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
                <td className="border border-gray-300 p-2 bg-white dark:bg-gray-900">
                  <input
                    type="datetime-local"
                    value={r.finished_at}
                    onChange={(e) => handleChange(index, "finished_at", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
                <td className="border border-gray-300 p-2 bg-white dark:bg-gray-900">
                  {r.activity_type === "fechamento" && (
                    <input
                      type="text"
                      value={r.trello_card_url}
                      onChange={(e) => handleChange(index, "trello_card_url", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </td>
                <td className="border border-gray-300 p-2 bg-white dark:bg-gray-900">
                  <select
                    value={r.seller_id}
                    onChange={(e) => handleChange(index, "seller_id", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Selecione o vendedor</option>
                    {sellers.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        {seller.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 p-2 bg-white dark:bg-gray-900 text-center">
                <button onClick={() => removeAtividade(index)} className="bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-700" > Remover </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={addAtividade}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Adicionar Atividade
        </button>
        
        <button
          onClick={() => setShowPreview(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Visualizar Relatório
        </button>
      </div>

      {showPreview && (
        <div className="mt-6  p-4 border border-gray-300 rounded shadow">
          <h3 className="font-semibold text-lg mb-4">Pré-visualização do Relatório</h3>
          <pre>{generatePreview()}</pre>
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setShowPreview(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Fechar Visualização
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Enviar Relatório
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

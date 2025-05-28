"use client";

import { Header } from "@/components/header/page";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { exportarExcel } from "./exportar-excel";

type UserPayload = {
  id: number;
  name: string;
  role: string;
};

type Seller = {
  id: number;
  name: string;
};

function getCurrentDateTimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

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
      aditional_info: "", // <-- campo novo adicionado
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
      // Se quiser validar o aditional_info, pode adicionar aqui
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
        aditional_info: "", // campo novo na nova linha
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
    if (!validarFormulario()) {
      return;
    }
    const payload = relatorios.map((r) => ({
      backofficer_id: backofficerId,
      backofficer_user_name: backofficerName,
      activity_type: r.activity_type,
      started_at: dayjs(r.started_at).format("DD/MM/YYYY HH:mm"),
      finished_at: dayjs(r.finished_at).format("DD/MM/YYYY HH:mm"),
      customer: r.customer,
      trello_card_url: r.activity_type === "fechamento" ? r.trello_card_url : null,
      seller_id: Number(r.seller_id),
      aditional_info: r.aditional_info, // inclui no payload
    }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/v1/relatorios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast("Relatório enviado com sucesso!");

        await exportarExcel(payload, backofficerName || "Desconhecido");

        // Limpa o formulário e o armazenamento local
        setRelatorios([
          {
            activity_type: "cotacao",
            started_at: getCurrentDateTimeLocal(),
            finished_at: getCurrentDateTimeLocal(),
            customer: "",
            trello_card_url: "",
            seller_id: "",
            aditional_info: "",
          },
        ]);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([
            {
              activity_type: "cotacao",
              started_at: getCurrentDateTimeLocal(),
              finished_at: getCurrentDateTimeLocal(),
              customer: "",
              trello_card_url: "",
              seller_id: "",
              aditional_info: "",
            },
          ])
        );

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

        return `Atividade ${i + 1}:\n Tipo: ${r.activity_type}\n Cliente: ${r.customer}\n Início: ${dayjs(r.started_at).format(
          "DD/MM/YYYY HH:mm"
        )}\n Término: ${dayjs(r.finished_at).format("DD/MM/YYYY HH:mm")}\n Vendedor: ${sellerName}\n OBSERVAÇÃO/VALORES: ${r.aditional_info}`;
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
              <th className="border border-gray-300 p-2">OBSERVAÇÃO/VALORES</th> 
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
                    placeholder="Nome do cliente"
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
                  <input
                    type="url"
                    value={r.trello_card_url}
                    onChange={(e) => handleChange(index, "trello_card_url", e.target.value)}
                    disabled={r.activity_type !== "fechamento"}
                    placeholder="URL do card Trello"
                    className={`w-full p-2 border border-gray-300 rounded bg-white dark:bg-gray-900 dark:text-white ${
                      r.activity_type !== "fechamento" ? "opacity-50 cursor-not-allowed" : ""
                    } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  />
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
                {/* Coluna nova */}
                <td className="border border-gray-300 p-2 bg-white dark:bg-gray-900">
                  <input
                    type="text"
                    value={r.aditional_info}
                    onChange={(e) => handleChange(index, "aditional_info", e.target.value)}
                    placeholder="Observação ou valores"
                    className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>

                <td className="border border-gray-300 p-2 text-center bg-white dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={() => removeAtividade(index)}
                    className="px-3 py-1 text-red-600 hover:text-red-900"
                    title="Remover atividade"
                  >
                    <p className="text-2xl">&times;</p>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={addAtividade}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          type="button"
        >
          Adicionar atividade
        </button>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          type="button"
        >
          {showPreview ? "Esconder prévia" : "Mostrar prévia"}
        </button>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          type="button"
        >
          Enviar relatório
        </button>
      </div>

      {showPreview && (
        <pre className="mt-6 whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded border border-gray-300 dark:border-gray-700">
          {generatePreview()}
        </pre>
      )}
    </div>
  );
}

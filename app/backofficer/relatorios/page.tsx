"use client";

import { Header } from "@/components/header/page";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { exportarExcel } from "./exportar-excel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
      additional_info: "",
    },
  ]);

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [backofficerId, setBackofficerId] = useState<number | null>(null);
  const [backofficerName, setBackofficerName] = useState<string | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const validarFormulario = () => {
    for (let i = 0; i < relatorios.length; i++) {
      const r = relatorios[i];
      if (!r.seller_id) {
        toast(`Selecione um vendedor para a atividade ${i + 1}`);
        return false;
      }
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
        additional_info: "",
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
    setIsDialogOpen(false); // fecha o diálogo ao confirmar

    const payload = relatorios.map((r) => ({
      backofficer_id: backofficerId,
      backofficer_user_name: backofficerName,
      activity_type: r.activity_type,
      started_at: dayjs(r.started_at).format("DD/MM/YYYY HH:mm"),
      finished_at: dayjs(r.finished_at).format("DD/MM/YYYY HH:mm"),
      customer: r.customer,
      trello_card_url: r.activity_type === "fechamento" ? r.trello_card_url : null,
      seller_id: Number(r.seller_id),
      additional_info: r.additional_info,
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

        setRelatorios([
          {
            activity_type: "cotacao",
            started_at: getCurrentDateTimeLocal(),
            finished_at: getCurrentDateTimeLocal(),
            customer: "",
            trello_card_url: "",
            seller_id: "",
            additional_info: "",
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
              additional_info: "",
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
        const seller = sellers.find((s) => String(s.id) === r.seller_id);
        const sellerName = seller ? seller.name : "Não selecionado";

        return (
          `📝 Atividade ${i + 1}\n` +
          `📌 Tipo:           ${r.activity_type}\n` +
          `👤 Cliente:        ${r.customer}\n` +
          `🕒 Início:         ${dayjs(r.started_at).format("DD/MM/YYYY HH:mm")}\n` +
          `🕒 Término:        ${dayjs(r.finished_at).format("DD/MM/YYYY HH:mm")}\n` +
          `🧑‍💼 Vendedor:       ${sellerName}\n` +
          `💬 Observações:    ${r.additional_info}`
        );
      })
      .join("\n--------------------------\n");

    return previewText;
  };

  return (
    <div>
      <Header activeTab="relatorios" />
      <div className="px-4 max-w-7xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6 mt-6">Relatório Diário</h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-sm">
            <thead>
              <tr>
                <th className="border p-2">Tipo</th>
                <th className="border p-2">Cliente</th>
                <th className="border p-2">Início</th>
                <th className="border p-2">Término</th>
                <th className="border p-2">Link Trello</th>
                <th className="border p-2">Vendedor</th>
                <th className="border p-2">OBSERVAÇÃO/VALORES</th>
                <th className="border p-2 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {relatorios.map((r, index) => (
                <tr key={index} className="border">
                  <td className="border p-2">
                    <Select
                      value={r.activity_type}
                      onValueChange={(value) => handleChange(index, "activity_type", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-500">
                        <SelectItem value="cotacao">Cotação</SelectItem>
                        <SelectItem value="fechamento">Fechamento</SelectItem>
                        <SelectItem value="servico">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={r.customer}
                      onChange={(e) => handleChange(index, "customer", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="datetime-local"
                      value={r.started_at}
                      onChange={(e) => handleChange(index, "started_at", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="datetime-local"
                      value={r.finished_at}
                      onChange={(e) => handleChange(index, "finished_at", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={r.trello_card_url}
                      onChange={(e) => handleChange(index, "trello_card_url", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={r.activity_type !== "fechamento"}
                      placeholder={r.activity_type !== "fechamento" ? "Somente para fechamentos" : ""}
                    />
                  </td>
                  <td className="border p-2">
                    <Select
                      value={r.seller_id}
                      onValueChange={(value) => handleChange(index, "seller_id", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o vendedor" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-500">
                        {sellers.map((seller) => (
                          <SelectItem key={seller.id} value={String(seller.id)}>
                            {seller.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={r.additional_info}
                      onChange={(e) => handleChange(index, "additional_info", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      className="text-red-600 hover:text-red-800 font-bold"
                      onClick={() => removeAtividade(index)}
                      type="button"
                    >
                      X
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

          {/* Botão para abrir o AlertDialog */}
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                type="button"
              >
                Enviar Relatório
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-blue-950 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirma o envio?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja enviar o relatório? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {showPreview && (
          <pre className="mt-6 whitespace-pre-wrap p-4 rounded-lg border ">
            {generatePreview()}
          </pre>
        )}
      </div>
    </div>
  );
}


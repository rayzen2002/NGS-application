import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
type Dado = Record<string, unknown>
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
    const novoDado: Record<string, unknown> = {
      Backoffice: backofficeName, // adiciona o campo fixo para todos os registros
    };

    for (const chave in dado) {
      if (chave === 'seller_id') {
        novoDado['Vendedor'] = vendedoresMap[dado[chave] as string] || 'Desconhecido';
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
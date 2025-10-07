import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

type Dado = Record<string, unknown>;

const getVendedores = async (): Promise<Record<string, string>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/v1/sellers-info`);
  const data = await response.json();

  const vendedoresMap: Record<string, string> = {};
  data.users.forEach((user: { id: string; name: string }) => {
    vendedoresMap[user.id] = user.name;
  });

  return vendedoresMap;
};

export const exportarExcel = async (
  dados: Dado[],
  backofficeName: string
): Promise<void> => {
  console.log(dados)
  const vendedoresMap = await getVendedores();

  const headers = [
    { key: 'BACKOFFICER', width: 20 },
    { key: 'SERVIÇO', width: 20 },
    { key: 'CLIENTE', width: 60 },
    { key: 'VENDEDOR', width: 40 },
    { key: 'HORA DE INÍCIO', width: 25 },
    { key: 'HORA DE TÉRMINO', width: 25 },
    { key: 'VALOR/OBSERVAÇÃO', width: 30 }
  ];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Relatório Diário');

  // Define colunas com largura
  worksheet.columns = headers.map(({ key, width }) => ({
    header: key,
    key,
    width
  }));

  // Adiciona dados
  dados.forEach((dado) => {
    const linha = {
      'BACKOFFICER': backofficeName.toUpperCase(),
      'SERVIÇO': String(dado.activity_type || '').toUpperCase(),
      'CLIENTE': String(dado.customer || '').toUpperCase(),
      'VENDEDOR': vendedoresMap[String(dado.seller_id).toUpperCase()] || 'Desconhecido',
      'HORA DE INÍCIO': formatarHora(dado.started_at as string),
      'HORA DE TÉRMINO': formatarHora(dado.finished_at as string),
      'VALOR/OBSERVAÇÃO': String(dado.additional_info || dado.additional_info || '').toUpperCase()
    };
    worksheet.addRow(linha);
  });

  // Estiliza cabeçalho
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }, // Azul escuro
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Centraliza todas as células com dados (incluindo o cabeçalho)
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });

  // Gera o arquivo e salva
  const buffer = await workbook.xlsx.writeBuffer();
  const dataHoje = dayjs().format('DD-MM-YYYY');
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const fileName = `Relatório - ${backofficeName} - ${dataHoje}.xlsx`;
  saveAs(blob, fileName);
};

// Função auxiliar para formatar hora
function formatarHora(dataOriginal: string): string {
  const data = dayjs(dataOriginal, 'DD/MM/YYYY HH:mm', true);
  return data.isValid() ? data.format('HH:mm') : 'Data Inválida';
}

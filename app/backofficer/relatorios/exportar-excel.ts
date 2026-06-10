import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

type Dado = Record<string, unknown>;

function extrairNumeroApolice(link?: unknown): string {
  const url = String(link || '');
  const policyMatch = url.match(/policy\D{0,30}(\d{6,})/i);
  const fallbackMatch = url.match(/\d{6,}/);

  return policyMatch?.[1] || fallbackMatch?.[0] || '';
}

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

export const exportarExcelFechamentosDia = async (
  dados: Dado[],
  backofficeName: string
): Promise<void> => {
  const vendedoresMap = await getVendedores();
  const dataHoje = dayjs().format('DD/MM/YYYY');
  const fechamentosDoDia = dados.filter((dado) => {
    const dataInicio = dayjs(dado.started_at as string, 'DD/MM/YYYY HH:mm', true);

    return (
      String(dado.activity_type || '').toLowerCase() === 'fechamento' &&
      dataInicio.isValid() &&
      dataInicio.format('DD/MM/YYYY') === dataHoje
    );
  });

  const headers = [
    { key: 'BACKOFFICER', width: 20 },
    { key: 'DATA', width: 15 },
    { key: 'NÚMERO DA APÓLICE', width: 25 },
    { key: 'CLIENTE', width: 60 },
    { key: 'VENDEDOR', width: 40 },
    { key: 'INÍCIO', width: 15 },
    { key: 'TÉRMINO', width: 15 },
    { key: 'OBSERVAÇÃO', width: 30 }
  ];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Fechamentos do Dia');

  worksheet.columns = headers.map(({ key, width }) => ({
    header: key,
    key,
    width
  }));

  fechamentosDoDia.forEach((dado) => {
    const linha = {
      'BACKOFFICER': backofficeName.toUpperCase(),
      'DATA': formatarData(dado.started_at as string),
      'NÚMERO DA APÓLICE': extrairNumeroApolice(dado.trello_card_url),
      'CLIENTE': String(dado.customer || '').toUpperCase(),
      'VENDEDOR': vendedoresMap[String(dado.seller_id)] || 'Desconhecido',
      'INÍCIO': formatarHora(dado.started_at as string),
      'TÉRMINO': formatarHora(dado.finished_at as string),
      'OBSERVAÇÃO': String(dado.additional_info || '').toUpperCase()
    };
    worksheet.addRow(linha);
  });

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dataArquivo = dayjs().format('DD-MM-YYYY');
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const fileName = `Fechamentos - ${backofficeName} - ${dataArquivo}.xlsx`;
  saveAs(blob, fileName);
};

// Função auxiliar para formatar hora
function formatarHora(dataOriginal: string): string {
  const data = dayjs(dataOriginal, 'DD/MM/YYYY HH:mm', true);
  return data.isValid() ? data.format('HH:mm') : 'Data Inválida';
}

function formatarData(dataOriginal: string): string {
  const data = dayjs(dataOriginal, 'DD/MM/YYYY HH:mm', true);
  return data.isValid() ? data.format('DD/MM/YYYY') : 'Data Inválida';
}

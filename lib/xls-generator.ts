/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

// Função para exportar os relatórios para XLSX
export function exportToXlsx(reports: any[]) {
  const today = dayjs();
  
  // Formatando o nome do arquivo com a data atual
  const filename = `relatorio-${today.format('DD-MM-YYYY')}.xlsx`;

  const worksheetData = reports.map((r: any) => ({
    Tipo: r.Atividade,
    Cliente: r.Cliente,
    Vendedor: r.Vendedor,
    Backofficer: r.Backofficer,
    Início: new Date(r.Inicio).toLocaleString(),
    Fim: new Date(r.Final).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

  const xlsBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob = new Blob([xlsBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, filename);
}

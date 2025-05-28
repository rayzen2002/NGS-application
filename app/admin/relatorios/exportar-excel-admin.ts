import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Dado {
  Backofficer: string;
  Vendedor: string;
  Cliente: string;
  Atividade: string;
  Inicio: string;  // string ISO UTC com 'Z'
  Final?: string;   // string ISO UTC com 'Z', opcional
  [key: string]: unknown;
}

export const exportarRelatorioCompleto = async (dados: Dado[]): Promise<void> => {
  const fuso = 'America/Sao_Paulo';

  if (!dados || dados.length === 0) {
    console.warn('Nenhum dado para exportar');
    return;
  }

  // Filtra dados válidos
  const dadosValidos = dados.filter(dado =>
    dado.Backofficer && dado.Vendedor && dado.Cliente && dado.Atividade && dado.Inicio
  );

  // Função para formatar data ISO UTC para fuso de SP (hora local)
  const formatarHorario = (dataStr?: string) => {
    if (!dataStr) return '';
    // Parse como UTC e converte para timezone de São Paulo
    const dt = dayjs.utc(dataStr).tz(fuso);
    return dt.isValid() ? dt.format('DD/MM/YYYY HH:mm') : '';
  };

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Relatório Completo');

  worksheet.columns = [
    { header: 'BACKOFFICER', key: 'Backofficer', width: 20 },
    { header: 'VENDEDOR', key: 'Vendedor', width: 20 },
    { header: 'CLIENTE', key: 'Cliente', width: 70 },
    { header: 'SERVIÇO', key: 'Atividade', width: 20 },
    { header: 'HORA DE INÍCIO', key: 'Inicio', width: 25 },
    { header: 'HORA DE TÉRMINO', key: 'Final', width: 25 },
  ];

  worksheet.getRow(1).eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 12,
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  dadosValidos.forEach(dado => {
    worksheet.addRow({
      Backofficer: dado.Backofficer.toUpperCase(),
      Vendedor: dado.Vendedor.toUpperCase(),
      Cliente: dado.Cliente.toUpperCase(),
      Atividade: dado.Atividade.toUpperCase(),
      Inicio: formatarHorario(dado.Inicio),
      Final: formatarHorario(dado.Final),
    });
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { horizontal: 'center', vertical: 'middle' };
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();

  const dataHoje = dayjs().format('DD-MM-YYYY');
  const fileName = `Relatório - Todos Backofficers - ${dataHoje}.xlsx`;
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
};

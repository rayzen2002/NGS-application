import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { eq, gte, lte, and } from "drizzle-orm";
import * as schema from "@/src/db/schema";
import dayjs from "dayjs";

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  // Datas relevantes
  const today = dayjs().endOf("day");
  const startOfMonth = dayjs().startOf("month");
  const startOfLastMonth = dayjs().subtract(1, "month").startOf("month");
  const endOfLastMonth = dayjs().subtract(1, "month").endOf("month");

  try {
    // Fechamentos do mês atual
    const currentMonthClosings = await db
      .select()
      .from(schema.reportsTable)
      .where(
        and(
          eq(schema.reportsTable.activity_type, "fechamento"),
          gte(schema.reportsTable.started_at, startOfMonth.toDate()),
          lte(schema.reportsTable.started_at, today.toDate())
        )
      );

    // Cotações do mês atual
    const currentMonthQuotes = await db
      .select()
      .from(schema.reportsTable)
      .where(
        and(
          eq(schema.reportsTable.activity_type, "cotacao"),
          gte(schema.reportsTable.started_at, startOfMonth.toDate()),
          lte(schema.reportsTable.started_at, today.toDate())
        )
      );

    // Fechamentos do mês anterior
    const lastMonthClosings = await db
      .select()
      .from(schema.reportsTable)
      .where(
        and(
          eq(schema.reportsTable.activity_type, "fechamento"),
          gte(schema.reportsTable.started_at, startOfLastMonth.toDate()),
          lte(schema.reportsTable.started_at, endOfLastMonth.toDate())
        )
      );

    // Cotações do mês anterior
    const lastMonthQuotes = await db
      .select()
      .from(schema.reportsTable)
      .where(
        and(
          eq(schema.reportsTable.activity_type, "cotacao"),
          gte(schema.reportsTable.started_at, startOfLastMonth.toDate()),
          lte(schema.reportsTable.started_at, endOfLastMonth.toDate())
        )
      );

    // Definir a taxa cobrada por serviço
    const TAXA_SERVICO = 150;
    const receita = currentMonthClosings.length * TAXA_SERVICO;

    // Cálculo das porcentagens de aumento/diminuição
    const fechamentoPercentChange =
  lastMonthClosings.length > 0
    ? ((currentMonthClosings.length - lastMonthClosings.length) /
        lastMonthClosings.length) *
      100
    : null; // Indica ausência de dados anteriores

const cotacaoPercentChange =
  lastMonthQuotes.length > 0
    ? ((currentMonthQuotes.length - lastMonthQuotes.length) /
        lastMonthQuotes.length) *
      100
    : null;

const taxaConversao =
  currentMonthQuotes.length > 0
    ? (currentMonthClosings.length / currentMonthQuotes.length) * 100
    : 0;

const taxaConversaoMesAnterior =
  lastMonthQuotes.length > 0
    ? (lastMonthClosings.length / lastMonthQuotes.length) * 100
    : null;

const taxaConversaoPercentChange =
  taxaConversaoMesAnterior !== null
    ? ((taxaConversao - taxaConversaoMesAnterior) / taxaConversaoMesAnterior) *
      100
    : null;


    return NextResponse.json({
      receita,
      fechamentos: {
        total: currentMonthClosings.length,
        variacao: fechamentoPercentChange,
      },
      cotacoes: {
        total: currentMonthQuotes.length,
        variacao: cotacaoPercentChange,
      },
      taxaConversao: {
        atual: taxaConversao, // Agora correta: fechamentos/cotações do mesmo mês
        variacao: taxaConversaoPercentChange,
      },
    });
  } catch (error) {
    console.error("Erro ao obter dados da dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao obter os dados da dashboard" },
      { status: 500 }
    );
  }
}

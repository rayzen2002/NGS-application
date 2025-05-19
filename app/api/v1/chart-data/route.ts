import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Criar pool global para evitar reconectar a cada requisição
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

export async function GET() {
  try {
    // Busca os fechamentos
    const closings = await db
      .select({ started_at: schema.reportsTable.started_at })
      .from(schema.reportsTable)
      .where(eq(schema.reportsTable.activity_type, "fechamento"));

    // Busca as cotações
    const quotes = await db
      .select({ started_at: schema.reportsTable.started_at })
      .from(schema.reportsTable)
      .where(eq(schema.reportsTable.activity_type, "cotacao"));

    // Mapeia os dados para um formato único por data
    const dataMap = new Map<string, { date: string; fechamentos: number; cotacoes: number }>();

    closings.forEach(({ started_at }) => {
      const date = started_at.toISOString().split("T")[0]; // Formata a data YYYY-MM-DD
      if (!dataMap.has(date)) {
        dataMap.set(date, { date, fechamentos: 0, cotacoes: 0 });
      }
      dataMap.get(date)!.fechamentos += 1;
    });

    quotes.forEach(({ started_at }) => {
      const date = started_at.toISOString().split("T")[0];
      if (!dataMap.has(date)) {
        dataMap.set(date, { date, fechamentos: 0, cotacoes: 0 });
      }
      dataMap.get(date)!.cotacoes += 1;
    });

    // Converter o Map em um array para ser usado no gráfico
    const chartData = Array.from(dataMap.values());

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    return NextResponse.json({ error: "Erro ao buscar os dados" }, { status: 500 });
  }
}

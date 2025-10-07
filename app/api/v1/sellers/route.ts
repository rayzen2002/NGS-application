import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { and, eq, gte, lte } from "drizzle-orm";
import { reportsTable, usersTable } from "@/src/db/schema";
import type { Metric } from "@/app/utils/types";

export async function GET(req: Request) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle({ client: pool, schema: { usersTable, reportsTable } });

  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let startDate: Date;
    let endDate: Date;

    if (start && end) {
      // Usa os parâmetros informados
      startDate = new Date(start);
      endDate = new Date(end);
    } else {
      // Caso não venham parâmetros, calcula a semana atual (domingo -> sábado)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Domingo, 6 = Sábado

      // Domingo da semana atual
      startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);

      // Sábado da semana atual
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    // Consulta com o tipo de atividade incluído
    const sellersActivities = await db
      .select({
        sellerId: reportsTable.seller_id,
        sellerName: usersTable.name,
        reportId: reportsTable.id,
        startedAt: reportsTable.started_at,
        finishedAt: reportsTable.finished_at,
        activityType: reportsTable.activity_type,
        customer: reportsTable.customer,
      })
      .from(usersTable)
      .innerJoin(reportsTable, eq(usersTable.id, reportsTable.seller_id))
      .where(
        and(
          eq(usersTable.role, "seller"),
          gte(reportsTable.started_at, startDate),
          lte(reportsTable.finished_at, endDate)
        )
      );

    // Agrupamento e contagem de tipos de atividade
    const summaryBySeller = sellersActivities.reduce((acc, r) => {
      if (!acc[r.sellerId]) {
        acc[r.sellerId] = {
          sellerId: r.sellerId,
          sellerName: r.sellerName,
          cotacoes: 0,
          fechamentos: 0,
          servicos: 0,
          total: 0,
          taxaConversao: 0,
        };
      }

      if (r.activityType === "cotacao") acc[r.sellerId].cotacoes++;
      if (r.activityType === "fechamento") acc[r.sellerId].fechamentos++;
      if (r.activityType === "servico") acc[r.sellerId].servicos++;
      acc[r.sellerId].total++;

      return acc;
    }, {} as Record<number, Metric>);

    // Calcula taxa de conversão
    Object.values(summaryBySeller).forEach((s) => {
      s.taxaConversao =
        s.cotacoes > 0
          ? Number(((s.fechamentos / s.cotacoes) * 100).toFixed(2))
          : 0;
    });

    return NextResponse.json({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: Object.values(summaryBySeller),
    });
  } catch (error) {
    console.error("Erro ao obter os vendedores:", error);
    return NextResponse.json(
      { error: "Erro ao obter os vendedores" },
      { status: 500 }
    );
  }
}

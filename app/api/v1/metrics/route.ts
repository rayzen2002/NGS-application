// app/api/metrics/route.ts
import { NextResponse } from "next/server";
import { eq, gte, lte, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { reportsTable, usersTable } from "@/src/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  let startDate: Date;
  let endDate: Date;

  try {
    // Se datas forem passadas, usa elas. Senão, considera o mês atual.
    if (startParam && endParam) {
      startDate = new Date(startParam);
      endDate = new Date(endParam);
      endDate.setHours(23, 59, 59, 999); // Final do dia
    } else {
      // Default: do início do mês até hoje
      startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date();
    }

    const backofficers = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
      })
      .from(usersTable)
      .where(eq(usersTable.role, "backofficer"));

    const reports = await db
      .select({
        backofficerId: reportsTable.backofficer_id,
        activityType: reportsTable.activity_type,
      })
      .from(reportsTable)
      .where(
        and(
          gte(reportsTable.started_at, startDate),
          lte(reportsTable.started_at, endDate)
        )
      );

    const metrics = backofficers.map((user) => {
      const userReports = reports.filter(r => r.backofficerId === user.id);

      return {
        backofficer: user.name,
        cotacoes: userReports.filter(r => r.activityType === "cotacao").length,
        fechamentos: userReports.filter(r => r.activityType === "fechamento").length,
        servicos: userReports.filter(r => r.activityType === "servico").length,
      };
    });

    return NextResponse.json(metrics);
  } catch (err) {
    console.error("[GET /metrics]", err);
    return new NextResponse("Erro ao buscar métricas", { status: 500 });
  }
}

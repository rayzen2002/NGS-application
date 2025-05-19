import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse } from "next/server";
import { Pool } from "pg";
import * as schema from "@/src/db/schema";
import { eq, gte, lte, and, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const startedAtGte = searchParams.get("started_at_gte");
  const startedAtLte = searchParams.get("started_at_lte");

  const fechamentos = searchParams.get("fechamentos") === "true";
  const cotacoes = searchParams.get("cotacoes") === "true";
  const servicos = searchParams.get("servicos") === "true";

  const selectedActivities: string[] = [];
  if (fechamentos) selectedActivities.push("fechamento");
  if (cotacoes) selectedActivities.push("cotacao");
  if (servicos) selectedActivities.push("servico");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    const backofficerTable = alias(schema.usersTable, "backofficer");
    const sellerTable = alias(schema.usersTable, "seller");

    const filters = [];

    // filtro de data
    if (startedAtGte && startedAtLte) {
      filters.push(
        gte(schema.reportsTable.started_at, new Date(startedAtGte)),
        lte(schema.reportsTable.started_at, new Date(startedAtLte))
      );
    }

    // filtro de tipo de atividade
    if (selectedActivities.length > 0) {
      filters.push(inArray(schema.reportsTable.activity_type, selectedActivities));
    }
    console.log("Dados recebidos:", req.body);


    const reports = await db
      .select({
        Backofficer: backofficerTable.name,
        Vendedor: sellerTable.name,
        Cliente: schema.reportsTable.customer,
        Atividade: schema.reportsTable.activity_type,
        Inicio: schema.reportsTable.started_at,
        Final: schema.reportsTable.finished_at,
      })
      .from(schema.reportsTable)
      .leftJoin(backofficerTable, eq(schema.reportsTable.backofficer_id, backofficerTable.id))
      .leftJoin(sellerTable, eq(schema.reportsTable.seller_id, sellerTable.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(schema.reportsTable.started_at);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Erro ao obter os relatórios:", error);
    return NextResponse.json(
      { error: "Erro ao obter os relatórios" },
      { status: 500 }
    );
  }
}

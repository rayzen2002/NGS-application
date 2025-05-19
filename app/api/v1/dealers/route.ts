import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse, NextRequest } from "next/server";
import { Pool } from "pg";
import * as schema from "@/src/db/schema";
import { between, eq, sql } from "drizzle-orm";
import dayjs from "dayjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle({ client: pool, schema });

export async function GET() {
  try {
    const startOfMonth = dayjs().startOf("month").toDate();
    const endOfMonth = dayjs().endOf("month").toDate();

    const dealers = await db
      .select({
        id: schema.dealersTable.id,
        name: schema.dealersTable.name,
        routing: schema.dealersTable.routing,
        zelle: schema.dealersTable.zelle,
        account: schema.dealersTable.account,
        monthlyClosings: sql<number>`COUNT(${schema.fechamentoPagamentosTable.report_id})`.as("monthlyClosings")
      })
      .from(schema.dealersTable)
      .leftJoin(
        schema.fechamentoPagamentosTable,
        eq(schema.dealersTable.id, schema.fechamentoPagamentosTable.dealer_id)
      )
      .leftJoin(
        schema.reportsTable,
        eq(schema.fechamentoPagamentosTable.report_id, schema.reportsTable.id)
      )
      .where(
        between(schema.reportsTable.finished_at, startOfMonth, endOfMonth)
      )
      .groupBy(schema.dealersTable.id);

    return NextResponse.json({ dealers });
  } catch (error) {
    console.error("Erro ao obter os dealers:", error);
    return NextResponse.json(
      { error: "Erro ao obter os dealers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, routing, zelle, account } = body;

    if (!name || !routing || !zelle) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos." },
        { status: 400 }
      );
    }

    const result = await db.insert(schema.dealersTable).values({
      name,
      routing,
      zelle,
      account
    });

    return NextResponse.json({ message: "Dealer criado com sucesso", result });
  } catch (error) {
    console.error("Erro ao criar dealer:", error);
    return NextResponse.json(
      { error: "Erro ao criar dealer" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do dealer é obrigatório para exclusão." },
        { status: 400 }
      );
    }

    const result = await db
      .delete(schema.dealersTable)
      .where(eq(schema.dealersTable.id, id));

    return NextResponse.json({ message: "Dealer removido com sucesso", result });
  } catch (error) {
    console.error("Erro ao deletar dealer:", error);
    return NextResponse.json(
      { error: "Erro ao deletar dealer" },
      { status: 500 }
    );
  }
}

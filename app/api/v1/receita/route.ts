import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse } from "next/server";
import { Pool } from "pg";
import * as schema from "@/src/db/schema";
import { eq } from "drizzle-orm";


export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle({ client: pool, schema });

  try {
    const fechamentos = await db
    .select()
    .from(schema.reportsTable)
    .where(eq(schema.reportsTable.activity_type, "fechamento"))

    const receita = fechamentos.length * 150
    return NextResponse.json({
      receita ,
    });
  } catch (error) {
    console.error("Erro ao obter os relatórios de receita:", error);
    return NextResponse.json(
      { error: "Erro ao obter os relatórios de receita" },
      { status: 500 }
    );
  }
}

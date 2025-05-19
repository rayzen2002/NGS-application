import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse } from "next/server";
import { Pool } from "pg";
import * as schema from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle({ client: pool, schema });

  const sellerUser = alias(schema.usersTable, "sellerUser");
  const backofficerUser = alias(schema.usersTable, "backofficerUser");
  const marcadorUser = alias(schema.usersTable, "marcadorUser");

  try {
    const fechamentos = await db
    .select({
      id: schema.reportsTable.id,
      customer: schema.reportsTable.customer,
      started_at: schema.reportsTable.started_at,
      finished_at: schema.reportsTable.finished_at,
      activity_type: schema.reportsTable.activity_type,
  
      seller_id: schema.reportsTable.seller_id,
      seller_nome: sellerUser.name,
  
      backofficer_id: schema.reportsTable.backofficer_id,
      backofficer_nome: backofficerUser.name,
  
      trello_card_url: schema.reportsTable.trello_card_url,

  
      pagamento: {
        pago: schema.fechamentoPagamentosTable.pago,
        marcado_por: schema.fechamentoPagamentosTable.marcado_por,
        marcado_em: schema.fechamentoPagamentosTable.marcado_em,
        marcado_por_nome: marcadorUser.name,
        dealer: schema.dealersTable.name
      }
    })
    .from(schema.reportsTable)
    .leftJoin(
      schema.fechamentoPagamentosTable,
      eq(schema.fechamentoPagamentosTable.report_id, schema.reportsTable.id)
    )
    .leftJoin(
      sellerUser,
      eq(sellerUser.id, schema.reportsTable.seller_id)
    )
    .leftJoin(
      backofficerUser,
      eq(backofficerUser.id, schema.reportsTable.backofficer_id)
    )
    .leftJoin(
      marcadorUser,
      eq(marcadorUser.id, schema.fechamentoPagamentosTable.marcado_por)
    )
    .leftJoin(
      schema.dealersTable,
      eq(schema.dealersTable.id, schema.fechamentoPagamentosTable.dealer_id)
    )
    .where(eq(schema.reportsTable.activity_type, "fechamento"))
    .orderBy(desc(schema.reportsTable.finished_at));
  
    return NextResponse.json({ fechamentos });
  } catch (error) {
    console.error("Erro ao obter os relatórios de fechamentos:", error);
    return NextResponse.json(
      { error: "Erro ao obter os relatórios de fechamentos" },
      { status: 500 }
    );
  }
}

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { NextRequest, NextResponse } from "next/server";
import * as schema from "@/src/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const SECRET_KEY = process.env.JWT_SECRET || "secret123";

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY) as { username: string };
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { report_id, pago } = await req.json();

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  // Buscar o usuário logado
  const user = await db.query.usersTable.findFirst({
    where: eq(schema.usersTable.name, decoded.username),
  });

  if (!user) {
  
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Verificar se já existe um registro de pagamento
  const pagamentoExistente = await db.query.fechamentoPagamentosTable.findFirst({
    where: eq(schema.fechamentoPagamentosTable.report_id, report_id),
  });

  if (pagamentoExistente) {
    await db
      .update(schema.fechamentoPagamentosTable)
      .set({
        pago,
        marcado_por: user.id,
        marcado_em: new Date(),
      })
      .where(eq(schema.fechamentoPagamentosTable.report_id, report_id));
  } else {
    await db.insert(schema.fechamentoPagamentosTable).values({
      report_id,
      pago,
      marcado_por: user.id,
      marcado_em: new Date(),
    });
  }

  return NextResponse.json({ success: true });
}
export async function GET(){
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  const db = drizzle({client: pool, schema})
  
  try {
   
    const fechamentosPagamentosInfo = await db
    .select({
        report_id: schema.fechamentoPagamentosTable.report_id,
        pago: schema.fechamentoPagamentosTable.pago,
        dealer: schema.dealersTable.name
    }).from(schema.fechamentoPagamentosTable)
    .leftJoin(
      schema.dealersTable,
      eq(schema.dealersTable.id, schema.fechamentoPagamentosTable.dealer_id)
    )
    return NextResponse.json({ fechamentosPagamentosInfo});
  } catch (error){
    console.error("Erro ao obter infos de pagamento", error)
    return NextResponse.json(
      {error: "Erro ao obeter infos de pagamentos"},
      {status: 500}
    )
  }
  
}
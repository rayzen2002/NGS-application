import { reportsTable } from "@/src/db/schema";
import { Relatorio, RelatoriosResponse } from "@/types/types_api";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/src/db/schema";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/verify-token";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);


const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

export async function POST(request: Request) {

  
  // Obtém usuário autenticado a partir do token (verificação robusta)
  const user = await verifyToken();
  if (!user) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  try {
    const relatoriosDataInputArray = await request.json();
    if (!Array.isArray(relatoriosDataInputArray) || relatoriosDataInputArray.length === 0) {
      return new Response(JSON.stringify({ error: "Entrada inválida. Deve ser um array de relatórios." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Aqui garantimos que o backofficer_id vem do token
    const newRelatorios: RelatoriosResponse = relatoriosDataInputArray.map((item: Relatorio) => ({
      id: item.id,
      backofficer_id: user.id as number,
      seller_id: item.seller_id,
      started_at: dayjs.tz(item.started_at, "DD/MM/YYYY HH:mm", "America/Sao_Paulo").utc().toDate(),
      finished_at: dayjs.tz(item.finished_at, "DD/MM/YYYY HH:mm", "America/Sao_Paulo").utc().toDate(),
      activity_type: item.activity_type,
      customer: item.customer,
      trello_card_url: item.trello_card_url,
    }));
    

    // Insere os relatórios no banco usando uma transação
    const insertedReports = await db.transaction(async (trx) => {
      return trx.insert(reportsTable).values(newRelatorios).returning({ id: reportsTable.id });
    });

    return NextResponse.json(
      { message: "Relatórios processados", data: insertedReports },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao inserir relatórios:", error);
    return new Response(JSON.stringify({ error: "Erro interno ao processar a requisição" }), { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Verifica se o usuário está autenticado via token no cookie
  const user = await verifyToken();
  if (!user) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "ID do relatório é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verifica se o relatório existe e pertence ao backofficer logado (opcional, mas recomendável)
    const relatorioToDeleteData = await db.query.reportsTable.findFirst({
      where: eq(reportsTable.id, id),
    });

    if (!relatorioToDeleteData) {
      return new Response(JSON.stringify({ error: "Relatório não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Se quiser restringir que só o dono possa deletar:
    if (relatorioToDeleteData.backofficer_id !== user.id) {
      return new Response(JSON.stringify({ error: "Você não tem permissão para deletar este relatório" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Deleta o relatório
    await db.delete(reportsTable).where(eq(reportsTable.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao deletar relatório:", error);
    return new Response(JSON.stringify({ error: "Erro interno ao processar a requisição" }), { status: 500 });
  }
}
export async function GET(request: Request) {
  try {
    // Obter o ID do relatório a partir dos parâmetros da URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");


    if (!id) {
      return new Response(JSON.stringify({ error: "ID do relatório é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Buscar o relatório no banco de dados
    const relatorio = await db.query.reportsTable.findFirst({
      where: eq(reportsTable.id, parseInt(id)),
    });


    if (!relatorio) {
      return new Response(JSON.stringify({ error: "Relatório não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Retornar o relatório encontrado
    return new Response(JSON.stringify({ data: relatorio }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao buscar relatório:", error);
    return new Response(JSON.stringify({ error: "Erro interno ao processar a requisição" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


import { verifyToken } from "@/lib/verify-token";
import { db } from "@/src/db";
import { sellersReports, usersTable } from "@/src/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
   const user = await verifyToken();
    if (!user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  try {
    const body = await req.json();
    const { vendedor, data, atividades } = body;

    if (!vendedor || !data || !atividades?.length) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const sellerId = user.id as number;
    

    for (const atividade of atividades) {
      await db.insert(sellersReports).values({
        seller_id: sellerId,
        started_at: new Date(`${data}T${atividade.horario || "00:00"}:00`),
        activity_type: atividade.tipo,
        customer: atividade.temDealer
          ? atividade.nomeDealer
          : atividade.nomeCliente,
        additional_info: JSON.stringify({
          ...atividade,
          vendedor,
          data,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao salvar relatório" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const sellerId = searchParams.get("seller_id");
    const date = searchParams.get("date");

    let filters = [];

    if (sellerId) {
      filters.push(eq(sellersReports.seller_id, Number(sellerId)));
    }

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);

      filters.push(
        and(
          gte(sellersReports.started_at, startOfDay),
          lte(sellersReports.started_at, endOfDay)
        )
      );
    }

    const whereClause = filters.length ? and(...filters) : undefined;

    const reports = await db
      .select({
        id: sellersReports.id,
        seller_id: sellersReports.seller_id,
        seller_name: usersTable.username, // ← nome vindo do join
        activity_type: sellersReports.activity_type,
        started_at: sellersReports.started_at,
        additional_info: sellersReports.additional_info
      })
      .from(sellersReports)
      .leftJoin(usersTable, eq(usersTable.id, sellersReports.seller_id))
      .where(whereClause);

    return NextResponse.json(reports);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar relatórios" },
      { status: 500 }
    );
  }
}
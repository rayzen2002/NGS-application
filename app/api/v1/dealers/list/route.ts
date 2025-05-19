import { NextResponse } from "next/server";
import * as schema from "@/src/db/schema";
import { db } from "@/src/db";

export async function GET() {
  try {
    const dealers = await db
      .select({
        id: schema.dealersTable.id,
        name: schema.dealersTable.name,
        routing: schema.dealersTable.routing,
        zelle: schema.dealersTable.zelle,
        account: schema.dealersTable.account
      })
      .from(schema.dealersTable);

    return NextResponse.json({ dealers });
  } catch (error) {
    console.error("Erro ao obter os dealers:", error);
    return NextResponse.json(
      { error: "Erro ao obter os dealers" },
      { status: 500 }
    );
  }}
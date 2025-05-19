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
    const sellers = await db.query.usersTable.findMany({
      where: eq(schema.usersTable.role, "backofficer"),
    });

    return NextResponse.json({
      users: sellers,
    });
  } catch (error) {
    console.error("Erro ao obter os vendedores:", error);
    return NextResponse.json(
      { error: "Erro ao obter os vendedores" },
      { status: 500 }
    );
  }
}

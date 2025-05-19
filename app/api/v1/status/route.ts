import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  const updatedAt = new Date().toISOString()
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  const db = drizzle({client: pool})
  const databaseVersionResult = await db.execute('SELECT version();')
  const databaseVersionValue = databaseVersionResult.rows[0].version

  const dabaseMaxConnectionsResult = await db.execute("SHOW max_connections")
  const databaseMaxConnectionsValue = dabaseMaxConnectionsResult.rows[0].max_connections
  
  const opennedConnectionsResult = await db.execute("SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")
  const opennedconnectionsValue = opennedConnectionsResult.rows[0].count
  return NextResponse.json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        connections: databaseMaxConnectionsValue,
        opennedConnections: opennedconnectionsValue
      }
    }

  })
}
 
// export async function POST(request: Request) {
//   // Parse the request body
//   const body = await request.json();
//   const { name } = body;
 
//   // e.g. Insert new user into your DB
//   const newUser = { id: Date.now(), name };
 
//   return new Response(JSON.stringify(newUser), {
//     status: 201,
//     headers: { 'Content-Type': 'application/json' }
//   });
// }
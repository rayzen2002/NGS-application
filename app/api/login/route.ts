import { NextResponse } from "next/server"
import jwt from 'jsonwebtoken'
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/src/db/schema";
import { eq } from 'drizzle-orm'

export async function POST(request: Request){
  const SECRET_KEY = process.env.JWT_SECRET || "secret123";
  const {username, password} = await request.json()
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  const db = drizzle({client: pool, schema})
  try{
    const userToLogin  = await db.query.usersTable.findMany({
      where: eq(schema.usersTable.username, username)
    })
    if (userToLogin.length === 0) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }
    const user = userToLogin[0]
    if(password !== user.password){
      return NextResponse.json({
        error: "Credenciais invalidas"
      },
    {
      status: 401
    })
    }
    const token = jwt.sign({ username: user.name, id: user.id , role: user.role }, SECRET_KEY, {expiresIn: "1h"})
  
  const response = NextResponse.json({ token },{status: 200})

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 365 * 24 * 60 * 60,
    path: "/"
  })

  return response
  }catch(err){
    console.error(err)
  }
}
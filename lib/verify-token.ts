// src/utils/verifyToken.ts
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "secret123");

export async function verifyToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload; 
  } catch (err) {
    console.error("Token inválido:", err);
    return null;
  }
}

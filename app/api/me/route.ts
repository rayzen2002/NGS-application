import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value;
  console.log(token)
  console.log(process.env.JWT_SECRET)

  if (!token) {
    return Response.json({ user: null }, { status: 401 });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    return Response.json({ user });
  } catch (err) {
    console.error(err);
    return Response.json({ user: null }, { status: 401 });
  }
}

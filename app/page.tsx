import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form.tsx/page";
import { jwtVerify } from "jose";

type JWTPayload = {
  username: string;
  role: "admin" | "backofficer" | "user";
};

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

      const { payload } = await jwtVerify<JWTPayload>(token, secret);

      // redireciona baseado na role do token
      if (payload.role === "admin") {
        redirect("/admin/dashboard");
      } else if (payload.role === "backofficer") {
        redirect("/backofficer");
      } else {
        redirect("/user/dashboard");
      }
    } catch (err) {
      console.error("Token inválido no servidor:", err);
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

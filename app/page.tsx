import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { LoginForm } from "@/components/login-form.tsx/page";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123") as {
        username: string;
        role: string;
      };

      // redireciona baseado na role do token
      if (decoded.role === "admin") {
        redirect("/admin/dashboard");
      } else if (decoded.role === "backofficer") {
        redirect("/backofficer");
      } else {
        redirect("/user/dashboard");
      }
    } catch (err) {
      console.error("Token inválido no servidor:", err);
      // token inválido → continua e mostra o form de login
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

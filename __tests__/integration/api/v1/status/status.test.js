test("GET to /api/v1/status should return 200", async () => {
  const loginResponse = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "washington",
      password: "123456"
    }),
    redirect: "manual"
  });

  // Captura o cookie de autenticação do response
  const setCookieHeader = loginResponse.headers.get("set-cookie");

  if (!setCookieHeader) {
    throw new Error("Login não retornou cookie");
  }

  const statusResponse = await fetch("http://localhost:3000/api/v1/status", {
    method: "GET",
    headers: {
      Cookie: setCookieHeader
    }
  });

  const responseBody = await statusResponse.json();

  expect(statusResponse.status).toBe(200);
  expect(responseBody.dependencies.database.version).toBe(
    "PostgreSQL 16.1 on x86_64-pc-linux-musl, compiled by gcc (Alpine 12.2.1_git20220924-r10) 12.2.1 20220924, 64-bit"
  );
  expect(responseBody.dependencies.database.connections).toBe("100");
});

test("GET to /api/v1/status should return 200", async () => {
  const loginResponse = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "supervisao",
      password: "mkwrjsw"
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
    "PostgreSQL 17.5 on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit"
  );
  expect(responseBody.dependencies.database.connections).toBe("901");
});

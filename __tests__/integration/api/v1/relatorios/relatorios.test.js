test("POST, GET e DELETE múltiplos relatórios como admin logado", async () => {
  // 1. Login para obter o token
  const loginResponse = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "emanuel",
      password: "123456",
    }),
  });

  expect(loginResponse.status).toBe(200);
  const loginBody = await loginResponse.json();
  const token = loginBody.token;
  expect(token).toBeDefined();

  // 2. Dados de entrada
  const reportsData = [
    {
      backofficer_id: 2,
      seller_id: 3,
      started_at: new Date().toISOString(),
      finished_at: new Date(Date.now() + 10000).toISOString(),
      activity_type: "cotacao",
      customer: "Cliente 1",
    },
    {
      backofficer_id: 2,
      seller_id: 3,
      started_at: new Date(Date.now() + 20000).toISOString(),
      finished_at: new Date(Date.now() + 30000).toISOString(),
      activity_type: "fechamento",
      customer: "Cliente 2",
    },
    {
      backofficer_id: 2,
      seller_id: 3,
      started_at: new Date(Date.now() + 40000).toISOString(),
      finished_at: new Date(Date.now() + 50000).toISOString(),
      activity_type: "servico",
      customer: "Cliente 3",
    },
  ];

  // 3. Criar os relatórios
  const responseCreate = await fetch(`${process.env.NEXT_PUBLIC_IMG_BASE_URL}/api/v1/relatorios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
    },
    body: JSON.stringify(reportsData),
  });

  expect(responseCreate.status).toBe(201);
  const responseBody = await responseCreate.json();
  expect(responseBody.data.length).toBe(3);

  const createdIds = responseBody.data.map((item) => item.id);
  expect(createdIds.length).toBe(3);

  // 4. Buscar e validar os dados de cada relatório criado (se o endpoint GET estiver disponível)
  for (let i = 0; i < createdIds.length; i++) {
    const id = createdIds[i];
    const expected = reportsData[i];
    const getResponse = await fetch(`http://localhost:3000/api/v1/relatorios?id=${id}`, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
      },
    });

    expect(getResponse.status).toBe(200);

    const { data } = await getResponse.json();
    expect(data.backofficer_id).toBe(expected.backofficer_id);
    expect(data.seller_id).toBe(expected.seller_id);
    expect(data.activity_type).toBe(expected.activity_type);
    expect(data.customer).toBe(expected.customer);
    expect(new Date(data.started_at).toISOString()).toBe(expected.started_at);
    expect(new Date(data.finished_at).toISOString()).toBe(expected.finished_at);
  }

  // 5. Deletar os relatórios usando Cookie
  for (const id of createdIds) {
    const deleteResponse = await fetch("http://localhost:3000/api/v1/relatorios", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      body: JSON.stringify({ id }),
    });

    expect(deleteResponse.status).toBe(204);
  }
});

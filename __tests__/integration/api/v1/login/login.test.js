test.only("POST to /api/login should return a token if user is valid", async ()=>{
  const response = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      "Content-Type" : "application/json"
    },
    body: JSON.stringify({
      username: "emanuel",
      password: "123456"
    })
  })

  const userCredentialsToLoginResponse = await response.json()

  expect(response.status).toBe(200)
  expect(userCredentialsToLoginResponse).toHaveProperty("token")
})
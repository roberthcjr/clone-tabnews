test("getting from /api/v1/status, should return 200", async () => {
  const response = await fetch('http://localhost:3000/api/v1/status');
  expect(response.status).toBe(200);
});
test("getting from /api/v1/status, should return expected message", async () => {
  const expectedMessage = "Salve meus nobres, cãos";

  const response = await fetch('http://localhost:3000/api/v1/status');
  const body = await response.json();
  
  expect(body.mensagem).toBe(expectedMessage);
});
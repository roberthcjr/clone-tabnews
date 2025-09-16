import email from "infra/email";
import {
  waitForAllServices,
  deleteAllEmails,
  getLastEmail,
} from "tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await deleteAllEmails();
    await email.send({
      from: "FinTab <contato@fintab.com.br>",
      to: "contato@curso.dev",
      subject: "Teste de assunto",
      text: "Teste de corpo",
    });

    const lastEmailSent = {
      from: "FinTab <contato@fintab.com.br>",
      to: "contato@curso.dev",
      subject: "Ultimo email enviado",
      text: "Corpo do ultimo email enviado",
    };

    await email.send(lastEmailSent);
    const lastEmail = await getLastEmail();

    expect(lastEmail).toEqual({
      created_at: lastEmail.created_at,
      id: lastEmail.id,
      recipients: [`<${lastEmailSent.to}>`],
      sender: `${lastEmailSent.from.split(" ")[1]}`,
      size: lastEmail.size,
      subject: lastEmailSent.subject,
      text: `${lastEmailSent.text}\n`,
    });
  });
});

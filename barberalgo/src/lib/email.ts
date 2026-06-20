type PasswordResetEmail = {
  to: string;
  name: string;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: PasswordResetEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { sent: false, reason: "not-configured" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Redefinição de senha — BarberAlgo",
      text: [
        `Olá, ${name}.`,
        "",
        "Recebemos uma solicitação para redefinir a senha da sua conta BarberAlgo.",
        `Acesse o link abaixo em até 30 minutos: ${resetUrl}`,
        "",
        "Se você não fez esta solicitação, ignore este e-mail.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha no envio do e-mail de recuperação: ${response.status}`);
  }

  return { sent: true as const };
}

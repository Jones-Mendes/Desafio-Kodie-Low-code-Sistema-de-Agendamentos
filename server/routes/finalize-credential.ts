import { RequestHandler } from "express";
import nodemailer from "nodemailer";
import {
  FinalizeCredentialRequest,
  FinalizeCredentialResponse,
} from "../../shared/api";
import { sendToGoogleSheets } from "../services/google-sheets";

const isNonEmpty = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const finalizedProtocols = new Set<string>();

const getEnv = (name: string) => {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
};

export const handleFinalizeCredential: RequestHandler = async (req, res) => {
  const body = req.body as Partial<FinalizeCredentialRequest>;

  if (
    !body ||
    !isNonEmpty(body.protocol) ||
    !body.scheduling ||
    !body.quiz ||
    !isNonEmpty(body.scheduling.fullName) ||
    !isNonEmpty(body.scheduling.email) ||
    !isNonEmpty(body.scheduling.company) ||
    !isNonEmpty(body.scheduling.documentId) ||
    !isNonEmpty(body.scheduling.visitDate) ||
    !isNonEmpty(body.scheduling.visitTime) ||
    body.scheduling.acceptedSafetyRules !== true ||
    typeof body.quiz.score !== "number" ||
    typeof body.quiz.totalQuestions !== "number" ||
    body.quiz.approved !== true ||
    !isNonEmpty(body.quiz.answeredAt) ||
    !Array.isArray(body.quiz.answers) ||
    body.quiz.answers.length === 0
  ) {
    return res.status(400).json({
      message: "Payload invalido para finalizar o credenciamento.",
    });
  }

  if (finalizedProtocols.has(body.protocol)) {
    return res.status(409).json({
      message: "Este protocolo ja foi finalizado anteriormente.",
    });
  }

  try {
    await sendToGoogleSheets({
      type: "finalize",
      ...body,
    });

    const smtpHost = getEnv("SMTP_HOST");
    const smtpPortRaw = getEnv("SMTP_PORT");
    const smtpUser = getEnv("SMTP_USER");
    const smtpPass = getEnv("SMTP_PASS");
    const smtpFrom = getEnv("SMTP_FROM");
    const notificationEmail = getEnv("NOTIFICATION_EMAIL");

    const canSendEmail =
      isNonEmpty(smtpHost) &&
      isNonEmpty(smtpPortRaw) &&
      isNonEmpty(smtpUser) &&
      isNonEmpty(smtpPass) &&
      isNonEmpty(smtpFrom);

    const answerItemsHtml = body.quiz.answers
      .map((answer) => {
        const answerStatus = answer.isCorrect ? "Correta" : "Incorreta";

        return `
          <tr>
            <td style="padding:12px;border-bottom:1px solid #dbe5ef;color:#0f172a;">${answer.question}</td>
            <td style="padding:12px;border-bottom:1px solid #dbe5ef;color:#334155;">${answer.selectedAnswer}</td>
            <td style="padding:12px;border-bottom:1px solid #dbe5ef;color:#334155;">${answer.correctAnswer}</td>
            <td style="padding:12px;border-bottom:1px solid #dbe5ef;color:${answer.isCorrect ? "#15803d" : "#b91c1c"};font-weight:600;">${answerStatus}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <div style="background:#eff6ff;padding:32px;font-family:Arial,sans-serif;color:#0f172a;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe5ef;">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#0a2b58,#1570b8);color:#ffffff;">
            <h1 style="margin:0;font-size:28px;">Credenciamento concluido</h1>
            <p style="margin:12px 0 0;line-height:1.6;opacity:.92;">
              Seu cadastro e sua avaliacao de seguranca foram registrados com sucesso.
            </p>
          </div>

          <div style="padding:32px;">
            <p style="margin-top:0;font-size:16px;line-height:1.7;">
              Ola, <strong>${body.scheduling.fullName}</strong>.
            </p>

            <div style="background:#f8fafc;border:1px solid #dbe5ef;border-radius:16px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;"><strong>Protocolo:</strong> ${body.protocol}</p>
              <p style="margin:0 0 8px;"><strong>Empresa:</strong> ${body.scheduling.company}</p>
              <p style="margin:0 0 8px;"><strong>Data da visita:</strong> ${body.scheduling.visitDate}</p>
              <p style="margin:0;"><strong>Horario:</strong> ${body.scheduling.visitTime}</p>
            </div>

            <div style="margin-bottom:24px;">
              <h2 style="font-size:20px;margin:0 0 12px;">Resultado do quiz</h2>
              <p style="margin:0;line-height:1.6;">
                Voce acertou <strong>${body.quiz.score}</strong> de <strong>${body.quiz.totalQuestions}</strong> perguntas.
              </p>
            </div>

            <table style="width:100%;border-collapse:collapse;border:1px solid #dbe5ef;border-radius:12px;overflow:hidden;">
              <thead>
                <tr style="background:#e0f2fe;text-align:left;">
                  <th style="padding:12px;color:#0f172a;">Pergunta</th>
                  <th style="padding:12px;color:#0f172a;">Sua resposta</th>
                  <th style="padding:12px;color:#0f172a;">Resposta correta</th>
                  <th style="padding:12px;color:#0f172a;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${answerItemsHtml}
              </tbody>
            </table>

            <p style="margin:24px 0 0;line-height:1.7;color:#334155;">
              Aguarde a validacao final da equipe Wilson Sons. Caso necessario, entraremos em contato pelo e-mail cadastrado.
            </p>
          </div>
        </div>
      </div>
    `;

    if (canSendEmail) {
      const smtpPort = Number(smtpPortRaw);
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: body.scheduling.email,
        bcc: isNonEmpty(notificationEmail) ? notificationEmail : undefined,
        subject: "Credenciamento concluido - Wilson Sons",
        text: [
          `Ola, ${body.scheduling.fullName}!`,
          "",
          "Seu credenciamento foi concluido com sucesso.",
          `Protocolo: ${body.protocol}`,
          `Data da visita: ${body.scheduling.visitDate}`,
          `Horario da visita: ${body.scheduling.visitTime}`,
          `Resultado do quiz: ${body.quiz.score}/${body.quiz.totalQuestions}`,
          "",
          "Aguarde a validacao final da equipe Wilson Sons.",
        ].join("\n"),
        html,
      });
    } else {
      console.warn("SMTP nao configurado. Seguindo sem envio de e-mail.");
    }

    finalizedProtocols.add(body.protocol);

    const response: FinalizeCredentialResponse = {
      message: "Credenciamento finalizado com sucesso.",
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Erro interno ao finalizar o credenciamento.",
    });
  }
};
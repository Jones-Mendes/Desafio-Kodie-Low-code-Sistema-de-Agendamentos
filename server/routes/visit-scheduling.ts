import { RequestHandler } from "express";
import {
  VisitSchedulingRequest,
  VisitSchedulingResponse,
} from "../../shared/api";

const isNonEmpty = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const isWeekday = (dateValue: string) => {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = date.getDay();
  return day >= 1 && day <= 5;
};

const isAllowedTime = (timeValue: string) => {
  return timeValue >= "08:00" && timeValue <= "17:00";
};

const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getEnv = (name: string) => {
  const value = process.env[name];
  return typeof value === "string" ? value : "";
};

export const handleVisitScheduling: RequestHandler = async (req, res) => {
  const body = req.body as Partial<VisitSchedulingRequest>;

  if (
    !isNonEmpty(body.fullName) ||
    !isNonEmpty(body.email) ||
    !isNonEmpty(body.company) ||
    !isNonEmpty(body.documentId) ||
    !isNonEmpty(body.visitDate) ||
    !isNonEmpty(body.visitTime) ||
    body.acceptedSafetyRules !== true
  ) {
    return res.status(400).json({
      message: "Dados obrigatórios inválidos para o agendamento.",
    });
  }

  if (!isWeekday(body.visitDate)) {
    return res.status(400).json({
      message: "O agendamento deve ser realizado apenas em dias úteis.",
    });
  }

  if (body.visitDate < getTodayISO()) {
    return res.status(400).json({
      message: "Não é permitido agendar para datas passadas.",
    });
  }

  if (!isAllowedTime(body.visitTime)) {
    return res.status(400).json({
      message: "O horário permitido para agendamento é de 08:00 às 17:00.",
    });
  }

  const protocol = `WS-${Date.now().toString().slice(-8)}`;

  try {
    const sheetsWebhookUrl = getEnv("GOOGLE_SHEETS_WEBHOOK_URL");
    const sheetsToken = getEnv("GOOGLE_SHEETS_WEBHOOK_TOKEN");

    if (sheetsWebhookUrl) {
      const sheetsResponse = await fetch(sheetsWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "scheduling",
          protocol,
          scheduling: {
            fullName: body.fullName,
            email: body.email,
            company: body.company,
            documentId: body.documentId,
            visitDate: body.visitDate,
            visitTime: body.visitTime,
            notes: body.notes,
            acceptedSafetyRules: body.acceptedSafetyRules,
          },
          sheetsToken: sheetsToken || undefined,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!sheetsResponse.ok) {
        console.error("Falha ao enviar agendamento para Google Sheets", {
          status: sheetsResponse.status,
        });
      }
    } else {
      console.warn("GOOGLE_SHEETS_WEBHOOK_URL nao configurada. Seguindo sem salvar na planilha.");
    }
  } catch (error) {
    console.error("Erro ao enviar agendamento para Google Sheets", error);
  }

  const response: VisitSchedulingResponse = {
    message:
      "Agendamento recebido com sucesso. Você receberá a confirmação após validação.",
    protocol,
  };

  return res.status(201).json(response);
};

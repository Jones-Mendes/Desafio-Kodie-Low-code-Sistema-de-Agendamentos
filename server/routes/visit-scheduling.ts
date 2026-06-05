import { RequestHandler } from "express";
import {
  VisitSchedulingRequest,
  VisitSchedulingResponse,
} from "@shared/api";

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

export const handleVisitScheduling: RequestHandler = (req, res) => {
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

  const response: VisitSchedulingResponse = {
    message:
      "Agendamento recebido com sucesso. Você receberá a confirmação após validação.",
    protocol,
  };

  return res.status(201).json(response);
};

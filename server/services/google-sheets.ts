import { postJson } from "./sheet-client";

type GoogleSheetsPayload = Record<string, unknown>;
type SheetPayloadType = "scheduling" | "finalize";

const getEnv = (name: string) => {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const asString = (value: unknown) => {
  return typeof value === "string" ? value : "";
};

const asNumber = (value: unknown) => {
  return typeof value === "number" ? value : undefined;
};

const asBoolean = (value: unknown) => {
  return typeof value === "boolean" ? value : undefined;
};

const asArray = (value: unknown) => {
  return Array.isArray(value) ? value : [];
};

const getPayloadType = (payload: GoogleSheetsPayload): SheetPayloadType | null => {
  const type = asString(payload.type);
  if (type === "scheduling" || type === "finalize") {
    return type;
  }

  return null;
};

const getSheetDbUrl = (type: SheetPayloadType) => {
  const specificUrl =
    type === "scheduling"
      ? getEnv("SHEETDB_API_URL_SCHEDULING")
      : getEnv("SHEETDB_API_URL_FINALIZE");

  return specificUrl || getEnv("SHEETDB_API_URL");
};

const toSchedulingRow = (payload: GoogleSheetsPayload) => {
  const scheduling = isRecord(payload.scheduling) ? payload.scheduling : payload;

  return {
    form_type: "scheduling",
    protocol: asString(payload.protocol),
    full_name: asString(scheduling.fullName),
    email: asString(scheduling.email),
    company: asString(scheduling.company),
    document_id: asString(scheduling.documentId),
    visit_date: asString(scheduling.visitDate),
    visit_time: asString(scheduling.visitTime),
    notes: asString(scheduling.notes),
    accepted_safety_rules: asBoolean(scheduling.acceptedSafetyRules),
    created_at: asString(payload.createdAt) || new Date().toISOString(),
  };
};

const toFinalizeRow = (payload: GoogleSheetsPayload) => {
  const scheduling = isRecord(payload.scheduling) ? payload.scheduling : undefined;
  const quiz = isRecord(payload.quiz) ? payload.quiz : undefined;

  return {
    form_type: "finalize",
    protocol: asString(payload.protocol),
    full_name: asString(scheduling?.fullName),
    email: asString(scheduling?.email),
    company: asString(scheduling?.company),
    document_id: asString(scheduling?.documentId),
    visit_date: asString(scheduling?.visitDate),
    visit_time: asString(scheduling?.visitTime),
    score: asNumber(quiz?.score),
    total_questions: asNumber(quiz?.totalQuestions),
    approved: asBoolean(quiz?.approved),
    answered_at: asString(quiz?.answeredAt),
    answers_json: JSON.stringify(asArray(quiz?.answers)),
    finalized_at: new Date().toISOString(),
    payload_json: JSON.stringify(payload),
  };
};

const sendToSheetDb = async (payload: GoogleSheetsPayload) => {
  const payloadType = getPayloadType(payload);
  if (!payloadType) {
    return null;
  }

  const apiUrl = getSheetDbUrl(payloadType);

  if (!apiUrl) {
    return null;
  }

  try {
    await postJson(
      apiUrl,
      {
        data: [payloadType === "scheduling" ? toSchedulingRow(payload) : toFinalizeRow(payload)],
      },
      {
        authToken: getEnv("SHEETDB_AUTH_TOKEN"),
      },
    );

    return true;
  } catch (error) {
    console.error("Falha ao enviar dados para SheetDB", error);
    return false;
  }
};

const sendToGoogleWebhook = async (
  payload: GoogleSheetsPayload,
) => {
  const webhookUrl = getEnv("GOOGLE_SHEETS_WEBHOOK_URL");

  if (!webhookUrl) {
    return null;
  }

  try {
    await postJson(webhookUrl, payload);
    return true;
  } catch (error) {
    console.error("Falha ao enviar dados para Google Sheets", error);
    return false;
  }
};

export const sendToGoogleSheets = async (payload: GoogleSheetsPayload) => {
  try {
    const sheetDbResult = await sendToSheetDb(payload);
    if (sheetDbResult !== null) {
      return sheetDbResult;
    }

    const googleResult = await sendToGoogleWebhook(payload);
    if (googleResult !== null) {
      return googleResult;
    }

    console.warn(
      "Nenhuma integracao de planilha configurada. Defina SHEETDB_API_URL ou GOOGLE_SHEETS_WEBHOOK_URL.",
    );
    return false;
  } catch (error) {
    console.error("Erro ao enviar dados para planilha", error);
    return false;
  }
};

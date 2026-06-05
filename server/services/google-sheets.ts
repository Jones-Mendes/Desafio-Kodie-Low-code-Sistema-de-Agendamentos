type GoogleSheetsPayload = Record<string, unknown>;

const getEnv = (name: string) => {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
};

export const sendToGoogleSheets = async (payload: GoogleSheetsPayload) => {
  const webhookUrl = getEnv("GOOGLE_SHEETS_WEBHOOK_URL");

  if (!webhookUrl) {
    console.warn("GOOGLE_SHEETS_WEBHOOK_URL nao configurada. Seguindo sem salvar na planilha.");
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("Falha ao enviar dados para Google Sheets", {
        status: response.status,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao enviar dados para Google Sheets", error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

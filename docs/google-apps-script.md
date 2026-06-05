# Google Apps Script para Google Sheets

Atualize o Apps Script do seu Web App com o exemplo abaixo para gravar os dados do agendamento (assim que o formulario e enviado) e os dados finais do credenciamento com as respostas do quiz.

Esse modelo usa apenas 1 segredo opcional (token unico): se voce definir esse token no Apps Script, o backend tambem envia o token na requisicao e o script valida.

```javascript
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var expectedToken = PropertiesService.getScriptProperties().getProperty("SHEETS_TOKEN") || "";

    if (expectedToken && body.sheetsToken !== expectedToken) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, message: "Token invalido" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.openById("SEU_SPREADSHEET_ID");
    var summarySheet = ss.getSheetByName("Credenciamentos");
    var answersSheet = ss.getSheetByName("RespostasQuiz");

    if (!summarySheet) {
      summarySheet = ss.insertSheet("Credenciamentos");
      summarySheet.appendRow([
        "DataRegistro",
        "Protocolo",
        "Nome",
        "Email",
        "Empresa",
        "Documento",
        "DataVisita",
        "HoraVisita",
        "QuizScore",
        "QuizTotal",
        "QuizAprovado",
        "Observacoes"
      ]);
    }

    if (!answersSheet) {
      answersSheet = ss.insertSheet("RespostasQuiz");
      answersSheet.appendRow([
        "DataRegistro",
        "Protocolo",
        "Pergunta",
        "RespostaSelecionada",
        "RespostaCorreta",
        "Acertou"
      ]);
    }

    var type = body.type || "finalize";

    summarySheet.appendRow([
      new Date(),
      body.protocol || "",
      body.scheduling?.fullName || "",
      body.scheduling?.email || "",
      body.scheduling?.company || "",
      body.scheduling?.documentId || "",
      body.scheduling?.visitDate || "",
      body.scheduling?.visitTime || "",
      body.quiz?.score ?? "",
      body.quiz?.totalQuestions ?? "",
      body.quiz?.approved ? "SIM" : "NAO",
      (body.scheduling?.notes || "") + " | Tipo: " + type
    ]);

    var answers = body.quiz?.answers || [];

    if (type === "finalize") {
      answers.forEach(function(answer) {
        answersSheet.appendRow([
          new Date(),
          body.protocol || "",
          answer.question || "",
          answer.selectedAnswer || "",
          answer.correctAnswer || "",
          answer.isCorrect ? "SIM" : "NAO"
        ]);
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Configuracao rapida (sem muitas senhas)

1. No Apps Script, abra Configuracoes do projeto > Propriedades do script.
2. Crie a propriedade SHEETS_TOKEN com um valor simples (exemplo: ws-2026-token).
3. Implante como Aplicativo da Web com acesso por URL /exec.
4. Na Vercel, configure:
  - GOOGLE_SHEETS_WEBHOOK_URL = URL /exec do Apps Script
  - GOOGLE_SHEETS_WEBHOOK_TOKEN = mesmo valor de SHEETS_TOKEN

Se preferir zero segredos, nao configure SHEETS_TOKEN no Apps Script e nao configure GOOGLE_SHEETS_WEBHOOK_TOKEN na Vercel.
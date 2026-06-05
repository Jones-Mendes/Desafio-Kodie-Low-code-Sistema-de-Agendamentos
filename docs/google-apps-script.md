# Google Apps Script para Google Sheets

Atualize o Apps Script do seu Web App com o exemplo abaixo para gravar os dados do credenciamento e todas as respostas do quiz na planilha.

```javascript
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
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
      body.scheduling?.notes || ""
    ]);

    var answers = body.quiz?.answers || [];

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

Depois de salvar, publique novamente o Web App e mantenha a URL configurada em [.env.example](.env.example).
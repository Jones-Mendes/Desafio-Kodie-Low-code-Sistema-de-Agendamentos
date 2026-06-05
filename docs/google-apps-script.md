# Google Apps Script para Google Sheets

Se voce quer o jeito mais simples para funcionar rapido, use este modo:

- Crie o Apps Script a partir da propria planilha (Extensoes > Apps Script).
- Nao use openById e nao use token.
- Use apenas a URL /exec na Vercel em GOOGLE_SHEETS_WEBHOOK_URL.

Script pronto para copiar e colar:

```javascript
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, message: "Body ausente" });
    }

    var body = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!ss) {
      return jsonResponse({
        ok: false,
        message: "Abra este script pela planilha (Extensoes > Apps Script)."
      });
    }

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

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, message: String(error) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Passo a passo rapido (modo simples)

1. Abra a planilha onde quer salvar os dados.
2. Va em Extensoes > Apps Script.
3. Apague o codigo atual e cole o script acima.
4. Clique em Implantar > Nova implantacao > Aplicativo da Web.
5. Configure:
   - Executar como: voce.
   - Quem tem acesso: Qualquer pessoa.
6. Copie a URL final que termina com /exec.
7. Na Vercel, configure apenas:
   - GOOGLE_SHEETS_WEBHOOK_URL = URL /exec.
8. Salve e faca Redeploy na Vercel.

## Teste rapido

Envie um formulario no site e confirme nova linha na aba Credenciamentos.
Se nao entrar, abra o Deployments da Vercel e verifique o log da rota /api/visit-scheduling.
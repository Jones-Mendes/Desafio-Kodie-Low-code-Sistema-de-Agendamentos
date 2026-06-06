# Sistema de Credenciamento de Visitantes - Wilson Sons

Aplicação web para pré-cadastro e credenciamento de visitantes, com foco em segurança operacional antes do acesso às instalações.

## Visão do negócio

Este produto atende uma necessidade de operação portuária/industrial: garantir que visitantes só acessem áreas da empresa após cumprir requisitos obrigatórios de segurança.

## Problema que resolve

- Processo manual de credenciamento, sujeito a falhas e retrabalho.
- Falta de padronização do treinamento pré-acesso.
- Dificuldade de comprovar que o visitante foi orientado e aprovado.

## Solução

Fluxo digital único com 5 etapas:

1. Agendamento da visita.
2. Requisitos obrigatórios de segurança.
3. Vídeo de treinamento.
4. Quiz de segurança.
5. Confirmação de credenciamento.

A experiência é orientada para conclusão de etapas e preparo do visitante antes da chegada ao local.

## Modelo de negócio

Modelo operacional B2B interno (compliance e eficiência), com geração de valor por:

- Redução de risco de incidentes.
- Padronização do onboarding de visitantes.
- Rastreabilidade do processo de acesso.
- Menor esforço administrativo em triagem.

## Público-alvo

- Visitantes e prestadores de serviço.
- Equipes internas de Segurança do Trabalho.
- Equipes de Portaria/Controle de Acesso.
- Operação das instalações.

## Proposta de valor

- Para visitantes: processo claro e rápido.
- Para operação: menos gargalo de entrada.
- Para segurança: mais conformidade antes do acesso.
- Para gestão: evidência de cumprimento das etapas.

## Jornada do usuário

1. Acessa a página inicial.
2. Inicia credenciamento.
3. Preenche formulário de agendamento.
4. Consulta regras obrigatórias.
5. Assiste ao treinamento.
6. Realiza quiz.
7. Recebe status de envio e aguarda validação por e-mail.

## Arquitetura técnica

- Frontend: React + Vite + TypeScript + Tailwind CSS.
- Backend: Express (endpoints de suporte).
- Deploy: Vercel (SPA + Function para API).

## Estrutura do projeto

- client: aplicação SPA e páginas.
- server: servidor Express.
- shared: tipos compartilhados.
- api: entrypoint serverless para Vercel.

## Funcionalidades atuais

- Interface completa do fluxo de credenciamento.
- Seções de segurança e orientação visual.
- Espaços preparados para integração com:
  - formulário de agendamento via iframe.
  - vídeo de treinamento via iframe.
  - quiz via iframe.
- Endpoints de exemplo:
  - GET /api/ping
  - GET /api/demo

## Como executar localmente

Pré-requisitos:

- Node.js 18+.
- pnpm (recomendado).

Instalação e execução:

1. Instale as dependências:

```bash
pnpm install
```

2. Rode em desenvolvimento:

```bash
pnpm dev
```

3. Gere a build de produção:

```bash
pnpm build
```

4. Suba a versão buildada:

```bash
pnpm start
```

Alternativa com npm:

```bash
npm install
npm run dev
```

## Scripts disponíveis

- pnpm dev: inicia o ambiente de desenvolvimento com Vite.
- pnpm build: gera build do client e servidor.
- pnpm start: executa servidor de produção.
- pnpm test: executa testes com Vitest.
- pnpm typecheck: valida tipos TypeScript.

## Variáveis de ambiente

- Integração com planilha (escolha uma opção):
  - SHEETDB_API_URL: endpoint da API do SheetDB (URL unica para ambos os fluxos).
  - SHEETDB_API_URL_SCHEDULING: endpoint especifico para agendamento (opcional).
  - SHEETDB_API_URL_FINALIZE: endpoint especifico para finalizacao (opcional).
  - SHEETDB_AUTH_TOKEN: token opcional do SheetDB (se sua API exigir autenticação).
  - GOOGLE_SHEETS_WEBHOOK_URL: URL /exec do Apps Script (fallback, se não usar SheetDB).

- Opcionais:
  - PING_MESSAGE: mensagem personalizada para GET /api/ping.
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, NOTIFICATION_EMAIL (somente se quiser envio de e-mail na finalização).

## Deploy

### Vercel

Configuração principal:

- Framework preset: Vite.
- Build command: pnpm build:client.
- Output directory: dist/spa.
- As rotas de API são atendidas pela Function em api/[...route].ts.
- Configuração mínima na Vercel para planilha: SHEETDB_API_URL.
- Se necessario, adicione SHEETDB_AUTH_TOKEN.
- Se preferir Apps Script, use GOOGLE_SHEETS_WEBHOOK_URL.
- SMTP é opcional e só necessário se quiser envio de e-mail na finalização.
- Use [.env.example](.env.example) como referência para cadastrar as variáveis sem expor segredos.

### Integracao com SheetDB (passo a passo)

1. Crie uma planilha com duas abas (recomendado): `scheduling` e `finalize`.
2. No SheetDB, gere uma API para cada aba e copie as URLs.
3. Na Vercel, configure:
  - `SHEETDB_API_URL_SCHEDULING` com a URL da aba `scheduling`.
  - `SHEETDB_API_URL_FINALIZE` com a URL da aba `finalize`.
  - `SHEETDB_AUTH_TOKEN` somente se sua API estiver protegida.
4. Publique novamente o projeto na Vercel.

Colunas esperadas para aba `scheduling`:

- `form_type`
- `protocol`
- `full_name`
- `email`
- `company`
- `document_id`
- `visit_date`
- `visit_time`
- `notes`
- `accepted_safety_rules`
- `created_at`

Colunas esperadas para aba `finalize`:

- `form_type`
- `protocol`
- `full_name`
- `email`
- `company`
- `document_id`
- `visit_date`
- `visit_time`
- `score`
- `total_questions`
- `approved`
- `answered_at`
- `answers_json`
- `finalized_at`
- `payload_json`

Para o primeiro deploy, basta importar o repositório na Vercel e cadastrar as variáveis de ambiente do backend antes de publicar.

## KPIs sugeridos

- Taxa de conclusão do credenciamento.
- Tempo médio até conclusão.
- Taxa de aprovação no quiz.
- Percentual de visitantes barrados por não conformidade.
- Redução de ocorrências de segurança com visitantes.

## Próximos passos recomendados

1. Substituir os placeholders de iframe pelos links reais de formulário, vídeo e quiz.
2. Persistir status de etapa por visitante no backend.
3. Implementar autenticação e trilha de auditoria.
4. Criar painel administrativo para validação/aprovação.
5. Configurar notificações automáticas por e-mail.

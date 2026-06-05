import { useState } from "react";
import {
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  Clock,
  Video,
  FileText,
  ArrowRight,
  Anchor,
  HardHat,
  Shirt,
  Footprints,
  Shield,
} from "lucide-react";
import {
  CredentialQuizAnswer,
  FinalizeCredentialResponse,
  VisitSchedulingRequest,
  VisitSchedulingResponse,
} from "@shared/api";

type SchedulingFormState = {
  fullName: string;
  email: string;
  company: string;
  documentId: string;
  visitDate: string;
  visitTime: string;
  notes: string;
  acceptedSafetyRules: boolean;
};

type SecurityQuizAnswers = {
  prohibitedItem: string;
  mandatoryEquipment: string;
  openShoesRule: string;
  sleevelessShirtRule: string;
  beforeAccessStep: string;
};

const quizQuestions = {
  prohibitedItem: {
    question: "Qual item e proibido nas instalacoes?",
    options: {
      colete: "Colete de seguranca",
      shorts: "Shorts",
      capacete: "Capacete",
    },
  },
  mandatoryEquipment: {
    question: "Qual equipamento e de uso obrigatorio?",
    options: {
      chapeu: "Chapeu",
      capacete: "Capacete",
      oculos: "Oculos escuros",
    },
  },
  openShoesRule: {
    question: "Sapatos abertos sao permitidos?",
    options: {
      permitido: "Permitido",
      proibido: "Proibido",
    },
  },
  sleevelessShirtRule: {
    question: "Regatas podem ser usadas durante a visita?",
    options: {
      permitido: "Sim",
      proibido: "Nao",
    },
  },
  beforeAccessStep: {
    question: "O que deve ser feito antes de acessar as instalacoes?",
    options: {
      treinamento: "Assistir ao treinamento obrigatorio de seguranca",
      nenhuma: "Nao e necessario nenhum procedimento previo",
    },
  },
} satisfies Record<
  keyof SecurityQuizAnswers,
  {
    question: string;
    options: Record<string, string>;
  }
>;

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

export default function Index() {
  const [currentStep, setCurrentStep] = useState(0);
  const [schedulingCompleted, setSchedulingCompleted] = useState(false);
  const [quizApproved, setQuizApproved] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isFinalizingCredential, setIsFinalizingCredential] = useState(false);
  const [schedulingSuccess, setSchedulingSuccess] = useState<string | null>(null);
  const [schedulingError, setSchedulingError] = useState<string | null>(null);
  const [schedulingProtocol, setSchedulingProtocol] = useState<string | null>(null);
  const [submittedSchedulingData, setSubmittedSchedulingData] =
    useState<VisitSchedulingRequest | null>(null);
  const [schedulingForm, setSchedulingForm] = useState<SchedulingFormState>({
    fullName: "",
    email: "",
    company: "",
    documentId: "",
    visitDate: "",
    visitTime: "",
    notes: "",
    acceptedSafetyRules: false,
  });
  const [quizAnswers, setQuizAnswers] = useState<SecurityQuizAnswers>({
    prohibitedItem: "",
    mandatoryEquipment: "",
    openShoesRule: "",
    sleevelessShirtRule: "",
    beforeAccessStep: "",
  });
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  const todayISO = getTodayISO();

  const steps = [
    { number: 1, title: "Agendamento", icon: Clock, sectionId: "scheduling" },
    { number: 2, title: "Segurança", icon: ShieldAlert, sectionId: "security" },
    { number: 3, title: "Vídeo", icon: Video, sectionId: "training" },
    { number: 4, title: "Quiz", icon: FileText, sectionId: "quiz" },
    { number: 5, title: "Confirmação", icon: CheckCircle, sectionId: "confirmation" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSchedulingChange = (
    field: keyof SchedulingFormState,
    value: string | boolean,
  ) => {
    setSchedulingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSchedulingSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSchedulingError(null);
    setSchedulingSuccess(null);
    setSchedulingProtocol(null);
    setIsScheduling(true);

    if (schedulingForm.visitDate < todayISO) {
      setSchedulingError("Não é permitido agendar para datas passadas.");
      setIsScheduling(false);
      return;
    }

    if (!isWeekday(schedulingForm.visitDate)) {
      setSchedulingError("O agendamento deve ser realizado apenas em dias úteis.");
      setIsScheduling(false);
      return;
    }

    if (!isAllowedTime(schedulingForm.visitTime)) {
      setSchedulingError("O horário permitido é de 08:00 às 17:00.");
      setIsScheduling(false);
      return;
    }

    try {
      const response = await fetch("/api/visit-scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedulingForm),
      });

      const data = (await response.json()) as
        | VisitSchedulingResponse
        | { message?: string };

      if (!response.ok) {
        setSchedulingError(
          data.message ?? "Não foi possível registrar o agendamento.",
        );
        return;
      }

      setSchedulingSuccess(
        data.message ?? "Agendamento enviado com sucesso para validação.",
      );
      setSubmittedSchedulingData({
        fullName: schedulingForm.fullName,
        email: schedulingForm.email,
        company: schedulingForm.company,
        documentId: schedulingForm.documentId,
        visitDate: schedulingForm.visitDate,
        visitTime: schedulingForm.visitTime,
        notes: schedulingForm.notes,
        acceptedSafetyRules: schedulingForm.acceptedSafetyRules,
      });
      setSchedulingCompleted(true);
      setCurrentStep(1);
      if ("protocol" in data && typeof data.protocol === "string") {
        setSchedulingProtocol(data.protocol);
      }

      setSchedulingForm({
        fullName: "",
        email: "",
        company: "",
        documentId: "",
        visitDate: "",
        visitTime: "",
        notes: "",
        acceptedSafetyRules: false,
      });
    } catch {
      setSchedulingError("Erro de conexão. Tente novamente em alguns minutos.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleQuizChange = (
    field: keyof SecurityQuizAnswers,
    value: string,
  ) => {
    setQuizAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuizSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuizError(null);

    const unanswered = Object.values(quizAnswers).some((answer) => !answer);
    if (unanswered) {
      setQuizResult(null);
      setQuizError("Responda todas as perguntas antes de enviar a avaliação.");
      return;
    }

    const correctAnswers: SecurityQuizAnswers = {
      prohibitedItem: "shorts",
      mandatoryEquipment: "capacete",
      openShoesRule: "proibido",
      sleevelessShirtRule: "proibido",
      beforeAccessStep: "treinamento",
    };

    const score = Object.entries(correctAnswers).reduce((total, [key, value]) => {
      const answer = quizAnswers[key as keyof SecurityQuizAnswers];
      return answer === value ? total + 1 : total;
    }, 0);

    const detailedAnswers: CredentialQuizAnswer[] = Object.entries(
      correctAnswers,
    ).map(([key, correctValue]) => {
      const questionKey = key as keyof SecurityQuizAnswers;
      const selectedValue = quizAnswers[questionKey];
      const config = quizQuestions[questionKey];

      return {
        key,
        question: config.question,
        selectedAnswer: config.options[selectedValue] ?? selectedValue,
        correctAnswer: config.options[correctValue] ?? correctValue,
        isCorrect: selectedValue === correctValue,
      };
    });

    const passed = score >= 4;
    setQuizResult({ score, passed });

    if (passed) {
      if (!submittedSchedulingData || !schedulingProtocol) {
        setQuizApproved(false);
        setQuizError(
          "Os dados do agendamento nao foram encontrados. Reenvie o formulario antes de concluir o quiz.",
        );
        return;
      }

      setIsFinalizingCredential(true);

      try {
        const response = await fetch("/api/finalize-credential", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            protocol: schedulingProtocol,
            scheduling: submittedSchedulingData,
            quiz: {
              score,
              totalQuestions: 5,
              approved: true,
              answeredAt: new Date().toISOString(),
              answers: detailedAnswers,
            },
          }),
        });

        const data = (await response.json()) as
          | FinalizeCredentialResponse
          | { message?: string };

        if (!response.ok) {
          setQuizApproved(false);
          setQuizError(
            data.message ??
              "Falha ao enviar os dados finais para planilha e e-mail.",
          );
          return;
        }

        setQuizApproved(true);
        setCurrentStep(4);
        scrollToSection("confirmation");
      } catch {
        setQuizApproved(false);
        setQuizError(
          "Erro de conexao ao finalizar o credenciamento. Tente novamente.",
        );
      } finally {
        setIsFinalizingCredential(false);
      }

      return;
    }

    setQuizApproved(false);
  };

  const handleQuizReset = () => {
    setQuizAnswers({
      prohibitedItem: "",
      mandatoryEquipment: "",
      openShoesRule: "",
      sleevelessShirtRule: "",
      beforeAccessStep: "",
    });
    setQuizError(null);
    setQuizResult(null);
    setQuizApproved(false);
  };

  const securityLocked = !schedulingCompleted;
  const trainingLocked = !schedulingCompleted;
  const quizLocked = !schedulingCompleted;

  const canAccessStep = (index: number) => {
    if (index === 0) {
      return true;
    }

    if (index >= 1 && index <= 3) {
      return schedulingCompleted;
    }

    return schedulingCompleted && quizApproved;
  };

  return (
    <div className="min-h-screen bg-ws-light">
      {/* Header Navigation */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-3">
          <Anchor className="h-8 w-8 text-ws-navy" />
          <h1 className="text-2xl font-bold text-ws-navy">Wilson Sons</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-br from-ws-navy to-ws-ocean text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Credenciamento de Visitantes Wilson Sons
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Realize seu pré-cadastro e treinamento obrigatório de segurança
                antes de acessar nossas instalações.
              </p>
              <button
                onClick={() => scrollToSection("scheduling")}
                className="btn-secondary gap-2 group"
              >
                Iniciar Credenciamento
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="animate-slide-up hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-ws-sky to-blue-400 rounded-2xl opacity-20 blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <svg
                    className="w-full h-auto"
                    viewBox="0 0 300 300"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Ship illustration */}
                    <defs>
                      <linearGradient id="shipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fff", stopOpacity: 0.9 }} />
                        <stop offset="100%" style={{ stopColor: "#e0f2fe", stopOpacity: 0.6 }} />
                      </linearGradient>
                    </defs>

                    {/* Water waves */}
                    <path
                      d="M 0 220 Q 75 210 150 220 T 300 220 L 300 300 L 0 300 Z"
                      fill="rgba(255,255,255,0.2)"
                    />

                    {/* Ship hull */}
                    <path
                      d="M 80 160 L 60 200 L 240 200 L 220 160 Z"
                      fill="url(#shipGradient)"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="2"
                    />

                    {/* Ship deck */}
                    <rect
                      x="80"
                      y="140"
                      width="140"
                      height="25"
                      fill="rgba(255,255,255,0.3)"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="2"
                    />

                    {/* Mast */}
                    <line
                      x1="150"
                      y1="100"
                      x2="150"
                      y2="140"
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="3"
                    />

                    {/* Crane */}
                    <g>
                      <line
                        x1="150"
                        y1="100"
                        x2="200"
                        y2="70"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="200"
                        cy="70"
                        r="8"
                        fill="rgba(255,255,255,0.5)"
                      />
                    </g>

                    {/* Containers */}
                    <g opacity="0.7">
                      <rect
                        x="100"
                        y="120"
                        width="20"
                        height="25"
                        fill="rgba(255,255,255,0.4)"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1"
                      />
                      <rect
                        x="125"
                        y="115"
                        width="20"
                        height="25"
                        fill="rgba(255,255,255,0.4)"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1"
                      />
                      <rect
                        x="155"
                        y="118"
                        width="20"
                        height="25"
                        fill="rgba(255,255,255,0.4)"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section id="process" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Etapas do Credenciamento</h2>
            <p className="section-subtitle">
              Siga os passos abaixo para completar seu credenciamento
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-12">
            <div className="flex justify-between mb-4">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full mb-3 transition-all duration-300 ${
                        idx <= currentStep
                          ? "bg-ws-navy text-white shadow-lg"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-sm font-semibold text-center ${
                        idx <= currentStep ? "text-ws-navy" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-ws-navy to-ws-sky h-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isLocked = !canAccessStep(idx);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    idx <= currentStep
                      ? "border-ws-navy bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  } ${
                    isLocked
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:shadow-lg"
                  }`}
                  onClick={() => {
                    if (!isLocked) {
                      setCurrentStep(idx);
                      scrollToSection(step.sectionId);
                    }
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon
                      className={`h-6 w-6 ${
                        idx <= currentStep ? "text-ws-navy" : "text-gray-400"
                      }`}
                    />
                    <span className="text-xs md:text-sm font-semibold text-center text-ws-navy">
                      {step.number}. {step.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scheduling Section */}
      <section
        id="scheduling"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-ws-light"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 border border-border">
            <h2 className="section-title">Agendamento da Visita</h2>
            <p className="section-subtitle">
              Preencha seus dados para solicitar acesso às instalações da Wilson
              Sons.
            </p>

            <form onSubmit={handleSchedulingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm font-medium text-ws-navy">
                  Nome completo
                  <input
                    type="text"
                    required
                    value={schedulingForm.fullName}
                    onChange={(e) =>
                      handleSchedulingChange("fullName", e.target.value)
                    }
                    placeholder="Seu nome"
                    className="h-11 rounded-lg border border-border px-3 text-base"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-ws-navy">
                  E-mail
                  <input
                    type="email"
                    required
                    value={schedulingForm.email}
                    onChange={(e) => handleSchedulingChange("email", e.target.value)}
                    placeholder="voce@empresa.com"
                    className="h-11 rounded-lg border border-border px-3 text-base"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-ws-navy">
                  Empresa
                  <input
                    type="text"
                    required
                    value={schedulingForm.company}
                    onChange={(e) => handleSchedulingChange("company", e.target.value)}
                    placeholder="Nome da empresa"
                    className="h-11 rounded-lg border border-border px-3 text-base"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-ws-navy">
                  Documento (CPF/RG)
                  <input
                    type="text"
                    required
                    value={schedulingForm.documentId}
                    onChange={(e) =>
                      handleSchedulingChange("documentId", e.target.value)
                    }
                    placeholder="Informe seu documento"
                    className="h-11 rounded-lg border border-border px-3 text-base"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-ws-navy">
                  Data da visita
                  <input
                    type="date"
                    required
                    min={todayISO}
                    value={schedulingForm.visitDate}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      if (!selectedDate) {
                        handleSchedulingChange("visitDate", selectedDate);
                        return;
                      }

                      if (selectedDate < todayISO) {
                        setSchedulingError("Não é permitido agendar para datas passadas.");
                        return;
                      }

                      if (!isWeekday(selectedDate)) {
                        setSchedulingError("Selecione apenas dias úteis (segunda a sexta).");
                        return;
                      }

                      setSchedulingError(null);
                      handleSchedulingChange("visitDate", selectedDate);
                    }}
                    className="h-11 rounded-lg border border-border px-3 text-base"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-ws-navy">
                  Horário previsto
                  <input
                    type="time"
                    required
                    min="08:00"
                    max="17:00"
                    step={1800}
                    value={schedulingForm.visitTime}
                    onChange={(e) => {
                      const selectedTime = e.target.value;
                      if (!selectedTime) {
                        handleSchedulingChange("visitTime", selectedTime);
                        return;
                      }

                      if (!isAllowedTime(selectedTime)) {
                        setSchedulingError("Informe um horário entre 08:00 e 17:00.");
                        return;
                      }

                      setSchedulingError(null);
                      handleSchedulingChange("visitTime", selectedTime);
                    }}
                    className="h-11 rounded-lg border border-border px-3 text-base"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium text-ws-navy">
                Observações
                <textarea
                  value={schedulingForm.notes}
                  onChange={(e) => handleSchedulingChange("notes", e.target.value)}
                  placeholder="Informações adicionais da visita"
                  rows={4}
                  className="rounded-lg border border-border px-3 py-2 text-base"
                />
              </label>

              <label className="flex items-start gap-3 text-sm text-ws-slate">
                <input
                  type="checkbox"
                  required
                  checked={schedulingForm.acceptedSafetyRules}
                  onChange={(e) =>
                    handleSchedulingChange("acceptedSafetyRules", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-border"
                />
                Declaro que li e aceito cumprir os requisitos obrigatórios de
                segurança para acesso às instalações.
              </label>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="btn-primary w-full md:w-auto disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isScheduling ? "Enviando agendamento..." : "Enviar agendamento"}
                </button>

                {schedulingError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {schedulingError}
                  </p>
                )}

                {schedulingSuccess && (
                  <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {schedulingSuccess}
                    {schedulingProtocol && ` Protocolo: ${schedulingProtocol}.`}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Security Requirements Section */}
      <section id="security" className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={securityLocked ? "pointer-events-none opacity-40 select-none" : ""}>
          <div className="text-center mb-12">
            <h2 className="section-title">Requisitos Obrigatórios de Segurança</h2>
            <p className="section-subtitle">
              O acesso ao estaleiro está condicionado ao cumprimento das normas
              de segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Prohibited Items Card */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 border-2 border-red-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <h3 className="text-2xl font-bold text-red-700">Itens Proibidos</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: Shirt, label: "Regatas" },
                  { icon: Shirt, label: "Shorts" },
                  { icon: Footprints, label: "Sapatos abertos" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <li key={idx} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-red-600" />
                      <span className="text-red-800 font-semibold">{item.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Required Equipment Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-bold text-green-700">
                  Equipamentos Obrigatórios
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: HardHat, label: "Capacete" },
                  { icon: Footprints, label: "Botas de segurança" },
                  { icon: Shield, label: "Colete de segurança" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <li key={idx} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-semibold">{item.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Alert */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-yellow-800 mb-2">Atenção</h4>
                <p className="text-yellow-700">
                  A não conformidade com estas regras poderá impedir o acesso às
                  instalações.
                </p>
              </div>
            </div>
          </div>
          </div>

          {securityLocked && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="max-w-xl rounded-xl border border-ws-sky bg-white/95 p-6 text-center shadow-xl backdrop-blur-sm">
                <h3 className="mb-2 text-xl font-bold text-ws-navy">Etapa bloqueada</h3>
                <p className="mb-4 text-ws-slate">
                  Finalize o formulário de agendamento para liberar as etapas de segurança.
                </p>
                <button
                  type="button"
                  onClick={() => scrollToSection("scheduling")}
                  className="btn-primary"
                >
                  Ir para Agendamento
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Training Video Section */}
      <section id="training" className="relative py-16 px-4 sm:px-6 lg:px-8 bg-ws-light">
        <div className="max-w-5xl mx-auto">
          <div className={trainingLocked ? "pointer-events-none opacity-40 select-none" : ""}>
          <div className="text-center mb-12">
            <h2 className="section-title">Treinamento de Segurança</h2>
            <p className="section-subtitle">
              Assista ao vídeo obrigatório antes de prosseguir para a avaliação
              de segurança.
            </p>
          </div>

          {/* Video container */}
          <div className="rounded-xl overflow-hidden shadow-xl border border-border bg-white">
            {/* COLAR IFRAME DO VÍDEO AQUI */}
            <iframe
              width="100%"
              height="600"
              src="https://www.youtube.com/embed/EqGF7HkI-GY"
              title="Treinamento de Segurança"
              className="block"
            ></iframe>
          </div>

          <p className="text-center mt-8 text-ws-slate text-lg">
            Após assistir ao vídeo, realize a avaliação de segurança.
          </p>
          </div>

          {trainingLocked && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="max-w-xl rounded-xl border border-ws-sky bg-white/95 p-6 text-center shadow-xl backdrop-blur-sm">
                <h3 className="mb-2 text-xl font-bold text-ws-navy">Treinamento bloqueado</h3>
                <p className="mb-4 text-ws-slate">
                  Envie o agendamento da visita para liberar esta etapa.
                </p>
                <button
                  type="button"
                  onClick={() => scrollToSection("scheduling")}
                  className="btn-primary"
                >
                  Ir para Agendamento
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Security Quiz Section */}
      <section id="quiz" className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className={quizLocked ? "pointer-events-none opacity-40 select-none" : ""}>
          <div className="text-center mb-12">
            <h2 className="section-title">Quiz de Avaliação de Segurança</h2>
            <p className="section-subtitle mx-auto">
              Para concluir seu credenciamento é necessário obter aprovação no questionário de segurança.
            </p>
          </div>

          {/* Objective card */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-8 border-2 border-ws-sky mb-8">
            <div className="flex gap-4">
              <FileText className="h-8 w-8 text-ws-navy flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-ws-navy mb-2">🎯 Objetivo</h3>
                <p className="text-ws-slate">
                  Garantir que todos os visitantes compreendam as normas básicas
                  de segurança antes de acessar o estaleiro.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleQuizSubmit}
            className="rounded-lg border border-border bg-ws-light p-6 md:p-8 space-y-6"
          >
            <fieldset className="space-y-3">
              <legend className="font-semibold text-ws-navy">
                1. Qual item é proibido nas instalações?
              </legend>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="prohibitedItem"
                  value="colete"
                  checked={quizAnswers.prohibitedItem === "colete"}
                  onChange={(e) =>
                    handleQuizChange("prohibitedItem", e.target.value)
                  }
                />
                Colete de segurança
              </label>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="prohibitedItem"
                  value="shorts"
                  checked={quizAnswers.prohibitedItem === "shorts"}
                  onChange={(e) =>
                    handleQuizChange("prohibitedItem", e.target.value)
                  }
                />
                Shorts
              </label>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="prohibitedItem"
                  value="capacete"
                  checked={quizAnswers.prohibitedItem === "capacete"}
                  onChange={(e) =>
                    handleQuizChange("prohibitedItem", e.target.value)
                  }
                />
                Capacete
              </label>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="font-semibold text-ws-navy">
                2. Qual equipamento é de uso obrigatório?
              </legend>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="mandatoryEquipment"
                  value="chapeu"
                  checked={quizAnswers.mandatoryEquipment === "chapeu"}
                  onChange={(e) =>
                    handleQuizChange("mandatoryEquipment", e.target.value)
                  }
                />
                Chapéu
              </label>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="mandatoryEquipment"
                  value="capacete"
                  checked={quizAnswers.mandatoryEquipment === "capacete"}
                  onChange={(e) =>
                    handleQuizChange("mandatoryEquipment", e.target.value)
                  }
                />
                Capacete
              </label>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="mandatoryEquipment"
                  value="oculos"
                  checked={quizAnswers.mandatoryEquipment === "oculos"}
                  onChange={(e) =>
                    handleQuizChange("mandatoryEquipment", e.target.value)
                  }
                />
                Óculos escuros
              </label>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="font-semibold text-ws-navy">
                3. Sapatos abertos são permitidos?
              </legend>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="openShoesRule"
                  value="permitido"
                  checked={quizAnswers.openShoesRule === "permitido"}
                  onChange={(e) =>
                    handleQuizChange("openShoesRule", e.target.value)
                  }
                />
                Permitido
              </label>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="openShoesRule"
                  value="proibido"
                  checked={quizAnswers.openShoesRule === "proibido"}
                  onChange={(e) =>
                    handleQuizChange("openShoesRule", e.target.value)
                  }
                />
                Proibido
              </label>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="font-semibold text-ws-navy">
                4. Regatas podem ser usadas durante a visita?
              </legend>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="sleevelessShirtRule"
                  value="permitido"
                  checked={quizAnswers.sleevelessShirtRule === "permitido"}
                  onChange={(e) =>
                    handleQuizChange("sleevelessShirtRule", e.target.value)
                  }
                />
                Sim
              </label>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="sleevelessShirtRule"
                  value="proibido"
                  checked={quizAnswers.sleevelessShirtRule === "proibido"}
                  onChange={(e) =>
                    handleQuizChange("sleevelessShirtRule", e.target.value)
                  }
                />
                Não
              </label>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="font-semibold text-ws-navy">
                5. O que deve ser feito antes de acessar as instalações?
              </legend>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="beforeAccessStep"
                  value="treinamento"
                  checked={quizAnswers.beforeAccessStep === "treinamento"}
                  onChange={(e) =>
                    handleQuizChange("beforeAccessStep", e.target.value)
                  }
                />
                Assistir ao treinamento obrigatório de segurança
              </label>
              <label className="flex items-center gap-3 text-ws-slate">
                <input
                  type="radio"
                  name="beforeAccessStep"
                  value="nenhuma"
                  checked={quizAnswers.beforeAccessStep === "nenhuma"}
                  onChange={(e) =>
                    handleQuizChange("beforeAccessStep", e.target.value)
                  }
                />
                Não é necessário nenhum procedimento prévio
              </label>
            </fieldset>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isFinalizingCredential || quizApproved}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isFinalizingCredential
                  ? "Finalizando credenciamento..."
                  : "Enviar avaliação"}
              </button>
              <button
                type="button"
                onClick={handleQuizReset}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-6 py-3 font-semibold text-ws-navy transition-all duration-300 hover:bg-slate-50"
              >
                Refazer avaliação
              </button>
            </div>

            {quizError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {quizError}
              </p>
            )}

            {quizResult && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  quizResult.passed
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-yellow-200 bg-yellow-50 text-yellow-700"
                }`}
              >
                {quizResult.passed
                  ? `Aprovado. Você acertou ${quizResult.score} de 5 perguntas.`
                  : `Você acertou ${quizResult.score} de 5. Revise o conteúdo de segurança e tente novamente.`}
              </div>
            )}
          </form>
          </div>

          {quizLocked && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="max-w-xl rounded-xl border border-ws-sky bg-white/95 p-6 text-center shadow-xl backdrop-blur-sm">
                <h3 className="mb-2 text-xl font-bold text-ws-navy">Avaliação bloqueada</h3>
                <p className="mb-4 text-ws-slate">
                  Primeiro conclua o formulário de agendamento para desbloquear o quiz.
                </p>
                <button
                  type="button"
                  onClick={() => scrollToSection("scheduling")}
                  className="btn-primary"
                >
                  Ir para Agendamento
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Success Section */}
      {quizApproved && (
        <section id="confirmation" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 animate-bounce">
              <CheckCircle className="h-24 w-24 text-green-600 mx-auto" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-6">
              Credenciamento Registrado
            </h2>
            <p className="text-xl text-green-700 mb-8 leading-relaxed">
              Seu credenciamento foi enviado com sucesso. Após a validação das
              informações e conclusão das etapas obrigatórias, você receberá uma
              confirmação por e-mail.
            </p>
            <button
              onClick={() => scrollToSection("hero")}
              className="btn-primary gap-2"
            >
              Voltar ao Início
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-ws-navy text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2 flex items-center justify-center gap-2">
            <Anchor className="h-5 w-5" />
            Wilson Sons - Sistema de Credenciamento de Visitantes
          </p>
          <p className="text-sm text-blue-100">
            © 2024 Wilson Sons. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

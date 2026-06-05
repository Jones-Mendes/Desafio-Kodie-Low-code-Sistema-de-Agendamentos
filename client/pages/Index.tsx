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

export default function Index() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { number: 1, title: "Agendamento", icon: Clock },
    { number: 2, title: "Segurança", icon: ShieldAlert },
    { number: 3, title: "Vídeo", icon: Video },
    { number: 4, title: "Quiz", icon: FileText },
    { number: 5, title: "Confirmação", icon: CheckCircle },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
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
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                    idx <= currentStep
                      ? "border-ws-navy bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  onClick={() => setCurrentStep(idx)}
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

            {/* Google Forms iframe container */}
            <div className="rounded-lg overflow-hidden shadow-md border border-border">
              {/* COLAR IFRAME FORMULÁRIO DE AGENDAMENTO AQUI */}
              <iframe
                src="COLE_AQUI_O_IFRAME_DO_FORMULARIO_DE_AGENDAMENTO"
                width="100%"
                height="900"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                className="block"
              >
                Carregando…
              </iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Security Requirements Section */}
      <section id="security" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
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
      </section>

      {/* Training Video Section */}
      <section id="training" className="py-16 px-4 sm:px-6 lg:px-8 bg-ws-light">
        <div className="max-w-5xl mx-auto">
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
              src="COLE_AQUI_O_IFRAME_DO_VIDEO"
              title="Treinamento de Segurança"
              className="block"
            ></iframe>
          </div>

          <p className="text-center mt-8 text-ws-slate text-lg">
            Após assistir ao vídeo, realize a avaliação de segurança.
          </p>
        </div>
      </section>

      {/* Security Quiz Section */}
      <section id="quiz" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Avaliação de Segurança</h2>
            <p className="section-subtitle">
              Para concluir seu credenciamento é necessário obter aprovação no
              questionário de segurança.
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

          {/* Quiz iframe container */}
          <div className="rounded-lg overflow-hidden shadow-md border border-border">
            {/* COLAR IFRAME FORMULÁRIO QUIZ AQUI */}
            <iframe
              src="COLE_AQUI_O_IFRAME_DO_FORMULARIO_QUIZ"
              width="100%"
              height="900"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              className="block"
            >
              Carregando…
            </iframe>
          </div>
        </div>
      </section>

      {/* Success Section */}
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

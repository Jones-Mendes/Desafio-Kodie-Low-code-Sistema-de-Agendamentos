/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface VisitSchedulingRequest {
  fullName: string;
  email: string;
  company: string;
  documentId: string;
  visitDate: string;
  visitTime: string;
  notes?: string;
  acceptedSafetyRules: boolean;
}

export interface VisitSchedulingResponse {
  message: string;
  protocol: string;
}

export interface CredentialQuizAnswer {
  key: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface CredentialQuizSubmission {
  score: number;
  totalQuestions: number;
  approved: boolean;
  answeredAt: string;
  answers: CredentialQuizAnswer[];
}

export interface FinalizeCredentialRequest {
  protocol: string;
  scheduling: VisitSchedulingRequest;
  quiz: CredentialQuizSubmission;
}

export interface FinalizeCredentialResponse {
  message: string;
}

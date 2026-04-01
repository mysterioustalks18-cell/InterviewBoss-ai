export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Screen = 'LANDING' | 'HOME' | 'EVOLUTION' | 'PRACTICE' | 'LOADING' | 'RESULTS' | 'COPILOT' | 'RESUME_HOME' | 'RESUME_EDITOR' | 'RESUME_ANALYSIS' | 'RESUME_TRANSITION' | 'INTERVIEW' | 'RESUME_TEMPLATES' | 'MARKETING' | 'LOGIN' | 'SIGNUP' | 'SECURITY_AUDIT' | 'BRAND_IDENTITY' | 'VERIFY_EMAIL' | 'RESET_PASSWORD' | 'VOICE_MODE' | 'PRICING' | 'SMART_INTERVIEW' | 'CODE' | 'SETTINGS';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: 'FREE' | 'BASIC' | 'PRO';
  isVerified?: boolean;
  usage: {
    resumes: number;
    interviews: number;
    codeAudits: number;
    lastReset: string;
  };
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
export type PersonaType = 'HRDirector' | 'TechLead' | 'CEO';
export type GameMode = 'EVOLUTION' | 'PRACTICE' | 'INTERVIEW';
export type InterviewFocus = 'Technical' | 'Behavioral' | 'Strategic';
export type DialogueStyle = 'Professional' | 'Sarcastic' | 'Supportive' | 'Aggressive';
export type InterviewerPersona = 'Skeptic' | 'Visionary' | 'Empathetic' | 'DrillSergeant';

export interface ResumeData {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: {
    id: string;
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    year: string;
  }[];
  projects?: {
    id: string;
    title: string;
    description: string;
    link?: string;
    technologies?: string[];
  }[];
}

export interface ResumeAnalysis {
  resume_score: number;
  jd_match_score?: number;
  strengths: string[];
  weaknesses: string[];
  missing_metrics: string[];
  keyword_gaps: string[];
  impact_level: 'Low' | 'Medium' | 'High';
  rewrite_suggestions: {
    original: string;
    improved: string;
    reason: string;
  }[];
  ats_score: number;
}

export interface AnalysisResult {
  clarity: number;
  confidence: number;
  structure: number;
  relevance: number;
  authenticity: number;
  hire_probability: number;
  eq_score: number;
  pace_score: number;
  technical_depth: number;
  strategic_alignment: number;
  confidence_analysis: string;
  professional_feedback: string;
  savage_feedback: string;
  improved_answer: string;
  key_takeaways: string[];
}

export interface EvolutionState {
  mode: GameMode;
  difficulty: Difficulty;
  personaType: PersonaType;
  focus: InterviewFocus;
  dialogueStyle: DialogueStyle;
  question: string;
  userAnswer: string;
  personaHealth: number;
  userHealth: number;
  xp: number;
  level: number;
  resume?: string;
  resumeData?: ResumeData;
  resumeAnalysis?: ResumeAnalysis;
  jobDescription?: string;
  customPersonaPrompt?: string;
  interviewSession?: InterviewSession;
}

export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export interface InterviewSession {
  role: string;
  experience: 'Fresher' | 'Experienced';
  persona: InterviewerPersona;
  resume?: string;
  jobDescription?: string;
  messages: ChatMessage[];
  currentQuestionIndex: number;
  totalQuestions: number;
  isFinished: boolean;
  feedback?: InterviewFeedback;
}

export interface InterviewFeedback {
  overall_score: number;
  communication: number;
  confidence: number;
  relevance: number;
  strengths: string[];
  weaknesses: string[];
  improved_answers: {
    question: string;
    answer: string;
    improved: string;
  }[];
}

export interface EvolutionAnalysis {
  current_analysis: {
    strengths: string[];
    weaknesses: string[];
  };
  pattern_detection: string[];
  progress_tracking: {
    metric: string;
    previous: number;
    current: number;
    trend: 'improving' | 'declining' | 'stable';
  }[];
  truth_insight: string;
  improvement_plan: string[];
  focus_area: string;
}

export interface Task {
  id: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High';
  category: string;
}

export interface TaskColumn {
  id: string;
  title: string;
  taskIds: string[];
}

export interface TaskBoardData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: TaskColumn };
  columnOrder: string[];
}

export interface UserHistory {
  past_analyses: AnalysisResult[];
  past_evolution_insights: EvolutionAnalysis[];
  total_sessions: number;
  last_session_date: string;
}

export interface SecurityAuditResult {
  summary: {
    content: string;
    posture: string;
  };
  vulnerabilities: {
    name: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    location: string;
    explanation: string;
    remediation: string;
    impact: string;
    fixed_code?: string;
  }[];
  best_practices: string[];
  risk_score: number;
  verdict: 'Safe' | 'Needs Improvement' | 'High Risk';
  secure_version?: string;
}

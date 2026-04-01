import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ResumeData, ResumeAnalysis, ChatMessage, InterviewFeedback, SecurityAuditResult, EvolutionAnalysis } from "../types";
import { extractJSON } from "../lib/utils";

function getApiKey(model: string): string {
  // Paid models that require user-selected API key
  const paidModels = [
    'veo-3.1-fast-generate-preview',
    'veo-3.1-generate-preview',
    'gemini-3.1-flash-image-preview',
    'gemini-3-pro-image-preview',
    'gemini-3.1-pro-preview' // Pro models often require paid keys
  ];

  if (paidModels.includes(model)) {
    return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  }

  return process.env.GEMINI_API_KEY || process.env.API_KEY || '';
}

function getAI(model: string): GoogleGenAI {
  const apiKey = getApiKey(model);
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please ensure an API key is available.");
  }
  return new GoogleGenAI({ apiKey });
}

export const getErrorInfo = (error: any) => {
  const message = error?.message || String(error);
  
  if (message.includes("API_KEY_INVALID") || message.includes("API key not found") || message.includes("403") || message.includes("permission")) {
    return {
      type: 'API Key',
      message: 'Invalid or missing API key. Please ensure you have selected a valid paid Gemini API key.',
      suggestion: 'Click "Select API Key" to choose a valid key from your Google Cloud project.'
    };
  }
  
  if (message.includes("quota") || message.includes("429") || message.includes("Rate limit")) {
    return {
      type: 'Quota',
      message: 'API quota exceeded or rate limit reached.',
      suggestion: 'Please wait a few minutes before trying again or check your billing status.'
    };
  }
  
  if (message.includes("fetch") || message.includes("network") || message.includes("Failed to execute 'fetch'")) {
    return {
      type: 'Network',
      message: 'Network connection error. Failed to reach the AI engine.',
      suggestion: 'Check your internet connection and ensure no firewalls are blocking the request.'
    };
  }
  
  if (message.includes("parse") || message.includes("JSON")) {
    return {
      type: 'Parsing',
      message: 'Failed to parse the analysis report.',
      suggestion: 'The input might be too complex or malformed. Try simplifying the code or checking for syntax errors.'
    };
  }
  
  if (message.includes("safety") || message.includes("blocked") || message.includes("HARM_CATEGORY")) {
    return {
      type: 'Safety',
      message: 'Content flagged by safety filters.',
      suggestion: 'The AI engine cannot analyze potentially harmful or sensitive material. Ensure your code follows safety guidelines.'
    };
  }
  
  return {
    type: 'Unknown',
    message: 'An unexpected error occurred during analysis.',
    suggestion: 'Try refreshing the page or checking the console for more details.'
  };
};

async function handleGeminiError(error: any, operation: string) {
  console.error(`Gemini API Error during ${operation}:`, error);
  
  const message = error?.message || "";
  
  if (message.includes("API_KEY_INVALID") || message.includes("API key not found")) {
    throw new Error("Invalid Gemini API key. Please check your configuration in the environment settings.");
  }
  if (message.includes("quota") || message.includes("429") || message.includes("Rate limit")) {
    throw new Error("Gemini API quota exceeded or rate limit reached. Please wait a moment and try again.");
  }
  if (message.includes("safety") || message.includes("blocked") || message.includes("HARM_CATEGORY")) {
    throw new Error("The content was flagged by safety filters. The AI engine cannot analyze potentially harmful or sensitive material.");
  }
  if (message.includes("fetch") || message.includes("network") || message.includes("Failed to execute 'fetch'")) {
    throw new Error("Network connection error. Please check your internet connection and try again.");
  }
  if (message.includes("parse") || message.includes("JSON")) {
    throw new Error("Failed to parse the security analysis report. The input might be too complex or malformed.");
  }
  
  throw error;
}

export async function performSecurityAudit(code: string, language: string = 'auto'): Promise<SecurityAuditResult> {
  const model = "gemini-3.1-pro-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    Analyze the following ${language !== 'auto' ? language : 'source code/input'} as the PersonaOS elite cybersecurity analyst.
    
    INPUT:
    "${code}"
    
    Return the analysis in a structured JSON format.
    Include a "secure_version" field which is the full input code rewritten with all identified security vulnerabilities fixed.
    For each vulnerability, provide a "fixed_code" snippet showing just that specific fix.
    `,
    config: {
      systemInstruction: `
      You are the PersonaOS elite cybersecurity analyst and secure coding expert with deep expertise in OWASP Top 10, network security, and application vulnerabilities.
      Your role is strictly DEFENSIVE and EDUCATIONAL. You analyze inputs and provide security insights. You DO NOT assist in exploitation, illegal hacking, or bypassing systems.

      TASK:
      Analyze the input and respond in a structured JSON format matching the provided schema.

      RULES:
      - ❌ Do NOT provide exploit payloads, attack scripts, or hacking steps
      - ❌ Do NOT provide guide on bypassing security systems
      - ✅ Focus only on detection, explanation, and prevention
      - ✅ If input is unclear, ask for clarification within the summary
      - ✅ If no vulnerabilities found, still provide improvement suggestions
      - ✅ Provide a full "secure_version" of the code if applicable.
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING, description: "Briefly explain what the input contains" },
              posture: { type: Type.STRING, description: "Identify the general security posture" }
            },
            required: ["content", "posture"]
          },
          vulnerabilities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of vulnerability" },
                severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
                location: { type: Type.STRING, description: "Where it appears (line, section, or pattern)" },
                explanation: { type: Type.STRING, description: "Explain each vulnerability in simple terms (beginner-friendly)" },
                remediation: { type: Type.STRING, description: "Provide clear, step-by-step fixes and secure code examples" },
                impact: { type: Type.STRING, description: "What could happen if not fixed (business/user impact)" },
                fixed_code: { type: Type.STRING, description: "A code snippet showing the specific fix for this vulnerability" }
              },
              required: ["name", "severity", "location", "explanation", "remediation", "impact"]
            }
          },
          best_practices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Preventive measures and secure coding tips relevant to the issue"
          },
          risk_score: { type: Type.NUMBER, description: "Overall risk score (0–100)" },
          verdict: { type: Type.STRING, enum: ["Safe", "Needs Improvement", "High Risk"] },
          secure_version: { type: Type.STRING, description: "The full input code with all security issues resolved" }
        },
        required: ["summary", "vulnerabilities", "best_practices", "risk_score", "verdict"]
      }
    }
  });

  return extractJSON(response.text || "{}") || {
    summary: { content: "Analysis failed", posture: "Unknown" },
    vulnerabilities: [],
    best_practices: [],
    risk_score: 0,
    verdict: "Safe"
  };
} catch (error) {
    await handleGeminiError(error, "performSecurityAudit");
    return {
      summary: { content: "Analysis failed", posture: "Unknown" },
      vulnerabilities: [],
      best_practices: [],
      risk_score: 0,
      verdict: "Safe"
    };
  }
}

export async function generateResume(data: Partial<ResumeData>): Promise<ResumeData> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    Generate a full professional resume based on the following information:
    Name: ${data.name}
    Role: ${data.role}
    Skills: ${data.skills?.join(", ")}
    Experience: ${JSON.stringify(data.experience)}
    Education: ${JSON.stringify(data.education)}
    Projects: ${JSON.stringify(data.projects)}
    
    Return the resume in a structured JSON format.
    Ensure bullet points are impactful and use strong action verbs.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          location: { type: Type.STRING },
          summary: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                company: { type: Type.STRING },
                role: { type: Type.STRING },
                duration: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["id", "company", "role", "duration", "bullets"]
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                school: { type: Type.STRING },
                degree: { type: Type.STRING },
                year: { type: Type.STRING },
              },
              required: ["id", "school", "degree", "year"]
            }
          },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                link: { type: Type.STRING },
                technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["id", "title", "description"]
            }
          }
        },
        required: ["name", "role", "skills", "experience", "education"]
      }
    }
  });

  return extractJSON(response.text || "{}") || {
    name: data.name || "",
    role: data.role || "",
    skills: data.skills || [],
    experience: data.experience || [],
    education: data.education || [],
    projects: data.projects || []
  };
} catch (error) {
    await handleGeminiError(error, "generateResume");
    return {
      name: data.name || "",
      role: data.role || "",
      skills: data.skills || [],
      experience: data.experience || [],
      education: data.education || [],
      projects: data.projects || []
    };
  }
}

export async function rewriteResume(data: ResumeData, jd: string = ""): Promise<ResumeData> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    Rewrite the following resume to make it more professional, impactful, and keyword-rich for the role of "${data.role}"${jd ? ` specifically tailored to this Job Description: "${jd}"` : ""}.
    Improve all bullet points using strong action verbs and quantifiable metrics where possible.
    Ensure the summary is compelling and the skills are relevant.
    
    RESUME DATA:
    ${JSON.stringify(data)}
    
    Return the improved resume in the exact same JSON structure.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          location: { type: Type.STRING },
          summary: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                company: { type: Type.STRING },
                role: { type: Type.STRING },
                duration: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["id", "company", "role", "duration", "bullets"]
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                school: { type: Type.STRING },
                degree: { type: Type.STRING },
                year: { type: Type.STRING },
              },
              required: ["id", "school", "degree", "year"]
            }
          },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                link: { type: Type.STRING },
                technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["id", "title", "description"]
            }
          }
        },
        required: ["name", "role", "skills", "experience", "education"]
      }
    }
  });

  return extractJSON(response.text || "{}") || data;
} catch (error) {
    await handleGeminiError(error, "rewriteResume");
    return data;
  }
}

export async function analyzeResume(resumeText: string, role: string, jd: string = ""): Promise<ResumeAnalysis> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    Analyze the following resume for the role of "${role}"${jd ? ` against this Job Description: "${jd}"` : ""}:
    
    RESUME TEXT:
    "${resumeText}"
    
    Provide a detailed analysis including a score (0-100), strengths, weaknesses, missing metrics, keyword gaps, impact level, and specific rewrite suggestions.
    Also calculate an ATS (Applicant Tracking System) compatibility score.
    ${jd ? 'Since a Job Description was provided, also calculate a "jd_match_score" (0-100) based on how well the resume matches the specific requirements and keywords in the JD.' : ''}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          resume_score: { type: Type.NUMBER },
          jd_match_score: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          missing_metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyword_gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          impact_level: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          rewrite_suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                improved: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["original", "improved", "reason"]
            }
          },
          ats_score: { type: Type.NUMBER },
        },
        required: ["resume_score", "strengths", "weaknesses", "missing_metrics", "keyword_gaps", "impact_level", "rewrite_suggestions", "ats_score"]
      }
    }
  });

  return extractJSON(response.text || "{}") || {
    resume_score: 50,
    strengths: ["Resume parsed"],
    weaknesses: ["Analysis failed"],
    missing_metrics: [],
    keyword_gaps: [],
    impact_level: "Medium",
    rewrite_suggestions: [],
    ats_score: 50
  };
} catch (error) {
    await handleGeminiError(error, "analyzeResume");
    return {
      resume_score: 50,
      strengths: ["Resume parsed"],
      weaknesses: ["Analysis failed"],
      missing_metrics: [],
      keyword_gaps: [],
      impact_level: "Medium",
      rewrite_suggestions: [],
      ats_score: 50
    };
  }
}

export async function improveBullet(bullet: string, role: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    Improve the following resume bullet point for a "${role}" position.
    Make it more impactful, add quantifiable metrics if possible, and use strong action verbs.
    
    BULLET: "${bullet}"
    
    Return only the improved bullet point text.
    `,
  });

  return response.text || bullet;
} catch (error) {
    await handleGeminiError(error, "improveBullet");
    return bullet;
  }
}

export async function getRealtimeSuggestions(text: string, role: string, jd: string = ""): Promise<{ suggestions: string[], weakWords: string[] }> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    Analyze the following text for a resume for the role of "${role}".
    ${jd ? `The target Job Description is: "${jd}"` : ""}
    Identify weak words (e.g., "helped", "worked on", "responsible for") and provide suggestions for improvement.
    If a Job Description is provided, suggest specific keywords or skills that are missing or could be emphasized more.
    
    TEXT: "${text}"
    
    Return JSON format:
    {
      "suggestions": ["..."],
      "weakWords": ["..."]
    }
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          weakWords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["suggestions", "weakWords"]
      }
    }
  });

  return extractJSON(response.text || "{}") || {
    suggestions: [],
    weakWords: []
  };
} catch (error) {
    await handleGeminiError(error, "getRealtimeSuggestions");
    return {
      suggestions: [],
      weakWords: []
    };
  }
}

export async function generateKeywords(role: string, experience: string): Promise<string[]> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    Generate a list of 15-20 high-impact, ATS-friendly keywords and technical skills for a "${role}" position with "${experience}" level of experience.
    Return only a JSON array of strings.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return extractJSON(response.text || "[]") || [];
} catch (error) {
    await handleGeminiError(error, "generateKeywords");
    return [];
  }
}

export async function analyzeAnswer(
  question: string, 
  answer: string, 
  difficulty: string, 
  personaType: string,
  focus: string,
  dialogueStyle: string,
  resume: string = "",
  jd: string = "",
  customPersonaPrompt: string = ""
): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    You are the PersonaOS AI Interviewer of type "${personaType}" at a "${difficulty}" difficulty level.
    The interview focus is "${focus}".
    Your dialogue style is "${dialogueStyle}".
    ${customPersonaPrompt ? `ADDITIONAL PERSONALITY TRAITS: "${customPersonaPrompt}"` : ""}
    
    BEHAVIOR GUIDELINES:
    - Focus: ${focus === 'Technical' ? 'Deep dive into technical skills, architecture, and problem-solving.' : focus === 'Behavioral' ? 'Focus on soft skills, past experiences, and STAR method.' : 'Focus on business impact, long-term vision, and strategic thinking.'}
    - Style: ${dialogueStyle === 'Professional' ? 'Formal, objective, and standard corporate tone.' : dialogueStyle === 'Sarcastic' ? 'Witty, slightly mocking, and uses dry humor.' : dialogueStyle === 'Supportive' ? 'Encouraging, patient, and provides positive reinforcement.' : 'High pressure, rapid-fire, and extremely demanding.'}
    ${customPersonaPrompt ? `- Custom Personality: Incorporate these traits into your feedback and persona: ${customPersonaPrompt}` : ""}
    
    CONTEXT:
    User Resume: ${resume || "Not provided"}
    Job Description: ${jd || "Not provided"}
    
    QUESTION: "${question}"
    USER ANSWER: "${answer}"
    
    Analyze the response and provide a detailed analysis in JSON format.
    Include EQ (Emotional Intelligence), Pace, Technical Depth, and Strategic Alignment scores.
    Provide "key_takeaways" as an array of 3-5 short points.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clarity: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          structure: { type: Type.NUMBER },
          relevance: { type: Type.NUMBER },
          authenticity: { type: Type.NUMBER },
          hire_probability: { type: Type.NUMBER },
          eq_score: { type: Type.NUMBER },
          pace_score: { type: Type.NUMBER },
          technical_depth: { type: Type.NUMBER },
          strategic_alignment: { type: Type.NUMBER },
          confidence_analysis: { type: Type.STRING },
          professional_feedback: { type: Type.STRING },
          savage_feedback: { type: Type.STRING },
          improved_answer: { type: Type.STRING },
          key_takeaways: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
        },
        required: [
          "clarity", "confidence", "structure", "relevance", "authenticity", 
          "hire_probability", "eq_score", "pace_score", "technical_depth", "strategic_alignment",
          "confidence_analysis", "professional_feedback", "savage_feedback", "improved_answer", "key_takeaways"
        ]
      }
    }
  });

  return extractJSON(response.text || "{}") || {
    clarity: 70,
    confidence: 70,
    structure: 70,
    relevance: 70,
    authenticity: 70,
    hire_probability: 50,
    eq_score: 70,
    pace_score: 70,
    technical_depth: 70,
    strategic_alignment: 70,
    confidence_analysis: "The AI was unable to analyze your confidence.",
    professional_feedback: "The AI was unable to provide detailed feedback.",
    savage_feedback: "Your answer was so boring the AI crashed.",
    improved_answer: "Try to be more specific.",
    key_takeaways: ["Be specific", "Use metrics"]
  };
} catch (error) {
    await handleGeminiError(error, "analyzeAnswer");
    return {
      clarity: 70,
      confidence: 70,
      structure: 70,
      relevance: 70,
      authenticity: 70,
      hire_probability: 50,
      eq_score: 70,
      pace_score: 70,
      technical_depth: 70,
      strategic_alignment: 70,
      confidence_analysis: "The AI was unable to analyze your confidence.",
      professional_feedback: "The AI was unable to provide detailed feedback.",
      savage_feedback: "Your answer was so boring the AI crashed.",
      improved_answer: "Try to be more specific.",
      key_takeaways: ["Be specific", "Use metrics"]
    };
  }
}

export async function generateQuestion(
  difficulty: string,
  personaType: string,
  focus: string,
  dialogueStyle: string,
  resume: string = "",
  jd: string = "",
  customPersonaPrompt: string = ""
): Promise<string> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    You are the PersonaOS AI Interviewer of type "${personaType}" at a "${difficulty}" difficulty level.
    The interview focus is "${focus}".
    Your dialogue style is "${dialogueStyle}".
    ${customPersonaPrompt ? `ADDITIONAL PERSONALITY TRAITS: "${customPersonaPrompt}"` : ""}
    
    BEHAVIOR GUIDELINES:
    - Focus: ${focus === 'Technical' ? 'Deep dive into technical skills, architecture, and problem-solving.' : focus === 'Behavioral' ? 'Focus on soft skills, past experiences, and STAR method.' : 'Focus on business impact, long-term vision, and strategic thinking.'}
    - Style: ${dialogueStyle === 'Professional' ? 'Formal, objective, and standard corporate tone.' : dialogueStyle === 'Sarcastic' ? 'Witty, slightly mocking, and uses dry humor.' : dialogueStyle === 'Supportive' ? 'Encouraging, patient, and provides positive reinforcement.' : 'High pressure, rapid-fire, and extremely demanding.'}
    ${customPersonaPrompt ? `- Custom Personality: You must embody these traits when asking the question: ${customPersonaPrompt}` : ""}
    
    CONTEXT:
    User Resume: ${resume || "Not provided"}
    Job Description: ${jd || "Not provided"}
    
    Generate a single, challenging interview question tailored to the user's background and the job description.
    The question should strictly follow the "${focus}" focus and be delivered in a "${dialogueStyle}" style.
    `,
  });

  return response.text || "Tell me about yourself.";
} catch (error) {
    await handleGeminiError(error, "generateQuestion");
    return "Tell me about yourself.";
  }
}

export async function getCopilotSuggestion(
  transcript: string,
  question: string,
  focus: string,
  dialogueStyle: string,
  resume: string = "",
  jd: string = ""
): Promise<{ suggestion: string; warning: string | null }> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    You are the PersonaOS AI Interview Copilot. The user is currently in a live interview.
    The interview focus is "${focus}".
    The interviewer's dialogue style is "${dialogueStyle}".
    
    CONTEXT:
    User Resume: ${resume}
    Job Description: ${jd}
    Current Question: ${question}
    Current Transcript of User Speaking: "${transcript}"
    
    Provide a real-time suggestion for what the user should say next or how to improve their current point.
    Keep it short (max 2 sentences).
    Tailor the suggestion to the "${focus}" focus and the "${dialogueStyle}" style of the interviewer.
    If you detect a major issue (e.g., rambling, lack of confidence), provide a warning.
    
    Return JSON format:
    {
      "suggestion": "...",
      "warning": "..." (or null)
    }
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestion: { type: Type.STRING },
          warning: { type: Type.STRING, nullable: true },
        },
        required: ["suggestion", "warning"]
      }
    }
  });

  return extractJSON(response.text || "{}") || {
    suggestion: "Keep talking about your experience.",
    warning: null
  };
} catch (error) {
    await handleGeminiError(error, "getCopilotSuggestion");
    return {
      suggestion: "Keep talking about your experience.",
      warning: null
    };
  }
}

export async function conductInterviewStep(
  messages: ChatMessage[],
  role: string,
  experience: string,
  persona: string = 'Skeptic',
  resume: string = "",
  jd: string = ""
): Promise<string> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const personaPrompts: Record<string, string> = {
    'Skeptic': 'You are "The Skeptic". You are highly critical, look for inconsistencies, and need hard evidence for every claim. You are not easily impressed and will probe deeper into any vague statement. You react to over-confidence with more difficult questions and to hesitation with a demand for clarity.',
    'Visionary': 'You are "The Visionary". You focus on the big picture, future trends, and how the candidate can help the company innovate. You value creativity, long-term thinking, and passion. You react to lack of enthusiasm with a challenge to their ambition and to creative ideas with insightful follow-ups.',
    'Empathetic': 'You are "The Empathetic". You focus on cultural fit, emotional intelligence, and how the candidate handles interpersonal dynamics. You are supportive but observant of soft skills. You react to nervousness with reassurance and to arrogance with questions about teamwork and humility.',
    'DrillSergeant': 'You are "The Drill Sergeant". You are high-pressure, rapid-fire, and expect concise, direct answers. You value discipline, resilience, and the ability to perform under extreme stress. You react to long-winded answers with an interruption and to clear, concise answers with an immediate, even harder question.'
  };

  const response = await ai.models.generateContent({
    model,
    contents: `
    You are the PersonaOS expert AI Interviewer. You are conducting a real, professional interview for the role of "${role}" (${experience} level).
    
    YOUR PERSONA:
    ${personaPrompts[persona] || personaPrompts['Skeptic']}
    
    CONTEXT:
    User Resume: ${resume || "Not provided"}
    Job Description: ${jd || "Not provided"}
    
    INTERVIEW GUIDELINES:
    - Embody your PERSONA strictly in your tone, question choice, and follow-up style.
    - Ask ONE question at a time.
    - Wait for the user's answer before continuing.
    - Generate dynamic follow-up questions based on the user's previous answers.
    - Occasionally interrupt or probe deeper if an answer is vague.
    - Include HR, behavioral, role-specific, and situational questions.
    - Use nuanced emotional intelligence: sense the user's confidence or hesitation and react accordingly (e.g., if they seem nervous, "The Empathetic" might reassure them, while "The Drill Sergeant" might push harder).
    
    CONVERSATION HISTORY:
    ${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
    
    Based on the history, ask the next logical interview question or follow-up.
    If this is the start, begin with a professional greeting and the first question.
    `,
  });

  return response.text || "Could you tell me more about your experience?";
} catch (error) {
    await handleGeminiError(error, "conductInterviewStep");
    return "Could you tell me more about your experience?";
  }
}

export async function generateInterviewFeedback(
  messages: ChatMessage[],
  role: string,
  experience: string
): Promise<InterviewFeedback> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
    model,
    contents: `
    The interview for the role of "${role}" (${experience} level) has concluded.
    Analyze the following conversation and provide detailed feedback in JSON format.
    
    CONVERSATION:
    ${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
    
    Return JSON format:
    {
      "overall_score": 0-100,
      "communication": 0-100,
      "confidence": 0-100,
      "relevance": 0-100,
      "strengths": ["..."],
      "weaknesses": ["..."],
      "improved_answers": [
        {
          "question": "...",
          "answer": "...",
          "improved": "..."
        }
      ]
    }
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overall_score: { type: Type.NUMBER },
          communication: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          relevance: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          improved_answers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                improved: { type: Type.STRING },
              },
              required: ["question", "answer", "improved"]
            }
          }
        },
        required: ["overall_score", "communication", "confidence", "relevance", "strengths", "weaknesses", "improved_answers"]
      }
    }
  });

  return extractJSON(response.text || "{}") || {
    overall_score: 0,
    communication: 0,
    confidence: 0,
    relevance: 0,
    strengths: [],
    weaknesses: [],
    improved_answers: []
  };
} catch (error) {
    await handleGeminiError(error, "generateInterviewFeedback");
    return {
      overall_score: 0,
      communication: 0,
      confidence: 0,
      relevance: 0,
      strengths: [],
      weaknesses: [],
      improved_answers: []
    };
  }
}

export async function performEvolutionAnalysis(
  currentInput: string,
  history: any
): Promise<EvolutionAnalysis> {
  const model = "gemini-3-flash-preview";
  try {
    const ai = getAI(model);
    const response = await ai.models.generateContent({
      model,
      contents: `
      You are the PersonaOS advanced AI behavior analyst and personal evolution engine.
      
      Your role is NOT just to analyze input once, but to:
      - Detect patterns in user behavior
      - Track improvement over time
      - Identify repeated weaknesses
      - Provide evolving, personalized feedback
      
      INPUT CONTEXT:
      1. Current user input (answer, code, or text): "${currentInput}"
      2. Previous user history (past analyses, scores, feedback): ${JSON.stringify(history)}
      
      YOUR TASK:
      1. 🧠 CURRENT ANALYSIS: Analyze the latest input for strengths and weaknesses.
      2. 🔁 PATTERN DETECTION: Compare with past behavior. Identify repeated mistakes or improvements.
      3. 📈 PROGRESS TRACKING: Show improvement or decline. Mention previous vs current performance.
      4. 💣 TRUTH INSIGHT (HIGH IMPACT): Give a clear, honest insight about the user.
      5. 🛠 PERSONALIZED IMPROVEMENT PLAN: Give 2–3 actionable steps tailored to user pattern.
      6. 🎯 FOCUS AREA: Suggest ONE key area to improve next.
      
      RULES:
      - Be honest but not insulting.
      - Focus on patterns, not just single answers.
      - Avoid generic advice.
      - Make feedback feel personal and evolving.
      
      Return the analysis in a structured JSON format.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            current_analysis: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["strengths", "weaknesses"]
            },
            pattern_detection: { type: Type.ARRAY, items: { type: Type.STRING } },
            progress_tracking: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING },
                  previous: { type: Type.NUMBER },
                  current: { type: Type.NUMBER },
                  trend: { type: Type.STRING, enum: ["improving", "declining", "stable"] }
                },
                required: ["metric", "previous", "current", "trend"]
              }
            },
            truth_insight: { type: Type.STRING },
            improvement_plan: { type: Type.ARRAY, items: { type: Type.STRING } },
            focus_area: { type: Type.STRING }
          },
          required: ["current_analysis", "pattern_detection", "progress_tracking", "truth_insight", "improvement_plan", "focus_area"]
        }
      }
    });

    return extractJSON(response.text || "{}") || {
      current_analysis: { strengths: [], weaknesses: [] },
      pattern_detection: [],
      progress_tracking: [],
      truth_insight: "No insight available.",
      improvement_plan: [],
      focus_area: "General improvement"
    };
  } catch (error) {
    await handleGeminiError(error, "performEvolutionAnalysis");
    return {
      current_analysis: { strengths: [], weaknesses: [] },
      pattern_detection: [],
      progress_tracking: [],
      truth_insight: "No insight available.",
      improvement_plan: [],
      focus_area: "General improvement"
    };
  }
}

export const generateVideos = async (params: {
  model: string;
  prompt: string;
  config?: any;
  image?: any;
}) => {
  try {
    const ai = await getAI(params.model);
    return await ai.models.generateVideos({
      model: params.model,
      prompt: params.prompt,
      config: params.config,
      image: params.image
    });
  } catch (error) {
    await handleGeminiError(error, "generateVideos");
    throw error;
  }
};

export const getVideosOperation = async (params: {
  operation: any;
}) => {
  try {
    const ai = await getAI('veo-3.1-fast-generate-preview');
    return await ai.operations.getVideosOperation(params);
  } catch (error) {
    await handleGeminiError(error, "getVideosOperation");
    throw error;
  }
};

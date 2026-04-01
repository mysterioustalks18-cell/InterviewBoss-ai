import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeResume = async (resumeText: string, jobDescription: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an expert career coach and recruiter. Analyze this resume against the job description.
    Provide a detailed ATS score (0-100), keyword suggestions, bullet point improvements using the action-result format, a recruiter's perspective, and a one-click rewrite of the summary or key experience.
    Resume: ${resumeText}
    Job Description: ${jobDescription}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          atsScore: { type: Type.NUMBER },
          optimization: {
            type: Type.OBJECT,
            properties: {
              keywordSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              bulletImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
              recruiterView: { type: Type.STRING },
              oneClickRewrite: { type: Type.STRING }
            }
          }
        },
        required: ["atsScore", "optimization"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const analyzeSmartInterviewMatch = async (resumeText: string, jobDescription: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an elite recruiter. Match this resume against the job description.
    Extract key skills, experience, and projects from the resume.
    Extract core requirements from the job description.
    Provide a match score (0-100), a list of strengths, and a list of weak areas or gaps.
    Resume: ${resumeText}
    Job Description: ${jobDescription}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
          extractedSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["matchScore", "strengths", "weakAreas"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateSmartInterviewQuestion = async (
  resumeText: string, 
  jobDescription: string, 
  history: any[],
  matchData: any,
  mode?: string
) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an expert interviewer. Generate the next personalized interview question based on the candidate's resume and the job description.
    Use the match data to target strengths or gaps.
    ${mode ? `The interview mode is ${mode}. Focus the question on this aspect.` : 'The question should be one of these types: HR, Technical, Gap-based, Scenario-based, Stress, Behavioral, or Company Fit.'}
    
    CRITICAL: Analyze the previous conversation history. If the candidate's last answer was incomplete, vague, or showed a specific area of interest/weakness (check the 'evaluation' and 'followUpPotential' in the history), generate a direct follow-up question to dig deeper. 
    A follow-up should feel natural and conversational (e.g., "You mentioned X, could you elaborate on how you handled Y?").
    If the previous topic is exhausted, move to a new relevant area.
    
    Resume: ${resumeText}
    Job Description: ${jobDescription}
    Match Data: ${JSON.stringify(matchData)}
    History: ${JSON.stringify(history)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["HR", "Technical", "Gap-based", "Scenario-based", "Stress", "Behavioral", "Company Fit", "Follow-up"] },
          context: { type: Type.STRING, description: "Why this question is being asked based on resume/JD" }
        },
        required: ["question", "type", "context"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const evaluateSmartInterviewAnswer = async (
  question: string, 
  answer: string,
  resumeText: string,
  jobDescription: string
) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an expert interview evaluator. Evaluate the candidate's answer to the specific question, considering their resume and the job requirements.
    Provide scores (0-100) for confidence, clarity, and relevance.
    Provide constructive feedback and a significantly improved version of the answer.
    Question: ${question}
    Answer: ${answer}
    Resume: ${resumeText}
    Job Description: ${jobDescription}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metrics: {
            type: Type.OBJECT,
            properties: {
              confidence: { type: Type.NUMBER },
              clarity: { type: Type.NUMBER },
              relevance: { type: Type.NUMBER }
            }
          },
          feedback: { type: Type.STRING },
          improvedAnswer: { type: Type.STRING },
          followUpPotential: { type: Type.STRING, description: "A hint for a follow-up question if applicable" }
        },
        required: ["metrics", "feedback", "improvedAnswer"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateSmartInterviewFinalReport = async (
  history: any[],
  resumeText: string,
  jobDescription: string
) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are a senior hiring manager. Based on the full interview history, provide a final evaluation report.
    Include an overall performance score (0-100), a summary of strengths and weaknesses shown during the interview, and a clear hire recommendation (Strong Hire, Hire, Leaning Hire, No Hire).
    Interview History: ${JSON.stringify(history)}
    Resume: ${resumeText}
    Job Description: ${jobDescription}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING, enum: ["Strong Hire", "Hire", "Leaning Hire", "No Hire"] },
          summary: { type: Type.STRING }
        },
        required: ["overallScore", "strengths", "weaknesses", "recommendation", "summary"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateInterviewQuestion = async (role: string, mode: string, history: any[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an elite interviewer. Generate a challenging and relevant interview question for a ${role} position in ${mode} mode.
    Consider the previous conversation history to avoid repetition and build on previous topics.
    History: ${JSON.stringify(history)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          expectedPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["question", "expectedPoints"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const evaluateInterviewAnswer = async (question: string, answer: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an expert interview evaluator. Evaluate the following interview answer based on the question provided.
    Provide a score (0-100), metrics for confidence, clarity, and relevance, detailed constructive feedback, and a specific improvement using the STAR (Situation, Task, Action, Result) method.
    Question: ${question}
    Answer: ${answer}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          metrics: {
            type: Type.OBJECT,
            properties: {
              confidence: { type: Type.NUMBER },
              clarity: { type: Type.NUMBER },
              relevance: { type: Type.NUMBER }
            }
          },
          feedback: { type: Type.STRING },
          starMethodImprovement: { type: Type.STRING }
        },
        required: ["score", "metrics", "feedback", "starMethodImprovement"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const detectCodeErrors = async (code: string, language: string, beginnerMode: boolean) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are a senior software engineer and security auditor specializing in ${language}. 
    Analyze the following ${language} code for errors, security vulnerabilities, performance bottlenecks, and language-specific best practices.
    
    If Beginner Mode is ${beginnerMode}, provide simpler explanations and avoid overly technical jargon where possible.
    
    Provide a detailed analysis including:
    - Errors: Critical bugs or syntax issues.
    - Warnings: Potential issues or anti-patterns.
    - Improvements: Suggestions for better readability or maintainability.
    - Optimizations: Ways to improve time/space complexity.
    - Fixed Code: The full corrected and optimized code.
    - Explanation: A line-by-line or section-by-section breakdown of the changes.
    - Quality Score: An overall score from 0 to 100.
    - Time Complexity: Big O notation for the main logic.
    - Bug Risk: High, Medium, or Low assessment.
    - Refactor Suggestions: Specific architectural improvements.
    
    Code:
    ${code}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          errors: { type: Type.ARRAY, items: { type: Type.STRING } },
          warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          optimizations: { type: Type.ARRAY, items: { type: Type.STRING } },
          fixedCode: { type: Type.STRING },
          explanation: { type: Type.STRING },
          qualityScore: { type: Type.NUMBER },
          timeComplexity: { type: Type.STRING },
          bugRisk: { type: Type.STRING },
          refactorSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["errors", "warnings", "improvements", "fixedCode", "explanation", "qualityScore", "refactorSuggestions"]
      }
    }
  });
  return JSON.parse(response.text);
};

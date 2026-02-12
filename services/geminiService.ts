import { GoogleGenAI, Type } from "@google/genai";
import { ContentItem, ChatMessage } from "../types";
import { CHAT_PERSONA } from "../constants";

// Initialize Gemini Client strictly using environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

export const getCounselorResponse = async (
  message: string, 
  history: ChatMessage[], 
  language: 'EN' | 'BN'
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    // Convert our internal chat history to the format Gemini expects
    const geminiHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...geminiHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: CHAT_PERSONA(language),
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "I am here to support you. Please tell me more.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return language === 'BN' 
      ? "à¦¦à§à¦à¦à¦¿à¦¤, à¦à¦®à¦¿ à¦à¦ à¦®à§à¦¹à§à¦°à§à¦¤à§ à¦à¦¤à§à¦¤à¦° à¦¦à¦¿à¦¤à§ à¦ªà¦¾à¦°à¦à¦¿ à¦¨à¦¾à¥¤ à¦à¦¨à§à¦à§à¦°à¦¹ à¦à¦°à§ à¦ªà¦°à§ à¦à§à¦·à§à¦à¦¾ à¦à¦°à§à¦¨à¥¤" 
      : "I'm sorry, I cannot respond at the moment. Please try again later.";
  }
};

export const fetchAndRefillBuffer = async (count: number, language: 'EN' | 'BN'): Promise<Omit<ContentItem, 'id' | 'isShown' | 'createdAt'>[]> => {
  try {
    const model = 'gemini-3-flash-preview';
    const langLabel = language === 'BN' ? 'Bengali' : 'English';
    
    const prompt = `Generate ${count} unique Islamic motivational quotes/Hadiths in ${langLabel} with references. Return strictly as a JSON list. 
    Ensure a mix of: 
    - Motivation for Salah (Prayer)
    - Hope in Tawbah (Repentance)
    - Warning about sins
    Include accurate sources like "Sahih Bukhari", "Sahih Muslim", or "Surah [Name] [Verse]".`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: 'The main quote or hadith text.',
              },
              source: {
                type: Type.STRING,
                description: 'The reference source.',
              },
              category: {
                type: Type.STRING,
                enum: ['Motivation', 'Warning', 'Hope'],
                description: 'Category for classification.',
              }
            },
            required: ['text', 'source', 'category'],
          },
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.map((item: any) => ({
        ...item,
        language: language
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Gemini Refill Failed:", error);
    return [];
  }
};

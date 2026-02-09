import { GoogleGenAI, Type } from "@google/genai";
import { ContentItem } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchAndRefillBuffer = async (count: number, language: 'EN' | 'BN'): Promise<Omit<ContentItem, 'id' | 'isShown' | 'createdAt'>[]> => {
  try {
    const model = 'gemini-3-flash-preview';
    const langLabel = language === 'BN' ? 'Bengali' : 'English';
    
    // Constructing the prompt as per System Architecture requirements
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
        language: language // Tag with current language code
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Gemini Refill Failed:", error);
    return [];
  }
};
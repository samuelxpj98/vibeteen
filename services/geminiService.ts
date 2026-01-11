import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyMission = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Dê uma missão cristã curta, prática e criativa de exatamente 4 palavras para jovens adolescentes. Exemplo: 'Abrace seu irmão hoje'. Sem explicações, apenas a frase.",
    });
    return response.text || "Espalhe a luz hoje";
  } catch (error) {
    console.error("Error fetching mission:", error);
    return "Ame o seu próximo"; // Fallback mission
  }
};

import { GoogleGenAI } from "@google/genai";

export const getDailyMission = async (): Promise<string> => {
  try {
    if (!process.env.API_KEY) return "Ame o seu próximo";
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Dê uma missão cristã curta, prática e criativa de exatamente 4 palavras para jovens adolescentes. Exemplo: 'Abrace seu irmão hoje'. Sem explicações.",
    });
    return response.text || "Espalhe a luz hoje";
  } catch (error) {
    return "Ame o seu próximo";
  }
};

export const getVibeWord = async (userName: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) return "Você é luz!";
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase de encorajamento cristã curta e 'cool' (estilo teen) para o jovem ${userName}. Use gírias saudáveis e foco em propósito. Máximo 15 palavras.`,
    });
    return response.text || "Continue brilhando!";
  } catch (error) {
    return "Deus tem um plano incrível para você hoje!";
  }
};


import { GoogleGenAI } from "@google/genai";

// Guideline: Always use a named parameter for the API Key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSatiricalNews = async (characterName: string, event: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a funny, 1-sentence satirical news headline in Bengali about the election symbol '${characterName}' involved in a scandal regarding '${event}'. 
      Context: Bangladesh Election Parody. Tone: Gen-Z, ironic, sharp. Use words like 'Osthir', 'Lul', 'Khela Hobe', 'Kopa'.`,
      config: {
        temperature: 0.9,
      }
    });
    // Guideline: Use .text property, not .text()
    return response.text || "ব্রেকিং নিউজ: এখনো কোনো খবর নেই!";
  } catch (error) {
    console.error("Satirical News Error:", error);
    return "হলুদ সাংঘাতিক ২৪: দুর্নীতি চলছে, আমাদের নিউজও চলছে!";
  }
};

export const generateCharacterDialogue = async (actorId: string, action: string) => {
  const actorMap: Record<string, string> = {
    'apa': 'Advocate Nirbachon Apa (Lies about her son injured in July)',
    'akik': 'Akik (Drone expert, rival of Apa)',
    'reporter': 'Holud Sanghatik 24 (Corrupt yellow journalist)',
    'rajib': 'Rajib Sir PUB (The mediator)',
    'candidate': 'A desperate political candidate symbol'
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a funny dialogue in Bengali for ${actorMap[actorId]} regarding the action '${action}'. 
      Context: Satirical Bangladesh Election. Keep it very short (max 15 words). Include mentions of 'July card' or 'Drone' or 'Deal' where applicable.`,
      config: {
        temperature: 1.0,
      }
    });
    // Guideline: Use .text property, not .text()
    return response.text || "খেলা তো হবেই!";
  } catch (error) {
    console.error("Dialogue Error:", error);
    return "এসব ষড়যন্ত্র! আমার ছেলে জুলাইতে আহত হয়েছে!";
  }
};

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function correctWord(input: string): Promise<string> {
  if (!input || input.length < 2) return "";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: `You are an expert ASL (American Sign Language) translation assistant. 
        The user is signing letters one by one. Due to sensor noise, the input may contain:
        1. Repeated letters (e.g., "HHHELLOO" for "HELLO")
        2. Random stray letters (e.g., "HXEALOL" for "HELLO")
        3. Phonetically similar mistakes.
        
        Input: A string of letters.
        Task: Identify the most likely English word the user is trying to spell.
        Constraint: If the input looks like gibberish and you cannot find a clear match, return the original input.
        Output: ONLY the corrected word in uppercase. No explanation.`,
      },
      contents: `User signed: "${input}"`,
    });

    const text = response.text || "";
    return text.trim().toUpperCase().split(/\s+/)[0].replace(/[^A-Z]/g, '');
  } catch (error) {
    console.error("AI Correction Error:", error);
    return input;
  }
}

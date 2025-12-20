import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `
Sei un esperto ingegnere strutturale e assistente tecnico per un'azienda che produce pannelli sandwich curvi in EPS (Polistirene Espanso Sinterizzato).
Il tuo compito è assistere gli utenti (progettisti, architetti, costruttori) nel comprendere le tabelle di portata.

Contesto Dati (Tabelle di Portata - Carico ammissibile in kg/mq uniformemente distribuito):
I dati includono:
- Spessori pannello: 40, 50, 60, 80, 100 mm
- Supporti esterni (Acciaio): 0.5, 0.6, 0.8 mm
- Supporto interno (Acciaio): 0.5 mm
- Luce (distanza appoggi): da 2.00m a 6.00m
- Portata: kg/mq

Rispondi sempre in italiano tecnico ma comprensibile.
Se l'utente chiede un consiglio su quale pannello usare, chiedi sempre la luce libera e il carico neve/vento previsto se non specificato.
Usa i dati forniti per giustificare le tue risposte.
Sii conciso e professionale.
Non inventare dati se non sono presenti nella tabella.
`;

export const streamTechnicalAnswer = async (userMessage: string, currentContext?: string) => {
  try {
    // Initialize AI client using direct process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use the recommended model for Basic Text Tasks
    const model = 'gemini-3-flash-preview';
    
    // Construct the context string
    let fullPrompt = userMessage;
    if (currentContext) {
      fullPrompt = `Contesto attuale visualizzato dall'utente: ${currentContext}\n\nDomanda utente: ${userMessage}`;
    }

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });

    const result = await chat.sendMessageStream({ message: fullPrompt });
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

  try {

    const { base64, mimeType } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64
            }
          },
          {
            text: "Extract medicine details. Return JSON {medicines:[{name,dosage,frequency,schedule:[],instruction}]}"
          }
        ]
      }
    });

    res.status(200).json(response);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

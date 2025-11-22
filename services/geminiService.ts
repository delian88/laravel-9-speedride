import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateSupportResponse = async (
  prompt: string,
  context: string
): Promise<string> => {
  const client = getClient();
  if (!client) return "I'm sorry, I can't connect to the AI service right now. (Missing API Key)";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `System Context: You are a helpful AI support assistant for GoCab, a ride-sharing app. 
      Current App Context: ${context}
      
      User Query: ${prompt}
      
      Provide a concise, helpful response. If analyzing data, keep it brief.`,
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble thinking right now.";
  }
};

export const analyzeRideData = async (rideDataJSON: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Analytics service unavailable.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this ride data and provide 3 key insights for the admin dashboard. 
      Data: ${rideDataJSON}`,
    });
    return response.text || "No insights available.";
  } catch (error) {
    return "Failed to analyze data.";
  }
};

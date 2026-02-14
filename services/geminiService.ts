
import { GoogleGenAI } from "@google/genai";

/**
 * Generates logistics insights using Gemini.
 * We summarize the data first to prevent large payload errors (500) 
 * and create the AI instance inside the call to ensure the latest API key is used.
 */
export const getLogisticsInsights = async (data: any) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "API key not configured. Please check your settings.";
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Prepare a lightweight summary to avoid "Rpc failed due to xhr error" (often payload size related)
    const summary = {
      totalTrips: data.trucks?.length || 0,
      hiredTrips: data.trucks?.filter((t: any) => t.isHired).length || 0,
      pendingBookings: data.orders?.filter((o: any) => o.status === 'PENDING').length || 0,
      completedToday: data.trucks?.filter((t: any) => t.status === 'COMPLETED').length || 0,
      routes: data.trucks?.reduce((acc: any, t: any) => {
        acc[t.routeType] = (acc[t.routeType] || 0) + 1;
        return acc;
      }, {})
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a logistics strategist for VORA TRANSPORT CO. 
      Based on this operational summary, provide exactly 3 bullet points of sharp, professional advice for the corridor dispatcher.
      Summary: ${JSON.stringify(summary)}`,
    });

    return response.text || "Operations are within normal parameters. Continue monitoring loads.";
  } catch (error) {
    console.error("AI Insight Error:", error);
    // Graceful fallback so the dashboard doesn't break
    return "Insights currently unavailable. Prioritize Mumbai-Kolhapur high-priority loads.";
  }
};

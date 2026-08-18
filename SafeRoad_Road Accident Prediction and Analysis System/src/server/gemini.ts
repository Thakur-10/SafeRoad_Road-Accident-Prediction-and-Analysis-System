import { GoogleGenAI } from '@google/genai';
import { PredictionInput, PredictionResult } from '../types';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'saferoad-build'
        }
      }
    });
  }
  return aiClient;
}

export async function generateAiInsight(prediction: PredictionResult): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    return `AI Risk Analysis Summary: The ML ensemble engine evaluated this journey as ${prediction.severity} severity (${prediction.riskLevel} Risk, ${prediction.riskScore}/100 score). Primary danger vectors include ${prediction.keyFactors.map((f) => f.name).join(', ')}. Follow safety advisory protocols.`;
  }

  try {
    const prompt = `You are the SafeRoad Safety Copilot, an elite automotive safety and accident prevention specialist.
Analyze the following road accident severity prediction data and generate a clear, professional 2-3 paragraph safety advisor summary for the driver:

Prediction Result:
- Accident Severity: ${prediction.severity} (${prediction.riskLevel} Risk)
- Risk Score: ${prediction.riskScore} / 100
- Model Confidence: ${prediction.confidenceScore}%

Driver & Trip Parameters:
- Vehicle: ${prediction.input.vehicleType}
- Driver Age: ${prediction.input.age} years old
- Speed Limit: ${prediction.input.speedLimit} km/h
- Road Geometry: ${prediction.input.roadType}
- Traffic Density: ${prediction.input.trafficDensity}
- Weather Condition: ${prediction.input.weatherCondition} (Visibility: ${prediction.input.visibilityKm} km, Raining: ${prediction.input.isRaining})
- Time / Lighting: ${prediction.input.timeOfDay} (Night: ${prediction.input.isNight})
- Location: ${prediction.input.location.city}, ${prediction.input.location.region} (${prediction.input.location.latitude.toFixed(4)}, ${prediction.input.location.longitude.toFixed(4)})

Key Risk Factors Identified:
${prediction.keyFactors.map((f) => `- ${f.name} (${f.impact} Impact): ${f.description}`).join('\n')}

Task:
Provide a concise, direct, authoritative 2-paragraph safety copilot warning and actionable defensive driving advice tailored specifically to this vehicle type, weather condition, speed, and road layout. Keep the tone calm, urgent where necessary, and highly professional.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt
    });

    return response.text?.trim() || `AI Risk Analysis: The vehicle is operating under ${prediction.riskLevel} Risk conditions. Drive with heightened defensive alertness and monitor trailing distance.`;
  } catch (error) {
    console.error('Gemini API Error in generateAiInsight:', error);
    return `AI Risk Analysis: Journey classified as ${prediction.severity} (${prediction.riskLevel} Risk). Reduce speed, maintain 4-second braking gap, and inspect vehicle safety lights.`;
  }
}

import { GoogleGenAI } from "@google/genai";
import { Coordinates, ChargingStationResponse, GroundingChunk, Station } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findChargingStations = async (coords: Coordinates): Promise<ChargingStationResponse> => {
  try {
    const prompt = `
      Find 10 electric vehicle charging stations near latitude ${coords.latitude}, longitude ${coords.longitude}. 
      
      Return the response STRICTLY as a JSON array of objects. Do not use Markdown code blocks. 
      
      Each object must have the following fields. If exact data is missing, make a reasonable estimate based on the station type (e.g., Superchargers have CCS/NACS, fast charging, high power):
      - id: string (unique)
      - name: string
      - latitude: number
      - longitude: number
      - address: string
      - isFastCharging: boolean
      - rating: number (1-5, e.g. 4.5)
      - reviews: number (e.g. 120)
      - isOpen: boolean
      - provider: string (e.g. "Tesla", "ChargePoint", "Electrify America")
      - amenities: string[] (e.g. ["Wifi", "Coffee", "Restrooms", "Shopping"])
      - connectors: array of objects { type: string, power: string, available: number, total: number, price: string }
         -> Example: [{ "type": "CCS", "power": "150kW", "available": 2, "total": 4, "price": "$0.45/kWh" }]

      Ensure the coordinates are as accurate as possible for the map.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: coords.latitude,
              longitude: coords.longitude
            }
          }
        }
      }
    });

    // Extract Grounding Chunks (Sources)
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const chunks: GroundingChunk[] = rawChunks.map((c: any) => {
      if (c.maps) {
        return {
          maps: {
            uri: c.maps.uri || "",
            title: c.maps.title || "Unknown Station",
            placeAnswerSources: c.maps.placeAnswerSources
          }
        } as GroundingChunk;
      }
      return c as GroundingChunk;
    }).filter((c) => c.maps && c.maps.title);

    // Parse structured station data from text
    let stations: Station[] = [];
    const text = response.text || "";
    
    try {
      // Clean up markdown if present (e.g. ```json ... ```)
      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      stations = JSON.parse(jsonString);
    } catch (e) {
      console.warn("Failed to parse station JSON", e);
    }

    return { stations, chunks, summaryText: "Found " + stations.length + " stations nearby." };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
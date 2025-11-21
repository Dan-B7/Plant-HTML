import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SimulationState, ProductionStats } from '../types';
import { MessageSquare, Loader2, Sparkles } from 'lucide-react';

interface BotanistAiProps {
  state: SimulationState;
  stats: ProductionStats;
}

export const BotanistAi: React.FC<BotanistAiProps> = ({ state, stats }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const askBotanist = async () => {
    if (!process.env.API_KEY) {
      setResponse("API Key is missing. Cannot consult the botanist.");
      return;
    }

    setLoading(true);
    setResponse(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        You are an expert botanist teaching a student about photosynthesis.
        The current simulation conditions are:
        - Light Intensity: ${state.lightIntensity}%
        - CO2 Level: ${state.co2Level}%
        - Water Availability: ${state.waterLevel}%
        - Temperature: ${state.temperature}°C
        
        The current limiting factor is: ${stats.limitingFactor}.
        The glucose production rate is: ${stats.glucoseRate.toFixed(2)} (arbitrary units).

        Explain simply why the rate is what it is, what the limiting factor implies, and suggest one change to improve efficiency. Keep it under 3 sentences.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setResponse(result.text || "The botanist is thinking...");
    } catch (error) {
      console.error(error);
      setResponse("The botanist is currently unavailable. (Error connecting to AI)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 bg-indigo-50 rounded-xl border border-indigo-100 p-4 relative overflow-hidden">
       <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <Sparkles className="w-24 h-24 text-indigo-600" />
       </div>
      
       <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
               <div className="p-2 bg-indigo-100 rounded-full">
                   <MessageSquare className="w-5 h-5 text-indigo-600" />
               </div>
               <h3 className="font-semibold text-indigo-900">Dr. Green (AI Tutor)</h3>
           </div>
           <button 
             onClick={askBotanist}
             disabled={loading}
             className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
           >
             {loading && <Loader2 className="w-3 h-3 animate-spin" />}
             {loading ? 'Analyzing...' : 'Analyze Current State'}
           </button>
       </div>

       <div className="min-h-[60px] bg-white rounded-lg p-3 text-sm text-slate-700 leading-relaxed shadow-sm border border-indigo-100">
           {response ? (
               <p>{response}</p>
           ) : (
               <p className="text-slate-400 italic">Adjust the sliders and click "Analyze" to get an AI explanation of the current photosynthesis efficiency.</p>
           )}
       </div>
    </div>
  );
};
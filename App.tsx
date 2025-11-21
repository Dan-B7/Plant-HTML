import React, { useState, useEffect, useRef } from 'react';
import { Sun, Wind, Droplets, Thermometer, Play, Pause, RefreshCw, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ControlKnob } from './components/ControlKnob';
import { LeafVisual } from './components/LeafVisual';
import { BotanistAi } from './components/BotanistAi';
import { calculatePhotosynthesis } from './utils/simulationLogic';
import { SimulationState, HistoryPoint, SimulationStatus } from './types';

const App: React.FC = () => {
  // --- State ---
  const [simState, setSimState] = useState<SimulationState>({
    lightIntensity: 50,
    co2Level: 50,
    waterLevel: 50,
    temperature: 25,
  });

  const [status, setStatus] = useState<SimulationStatus>(SimulationStatus.RUNNING);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [time, setTime] = useState(0);
  const [totalGlucose, setTotalGlucose] = useState(0);

  // Calculate derived stats instantly for UI
  const currentStats = calculatePhotosynthesis(simState);

  // --- Refs ---
  const historyRef = useRef<HistoryPoint[]>([]);

  // --- Effects ---
  useEffect(() => {
    let intervalId: number;

    if (status === SimulationStatus.RUNNING) {
      intervalId = window.setInterval(() => {
        setTime(prev => prev + 1);
        
        // Accumulate totals
        const stats = calculatePhotosynthesis(simState);
        setTotalGlucose(prev => prev + (stats.glucoseRate / 10)); // Divide by tick rate factor

        // Update History
        const newPoint: HistoryPoint = {
          timestamp: time, // Use current accumulated time
          glucose: parseFloat(stats.glucoseRate.toFixed(2)),
          oxygen: parseFloat(stats.oxygenRate.toFixed(2)),
        };

        // Keep history manageable (last 30 ticks)
        setHistory(prev => {
          const newHist = [...prev, newPoint];
          return newHist.length > 50 ? newHist.slice(newHist.length - 50) : newHist;
        });
        
      }, 1000); // 1 second tick for chart readability
    }

    return () => clearInterval(intervalId);
  }, [status, simState, time]); // Depend on 'time' to ensure timestamp increments correctly in the closure if not using ref for time, but here setTime(prev) works.

  // --- Handlers ---
  const handleReset = () => {
    setSimState({
      lightIntensity: 50,
      co2Level: 50,
      waterLevel: 50,
      temperature: 25,
    });
    setHistory([]);
    setTime(0);
    setTotalGlucose(0);
    setStatus(SimulationStatus.RUNNING);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
              <LeafIcon />
            </div>
            PhotoSynth Live
          </h1>
          <p className="text-slate-500 mt-1">Interactive Biochemical Simulation</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <button
            onClick={() => setStatus(status === SimulationStatus.RUNNING ? SimulationStatus.PAUSED : SimulationStatus.RUNNING)}
            className={`p-2 rounded-md transition-all ${status === SimulationStatus.RUNNING ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
          >
            {status === SimulationStatus.RUNNING ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={handleReset} className="p-2 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
            <RefreshCw size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
           <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Total Glucose</span>
            <span className="font-mono font-bold text-green-600 text-lg">{Math.floor(totalGlucose)}g</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visuals & Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Simulation Visual */}
          <section className="bg-white rounded-3xl shadow-lg border border-slate-200 p-1 h-[400px] md:h-[500px] relative overflow-hidden">
             <LeafVisual state={simState} stats={currentStats} />
          </section>

          {/* Controls */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
             <ControlKnob 
               label="Sunlight" 
               value={simState.lightIntensity} 
               min={0} max={100} unit="%" 
               onChange={(v) => setSimState(s => ({...s, lightIntensity: v}))}
               colorClass="text-yellow-500"
               icon={<Sun className="w-5 h-5 text-yellow-500" />}
             />
             <ControlKnob 
               label="CO₂ Level" 
               value={simState.co2Level} 
               min={0} max={100} unit="%" 
               onChange={(v) => setSimState(s => ({...s, co2Level: v}))}
               colorClass="text-slate-500"
               icon={<Wind className="w-5 h-5 text-slate-500" />}
             />
             <ControlKnob 
               label="Water" 
               value={simState.waterLevel} 
               min={0} max={100} unit="%" 
               onChange={(v) => setSimState(s => ({...s, waterLevel: v}))}
               colorClass="text-blue-500"
               icon={<Droplets className="w-5 h-5 text-blue-500" />}
             />
             <ControlKnob 
               label="Temp" 
               value={simState.temperature} 
               min={0} max={50} unit="°C" 
               onChange={(v) => setSimState(s => ({...s, temperature: v}))}
               colorClass="text-red-500"
               icon={<Thermometer className="w-5 h-5 text-red-500" />}
             />
          </section>
        </div>

        {/* Right Column: Stats & AI (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Stats Dashboard */}
          <section className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-700">Production Rates</h2>
              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Live Data</div>
            </div>
            
            <div className="h-48 w-full mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOxygen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                  <XAxis hide />
                  <YAxis hide domain={[0, 6]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="glucose" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorGlucose)" 
                    name="Glucose"
                    isAnimationActive={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="oxygen" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorOxygen)" 
                    name="Oxygen"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
               <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                 <p className="text-xs text-green-600 font-semibold uppercase mb-1">Efficiency</p>
                 <p className="text-2xl font-bold text-green-800">{(currentStats.glucoseRate * 20).toFixed(0)}%</p>
               </div>
               <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                 <p className="text-xs text-red-600 font-semibold uppercase mb-1">Limiting Factor</p>
                 <p className="text-lg font-bold text-red-800 truncate">{currentStats.limitingFactor}</p>
               </div>
            </div>
          </section>

          {/* AI Tutor */}
          <section className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 flex-grow">
             <h2 className="font-bold text-slate-700 mb-2">Simulation Analysis</h2>
             <p className="text-sm text-slate-500 mb-4">
               Consult Dr. Green to understand how environmental factors are currently impacting the Calvin Cycle.
             </p>
             <BotanistAi state={simState} stats={currentStats} />

             <div className="mt-6 p-4 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-2 border border-slate-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-slate-400" />
                  <p>
                    <strong>Did you know?</strong> At high temperatures (above 40°C), enzymes like Rubisco denature, causing photosynthesis to plummet regardless of light or water.
                  </p>
                </div>
             </div>
          </section>

        </div>
      </main>
    </div>
  );
};

const LeafIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 19.7 9 20 14a7 7 0 0 1-9 6z"></path>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
  </svg>
)

export default App;
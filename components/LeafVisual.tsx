import React from 'react';
import { SimulationState, ProductionStats } from '../types';

interface LeafVisualProps {
  state: SimulationState;
  stats: ProductionStats;
}

export const LeafVisual: React.FC<LeafVisualProps> = ({ state, stats }) => {
  // Calculate animation durations (in ms). Higher rate = Lower duration (Faster)
  // Base duration ~5000ms for low activity, decreasing as rate increases
  const getDuration = (rate: number, minDuration = 800) => {
    if (rate <= 0) return 0;
    // Rate 0-100 scale (approx)
    return Math.max(minDuration, 6000 - (rate * 50)); 
  };

  const h2oDuration = getDuration(state.waterLevel, 1000);
  const co2Duration = getDuration(state.co2Level, 1000);
  // stats rates are small numbers (0-5ish), need to scale up for duration calc
  const o2Duration = getDuration(stats.oxygenRate * 20, 1000); 
  const glucoseDuration = getDuration(stats.glucoseRate * 20, 1000);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-b from-sky-200 to-sky-50 rounded-2xl overflow-hidden border border-sky-300 shadow-inner font-sans select-none">
      <style>{`
        @keyframes flowUp {
          0% { transform: translateY(80px) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-150px) scale(1); opacity: 0; }
        }
        @keyframes flowInLeft {
          0% { transform: translate(-100px, 40px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translate(-10px, 0px); opacity: 0; }
        }
        @keyframes flowOutRight {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(100px, -60px) scale(1.2); opacity: 0; }
        }
        @keyframes flowDown {
           0% { transform: translateY(0) scale(0.5); opacity: 0; }
           20% { opacity: 1; }
           100% { transform: translateY(180px) scale(1); opacity: 0; }
        }
        .arrow-path {
          filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.2));
        }
      `}</style>

      {/* Main Scene SVG */}
      <svg viewBox="0 0 400 500" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
        
        <defs>
          <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
          </linearGradient>
           <linearGradient id="stemGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="40%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>
        
        {/* Sun (Top Left) */}
        <g transform="translate(60, 60)">
           <circle r="40" fill="#FDB813" className="animate-pulse" style={{ opacity: 0.8 + (state.lightIntensity/500) }}>
              <animate attributeName="r" values="40;42;40" dur="3s" repeatCount="indefinite" />
           </circle>
           {/* Sun Rays */}
            <g className="animate-spin-slow" style={{ transformOrigin: 'center', animationDuration: '20s' }}>
               {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                   <line key={deg} x1="0" y1="-50" x2="0" y2="-70" stroke="#FDB813" strokeWidth="4" strokeLinecap="round" transform={`rotate(${deg})`} style={{ opacity: state.lightIntensity/100 }} />
               ))}
            </g>
        </g>

        {/* Sunlight Beams Overlay */}
        {state.lightIntensity > 20 && (
             <path d="M60,60 L160,250 L240,250 Z" fill="url(#sunGradient)" fillOpacity={state.lightIntensity / 200} style={{pointerEvents: 'none'}} />
        )}

        {/* Soil / Mud (Bottom) */}
        <rect x="0" y="420" width="400" height="80" fill="#5D4037" />
        <path d="M0,420 Q50,410 100,420 T200,415 T300,425 T400,420 V500 H0 Z" fill="#795548" />
        
        {/* Roots */}
        <g transform="translate(200, 420)" stroke="#8D6E63" strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M0,0 Q-10,20 -40,60" />
          <path d="M-20,30 Q-40,40 -30,70" strokeWidth="4" />
          <path d="M0,0 Q20,20 50,60" />
          <path d="M30,30 Q60,40 60,70" strokeWidth="4" />
          <path d="M0,0 V50" strokeWidth="8" />
        </g>

        {/* Stem */}
        <path d="M200,420 Q205,350 200,280" stroke="url(#stemGradient)" strokeWidth="16" fill="none" />

        {/* Water (H2O) Arrows - Inside Stem */}
        {state.waterLevel > 0 && (
           <g transform="translate(200, 400)">
             {[0, 1, 2, 3].map(i => (
               <g key={i} style={{ animation: `flowUp ${h2oDuration}ms infinite linear`, animationDelay: `${i * (h2oDuration/3.5)}ms` }}>
                  <path d="M0,0 L-4,8 H4 Z" fill="#60A5FA" transform="translate(0, 0) rotate(180)" className="arrow-path" />
                  <text x="8" y="5" fontSize="10" fill="#1E40AF" fontWeight="bold" opacity="0.8">H₂O</text>
               </g>
             ))}
           </g>
        )}

        {/* Glucose Arrows (Phloem Transport Down) */}
        {stats.glucoseRate > 0.1 && (
           <g transform="translate(190, 270)">
              {[0, 1].map(i => (
                <g key={i} style={{ animation: `flowDown ${glucoseDuration}ms infinite linear`, animationDelay: `${i * (glucoseDuration/2)}ms` }}>
                   <circle r="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1" className="arrow-path" />
                   <text x="-15" y="4" fontSize="10" fill="#92400E" fontWeight="bold">Sugar</text>
                </g>
              ))}
           </g>
        )}

        {/* Leaf Structure */}
        <g transform="translate(200, 260)">
            {/* Petiole */}
            <path d="M0,20 Q0,10 0,0" stroke="#166534" strokeWidth="8" />
            
            {/* Leaf Blade */}
            <path d="M0,0 C-90,-60 -110,-180 0,-230 C110,-180 90,-60 0,0" fill="#22c55e" stroke="#15803d" strokeWidth="2" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.1))" />
            
            {/* Midrib */}
            <path d="M0,0 Q5,-100 0,-220" stroke="#14532d" strokeWidth="3" fill="none" />
            
            {/* Veins */}
            <path d="M0,-50 L-40,-90 M0,-100 L-50,-140 M0,-150 L-40,-180" stroke="#4ade80" strokeWidth="2" opacity="0.5" />
            <path d="M0,-50 L40,-90 M0,-100 L50,-140 M0,-150 L40,-180" stroke="#4ade80" strokeWidth="2" opacity="0.5" />

            {/* CO2 In (Left side) */}
            {state.co2Level > 0 && (
               <g transform="translate(-50, -100)">
                 {[0, 1].map(i => (
                    <g key={i} style={{ animation: `flowInLeft ${co2Duration}ms infinite linear`, animationDelay: `${i * (co2Duration/2)}ms` }}>
                        <path d="M0,0 L10,5 L0,10 V7 H-15 V3 H0 Z" fill="#64748b" stroke="white" strokeWidth="1" className="arrow-path" />
                        <text x="-40" y="5" fontSize="12" fill="#334155" fontWeight="bold">CO₂</text>
                    </g>
                 ))}
               </g>
            )}

            {/* O2 Out (Right side) */}
            {stats.oxygenRate > 0.1 && (
               <g transform="translate(50, -100)">
                 {[0, 1].map(i => (
                    <g key={i} style={{ animation: `flowOutRight ${o2Duration}ms infinite linear`, animationDelay: `${i * (o2Duration/2)}ms` }}>
                        <path d="M0,3 H15 V7 L25,5 L15,0 V3 H0 Z" fill="#E0F2FE" stroke="#0284c7" strokeWidth="1" className="arrow-path" />
                        <text x="10" y="-5" fontSize="12" fill="#0369A1" fontWeight="bold">O₂</text>
                    </g>
                 ))}
               </g>
            )}
        </g>

      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur p-2 rounded-lg border border-stone-200 text-[10px] text-stone-600 shadow-sm">
        <div className="font-bold mb-1 text-stone-800 uppercase tracking-wider">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center bg-blue-100 rounded border border-blue-200 text-blue-600 font-bold text-xs">↑</div> 
              <span>Water (Xylem)</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center bg-slate-100 rounded border border-slate-300 text-slate-600 font-bold text-xs">→</div> 
              <span>CO₂ (Input)</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center bg-sky-50 rounded border border-sky-300 text-sky-600 font-bold text-xs">↗</div> 
              <span>O₂ (Output)</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center bg-amber-100 rounded border border-amber-300 text-amber-600 font-bold text-xs">↓</div> 
              <span>Sugar (Phloem)</span>
          </div>
        </div>
      </div>
      
      {/* Cell Stats Overlay */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-sm border border-green-100 max-w-[150px]">
         <h4 className="text-xs font-bold text-green-800 uppercase mb-1">Micro Level</h4>
         <div className="text-xs text-slate-600 space-y-1">
            <div className="flex justify-between items-center">
                <span>ATP</span>
                <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: `${stats.atpLevel}%`}}></div>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span>NADPH</span>
                <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400" style={{ width: `${stats.nadphLevel}%`}}></div>
                </div>
            </div>
            <div className="pt-1 border-t border-slate-100 mt-1 text-[10px]">
               Limiting Factor: <span className="font-bold text-red-500">{stats.limitingFactor}</span>
            </div>
         </div>
      </div>

    </div>
  );
};

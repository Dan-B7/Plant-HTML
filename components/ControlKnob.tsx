import React from 'react';

interface ControlKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (val: number) => void;
  colorClass: string;
  icon: React.ReactNode;
}

export const ControlKnob: React.FC<ControlKnobProps> = ({
  label,
  value,
  min,
  max,
  unit,
  onChange,
  colorClass,
  icon,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-green-100 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          {icon}
          <span>{label}</span>
        </div>
        <span className={`text-sm font-mono font-bold ${colorClass}`}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-${colorClass.split('-')[1]}-500`}
      />
      <div className="flex justify-between text-xs text-slate-400 px-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
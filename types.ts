export interface SimulationState {
  lightIntensity: number; // 0-100
  co2Level: number; // 0-100
  waterLevel: number; // 0-100
  temperature: number; // 0-50 Celsius
}

export interface ProductionStats {
  glucoseRate: number; // arbitrary units per tick
  oxygenRate: number; // arbitrary units per tick
  atpLevel: number; // 0-100%
  nadphLevel: number; // 0-100%
  limitingFactor: 'Light' | 'CO2' | 'Water' | 'Temperature' | 'None';
}

export interface HistoryPoint {
  timestamp: number;
  glucose: number;
  oxygen: number;
}

export enum SimulationStatus {
  RUNNING,
  PAUSED,
}
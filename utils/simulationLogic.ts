import { SimulationState, ProductionStats } from '../types';

export const calculatePhotosynthesis = (state: SimulationState): ProductionStats => {
  const { lightIntensity, co2Level, waterLevel, temperature } = state;

  // Normalize inputs to 0-1 scale for calculation
  const light = lightIntensity / 100;
  const co2 = co2Level / 100;
  const water = waterLevel / 100;

  // Temperature curve: Photosynthesis peaks around 25-30C, drops off after 40C due to enzyme denaturation
  // Simple bell curve approximation centered at 25
  let tempFactor = 0;
  if (temperature > 0 && temperature < 45) {
      // Gaussian-ish shape
      const peak = 25;
      const spread = 15;
      tempFactor = Math.exp(-Math.pow(temperature - peak, 2) / (2 * Math.pow(spread, 2)));
  }

  // Liebig's Law of the Minimum
  // The rate is determined by the scarcest resource among Light, CO2, and Water (modulated by Temp)
  
  // We weight them slightly differently to mimic biology
  // Light drives ATP/NADPH (Light Dependent)
  // CO2 drives Calvin Cycle (Light Independent)
  // Water is electron donor (but plants are resilient to mild water stress in short term, though stomata close)
  
  // Model: Stomatal conductance depends on water. If water is low, stomata close, effectively reducing CO2.
  const effectiveCO2 = co2 * (water > 0.2 ? 1 : water * 5); 

  const factors = [
    { name: 'Light', value: light },
    { name: 'CO2', value: effectiveCO2 },
    { name: 'Temperature', value: tempFactor },
    // Water is usually not a direct substrate limiter in the equation as much as a regulator, but for simplicity:
    { name: 'Water', value: water }
  ];

  // Find the minimum factor
  let minVal = 2.0; // Higher than any normalized value
  let limitingFactor: ProductionStats['limitingFactor'] = 'None';

  for (const f of factors) {
      if (f.value < minVal) {
          minVal = f.value;
          limitingFactor = f.name as ProductionStats['limitingFactor'];
      }
  }

  // Base Rate
  const rawRate = minVal;

  // Calculate outputs
  // Glucose rate
  const glucoseRate = rawRate * 5; // Arbitrary multiplier for visualization
  
  // Oxygen is a byproduct of the light reaction (water splitting), so it's heavily tied to Light and Water
  const oxygenRate = (Math.min(light, water) * tempFactor) * 5;

  // Intermediates for visual feedback
  // ATP/NADPH are high if light is high but CO2 is low (bottleneck in Calvin cycle)
  // Low if light is low
  let atpLevel = 0;
  if (light > co2) {
      atpLevel = Math.min(100, 50 + (light - co2) * 50); // Stockpiling
  } else {
      atpLevel = Math.min(100, light * 100); // Used as fast as made
  }

  return {
    glucoseRate,
    oxygenRate,
    atpLevel,
    nadphLevel: atpLevel, // Simplify to track together
    limitingFactor
  };
};
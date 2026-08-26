export interface StateInfo {
  code: string;
  name: string;
  demandMultiplier: number; // relative freight demand, 1.0 = average
  fuelCostMultiplierCentsPerGallon: number; // base fuel price in cents/gallon
}

export const STATES: StateInfo[] = [
  { code: "AL", name: "Alabama", demandMultiplier: 0.9, fuelCostMultiplierCentsPerGallon: 310 },
  { code: "AK", name: "Alaska", demandMultiplier: 0.5, fuelCostMultiplierCentsPerGallon: 430 },
  { code: "AZ", name: "Arizona", demandMultiplier: 1.0, fuelCostMultiplierCentsPerGallon: 355 },
  { code: "AR", name: "Arkansas", demandMultiplier: 0.85, fuelCostMultiplierCentsPerGallon: 305 },
  { code: "CA", name: "California", demandMultiplier: 1.5, fuelCostMultiplierCentsPerGallon: 480 },
  { code: "CO", name: "Colorado", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 340 },
  { code: "CT", name: "Connecticut", demandMultiplier: 0.95, fuelCostMultiplierCentsPerGallon: 370 },
  { code: "DE", name: "Delaware", demandMultiplier: 0.8, fuelCostMultiplierCentsPerGallon: 330 },
  { code: "FL", name: "Florida", demandMultiplier: 1.3, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "GA", name: "Georgia", demandMultiplier: 1.25, fuelCostMultiplierCentsPerGallon: 315 },
  { code: "HI", name: "Hawaii", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 480 },
  { code: "ID", name: "Idaho", demandMultiplier: 0.6, fuelCostMultiplierCentsPerGallon: 350 },
  { code: "IL", name: "Illinois", demandMultiplier: 1.35, fuelCostMultiplierCentsPerGallon: 375 },
  { code: "IN", name: "Indiana", demandMultiplier: 1.15, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "IA", name: "Iowa", demandMultiplier: 0.8, fuelCostMultiplierCentsPerGallon: 310 },
  { code: "KS", name: "Kansas", demandMultiplier: 0.75, fuelCostMultiplierCentsPerGallon: 305 },
  { code: "KY", name: "Kentucky", demandMultiplier: 0.9, fuelCostMultiplierCentsPerGallon: 315 },
  { code: "LA", name: "Louisiana", demandMultiplier: 1.0, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "ME", name: "Maine", demandMultiplier: 0.55, fuelCostMultiplierCentsPerGallon: 355 },
  { code: "MD", name: "Maryland", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 345 },
  { code: "MA", name: "Massachusetts", demandMultiplier: 1.1, fuelCostMultiplierCentsPerGallon: 370 },
  { code: "MI", name: "Michigan", demandMultiplier: 1.15, fuelCostMultiplierCentsPerGallon: 340 },
  { code: "MN", name: "Minnesota", demandMultiplier: 1.0, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "MS", name: "Mississippi", demandMultiplier: 0.7, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "MO", name: "Missouri", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 310 },
  { code: "MT", name: "Montana", demandMultiplier: 0.45, fuelCostMultiplierCentsPerGallon: 355 },
  { code: "NE", name: "Nebraska", demandMultiplier: 0.65, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "NV", name: "Nevada", demandMultiplier: 0.85, fuelCostMultiplierCentsPerGallon: 400 },
  { code: "NH", name: "New Hampshire", demandMultiplier: 0.55, fuelCostMultiplierCentsPerGallon: 330 },
  { code: "NJ", name: "New Jersey", demandMultiplier: 1.3, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "NM", name: "New Mexico", demandMultiplier: 0.6, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "NY", name: "New York", demandMultiplier: 1.4, fuelCostMultiplierCentsPerGallon: 375 },
  { code: "NC", name: "North Carolina", demandMultiplier: 1.15, fuelCostMultiplierCentsPerGallon: 310 },
  { code: "ND", name: "North Dakota", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "OH", name: "Ohio", demandMultiplier: 1.3, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "OK", name: "Oklahoma", demandMultiplier: 0.8, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "OR", name: "Oregon", demandMultiplier: 0.85, fuelCostMultiplierCentsPerGallon: 405 },
  { code: "PA", name: "Pennsylvania", demandMultiplier: 1.35, fuelCostMultiplierCentsPerGallon: 380 },
  { code: "RI", name: "Rhode Island", demandMultiplier: 0.5, fuelCostMultiplierCentsPerGallon: 360 },
  { code: "SC", name: "South Carolina", demandMultiplier: 0.95, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "SD", name: "South Dakota", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 315 },
  { code: "TN", name: "Tennessee", demandMultiplier: 1.1, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "TX", name: "Texas", demandMultiplier: 1.45, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "UT", name: "Utah", demandMultiplier: 0.75, fuelCostMultiplierCentsPerGallon: 355 },
  { code: "VT", name: "Vermont", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 355 },
  { code: "VA", name: "Virginia", demandMultiplier: 1.1, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "WA", name: "Washington", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 400 },
  { code: "WV", name: "West Virginia", demandMultiplier: 0.5, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "WI", name: "Wisconsin", demandMultiplier: 0.95, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "WY", name: "Wyoming", demandMultiplier: 0.35, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "DC", name: "District of Columbia", demandMultiplier: 0.6, fuelCostMultiplierCentsPerGallon: 350 },
];

const STATE_BY_CODE = new Map(STATES.map((s) => [s.code, s]));

export function getState(code: string): StateInfo | undefined {
  return STATE_BY_CODE.get(code);
}

export const CARGO_TYPES = [
  "General Freight",
  "Electronics",
  "Furniture",
  "Building Materials",
  "Retail Goods",
  "Auto Parts",
  "Produce",
  "Paper Products",
];

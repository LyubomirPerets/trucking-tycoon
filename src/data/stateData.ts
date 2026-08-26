export interface StateInfo {
  code: string;
  name: string;
  majorCity: string;
  demandMultiplier: number; // relative freight demand, 1.0 = average
  fuelCostMultiplierCentsPerGallon: number; // base fuel price in cents/gallon
}

export const STATES: StateInfo[] = [
  { code: "AL", name: "Alabama", majorCity: "Birmingham", demandMultiplier: 0.9, fuelCostMultiplierCentsPerGallon: 310 },
  { code: "AK", name: "Alaska", majorCity: "Anchorage", demandMultiplier: 0.5, fuelCostMultiplierCentsPerGallon: 430 },
  { code: "AZ", name: "Arizona", majorCity: "Phoenix", demandMultiplier: 1.0, fuelCostMultiplierCentsPerGallon: 355 },
  { code: "AR", name: "Arkansas", majorCity: "Little Rock", demandMultiplier: 0.85, fuelCostMultiplierCentsPerGallon: 305 },
  { code: "CA", name: "California", majorCity: "Los Angeles", demandMultiplier: 1.5, fuelCostMultiplierCentsPerGallon: 480 },
  { code: "CO", name: "Colorado", majorCity: "Denver", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 340 },
  { code: "CT", name: "Connecticut", majorCity: "Hartford", demandMultiplier: 0.95, fuelCostMultiplierCentsPerGallon: 370 },
  { code: "DE", name: "Delaware", majorCity: "Wilmington", demandMultiplier: 0.8, fuelCostMultiplierCentsPerGallon: 330 },
  { code: "FL", name: "Florida", majorCity: "Miami", demandMultiplier: 1.3, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "GA", name: "Georgia", majorCity: "Atlanta", demandMultiplier: 1.25, fuelCostMultiplierCentsPerGallon: 315 },
  { code: "HI", name: "Hawaii", majorCity: "Honolulu", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 480 },
  { code: "ID", name: "Idaho", majorCity: "Boise", demandMultiplier: 0.6, fuelCostMultiplierCentsPerGallon: 350 },
  { code: "IL", name: "Illinois", majorCity: "Chicago", demandMultiplier: 1.35, fuelCostMultiplierCentsPerGallon: 375 },
  { code: "IN", name: "Indiana", majorCity: "Indianapolis", demandMultiplier: 1.15, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "IA", name: "Iowa", majorCity: "Des Moines", demandMultiplier: 0.8, fuelCostMultiplierCentsPerGallon: 310 },
  { code: "KS", name: "Kansas", majorCity: "Wichita", demandMultiplier: 0.75, fuelCostMultiplierCentsPerGallon: 305 },
  { code: "KY", name: "Kentucky", majorCity: "Louisville", demandMultiplier: 0.9, fuelCostMultiplierCentsPerGallon: 315 },
  { code: "LA", name: "Louisiana", majorCity: "New Orleans", demandMultiplier: 1.0, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "ME", name: "Maine", majorCity: "Portland", demandMultiplier: 0.55, fuelCostMultiplierCentsPerGallon: 355 },
  { code: "MD", name: "Maryland", majorCity: "Baltimore", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 345 },
  { code: "MA", name: "Massachusetts", majorCity: "Boston", demandMultiplier: 1.1, fuelCostMultiplierCentsPerGallon: 370 },
  { code: "MI", name: "Michigan", majorCity: "Detroit", demandMultiplier: 1.15, fuelCostMultiplierCentsPerGallon: 340 },
  { code: "MN", name: "Minnesota", majorCity: "Minneapolis", demandMultiplier: 1.0, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "MS", name: "Mississippi", majorCity: "Jackson", demandMultiplier: 0.7, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "MO", name: "Missouri", majorCity: "Kansas City", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 310 },
  { code: "MT", name: "Montana", majorCity: "Billings", demandMultiplier: 0.45, fuelCostMultiplierCentsPerGallon: 355 },
  { code: "NE", name: "Nebraska", majorCity: "Omaha", demandMultiplier: 0.65, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "NV", name: "Nevada", majorCity: "Las Vegas", demandMultiplier: 0.85, fuelCostMultiplierCentsPerGallon: 400 },
  { code: "NH", name: "New Hampshire", majorCity: "Manchester", demandMultiplier: 0.55, fuelCostMultiplierCentsPerGallon: 330 },
  { code: "NJ", name: "New Jersey", majorCity: "Newark", demandMultiplier: 1.3, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "NM", name: "New Mexico", majorCity: "Albuquerque", demandMultiplier: 0.6, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "NY", name: "New York", majorCity: "New York City", demandMultiplier: 1.4, fuelCostMultiplierCentsPerGallon: 375 },
  { code: "NC", name: "North Carolina", majorCity: "Charlotte", demandMultiplier: 1.15, fuelCostMultiplierCentsPerGallon: 310 },
  { code: "ND", name: "North Dakota", majorCity: "Fargo", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "OH", name: "Ohio", majorCity: "Columbus", demandMultiplier: 1.3, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "OK", name: "Oklahoma", majorCity: "Oklahoma City", demandMultiplier: 0.8, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "OR", name: "Oregon", majorCity: "Portland", demandMultiplier: 0.85, fuelCostMultiplierCentsPerGallon: 405 },
  { code: "PA", name: "Pennsylvania", majorCity: "Philadelphia", demandMultiplier: 1.35, fuelCostMultiplierCentsPerGallon: 380 },
  { code: "RI", name: "Rhode Island", majorCity: "Providence", demandMultiplier: 0.5, fuelCostMultiplierCentsPerGallon: 360 },
  { code: "SC", name: "South Carolina", majorCity: "Columbia", demandMultiplier: 0.95, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "SD", name: "South Dakota", majorCity: "Sioux Falls", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 315 },
  { code: "TN", name: "Tennessee", majorCity: "Nashville", demandMultiplier: 1.1, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "TX", name: "Texas", majorCity: "Houston", demandMultiplier: 1.45, fuelCostMultiplierCentsPerGallon: 300 },
  { code: "UT", name: "Utah", majorCity: "Salt Lake City", demandMultiplier: 0.75, fuelCostMultiplierCentsPerGallon: 355 },
  { code: "VT", name: "Vermont", majorCity: "Burlington", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 355 },
  { code: "VA", name: "Virginia", majorCity: "Richmond", demandMultiplier: 1.1, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "WA", name: "Washington", majorCity: "Seattle", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 400 },
  { code: "WV", name: "West Virginia", majorCity: "Charleston", demandMultiplier: 0.5, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "WI", name: "Wisconsin", majorCity: "Milwaukee", demandMultiplier: 0.95, fuelCostMultiplierCentsPerGallon: 320 },
  { code: "WY", name: "Wyoming", majorCity: "Cheyenne", demandMultiplier: 0.35, fuelCostMultiplierCentsPerGallon: 335 },
  { code: "DC", name: "District of Columbia", majorCity: "Washington", demandMultiplier: 0.6, fuelCostMultiplierCentsPerGallon: 350 },
];

const STATE_BY_CODE = new Map(STATES.map((s) => [s.code, s]));
const STATE_BY_NAME = new Map(STATES.map((s) => [s.name, s]));

export function getState(code: string): StateInfo | undefined {
  return STATE_BY_CODE.get(code);
}

export function getStateByName(name: string): StateInfo | undefined {
  return STATE_BY_NAME.get(name);
}

export const CARGO_TYPES = [
  "General Freight",
  "Electronics",
  "Furniture",
  "Building Materials",
  "Retail Goods",
  "Auto Parts",
  "Paper Products",
  "Hazardous Materials",
  "Refrigerated Goods",
];

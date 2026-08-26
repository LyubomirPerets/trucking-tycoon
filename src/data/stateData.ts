export interface StateInfo {
  code: string;
  name: string;
  majorCity: string;
  demandMultiplier: number; // relative freight demand, 1.0 = average
  fuelCostMultiplierCentsPerGallon: number; // base fuel price in cents/gallon
  lat: number; // major-city latitude, for map projection
  lon: number; // major-city longitude
}

export const STATES: StateInfo[] = [
  { code: "AL", name: "Alabama", majorCity: "Birmingham", demandMultiplier: 0.9, fuelCostMultiplierCentsPerGallon: 310, lat: 33.52, lon: -86.8 },
  { code: "AK", name: "Alaska", majorCity: "Anchorage", demandMultiplier: 0.5, fuelCostMultiplierCentsPerGallon: 430, lat: 61.22, lon: -149.9 },
  { code: "AZ", name: "Arizona", majorCity: "Phoenix", demandMultiplier: 1.0, fuelCostMultiplierCentsPerGallon: 355, lat: 33.45, lon: -112.07 },
  { code: "AR", name: "Arkansas", majorCity: "Little Rock", demandMultiplier: 0.85, fuelCostMultiplierCentsPerGallon: 305, lat: 34.75, lon: -92.29 },
  { code: "CA", name: "California", majorCity: "Los Angeles", demandMultiplier: 1.5, fuelCostMultiplierCentsPerGallon: 480, lat: 34.05, lon: -118.24 },
  { code: "CO", name: "Colorado", majorCity: "Denver", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 340, lat: 39.74, lon: -104.99 },
  { code: "CT", name: "Connecticut", majorCity: "Hartford", demandMultiplier: 0.95, fuelCostMultiplierCentsPerGallon: 370, lat: 41.76, lon: -72.67 },
  { code: "DE", name: "Delaware", majorCity: "Wilmington", demandMultiplier: 0.8, fuelCostMultiplierCentsPerGallon: 330, lat: 39.75, lon: -75.55 },
  { code: "FL", name: "Florida", majorCity: "Miami", demandMultiplier: 1.3, fuelCostMultiplierCentsPerGallon: 335, lat: 25.76, lon: -80.19 },
  { code: "GA", name: "Georgia", majorCity: "Atlanta", demandMultiplier: 1.25, fuelCostMultiplierCentsPerGallon: 315, lat: 33.75, lon: -84.39 },
  { code: "HI", name: "Hawaii", majorCity: "Honolulu", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 480, lat: 21.31, lon: -157.86 },
  { code: "ID", name: "Idaho", majorCity: "Boise", demandMultiplier: 0.6, fuelCostMultiplierCentsPerGallon: 350, lat: 43.62, lon: -116.21 },
  { code: "IL", name: "Illinois", majorCity: "Chicago", demandMultiplier: 1.35, fuelCostMultiplierCentsPerGallon: 375, lat: 41.88, lon: -87.63 },
  { code: "IN", name: "Indiana", majorCity: "Indianapolis", demandMultiplier: 1.15, fuelCostMultiplierCentsPerGallon: 320, lat: 39.77, lon: -86.16 },
  { code: "IA", name: "Iowa", majorCity: "Des Moines", demandMultiplier: 0.8, fuelCostMultiplierCentsPerGallon: 310, lat: 41.59, lon: -93.62 },
  { code: "KS", name: "Kansas", majorCity: "Wichita", demandMultiplier: 0.75, fuelCostMultiplierCentsPerGallon: 305, lat: 37.69, lon: -97.34 },
  { code: "KY", name: "Kentucky", majorCity: "Louisville", demandMultiplier: 0.9, fuelCostMultiplierCentsPerGallon: 315, lat: 38.25, lon: -85.76 },
  { code: "LA", name: "Louisiana", majorCity: "New Orleans", demandMultiplier: 1.0, fuelCostMultiplierCentsPerGallon: 300, lat: 29.95, lon: -90.07 },
  { code: "ME", name: "Maine", majorCity: "Portland", demandMultiplier: 0.55, fuelCostMultiplierCentsPerGallon: 355, lat: 43.66, lon: -70.26 },
  { code: "MD", name: "Maryland", majorCity: "Baltimore", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 345, lat: 39.29, lon: -76.61 },
  { code: "MA", name: "Massachusetts", majorCity: "Boston", demandMultiplier: 1.1, fuelCostMultiplierCentsPerGallon: 370, lat: 42.36, lon: -71.06 },
  { code: "MI", name: "Michigan", majorCity: "Detroit", demandMultiplier: 1.15, fuelCostMultiplierCentsPerGallon: 340, lat: 42.33, lon: -83.05 },
  { code: "MN", name: "Minnesota", majorCity: "Minneapolis", demandMultiplier: 1.0, fuelCostMultiplierCentsPerGallon: 335, lat: 44.98, lon: -93.27 },
  { code: "MS", name: "Mississippi", majorCity: "Jackson", demandMultiplier: 0.7, fuelCostMultiplierCentsPerGallon: 300, lat: 32.3, lon: -90.18 },
  { code: "MO", name: "Missouri", majorCity: "Kansas City", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 310, lat: 39.1, lon: -94.58 },
  { code: "MT", name: "Montana", majorCity: "Billings", demandMultiplier: 0.45, fuelCostMultiplierCentsPerGallon: 355, lat: 45.78, lon: -108.5 },
  { code: "NE", name: "Nebraska", majorCity: "Omaha", demandMultiplier: 0.65, fuelCostMultiplierCentsPerGallon: 320, lat: 41.26, lon: -95.93 },
  { code: "NV", name: "Nevada", majorCity: "Las Vegas", demandMultiplier: 0.85, fuelCostMultiplierCentsPerGallon: 400, lat: 36.17, lon: -115.14 },
  { code: "NH", name: "New Hampshire", majorCity: "Manchester", demandMultiplier: 0.55, fuelCostMultiplierCentsPerGallon: 330, lat: 42.99, lon: -71.46 },
  { code: "NJ", name: "New Jersey", majorCity: "Newark", demandMultiplier: 1.3, fuelCostMultiplierCentsPerGallon: 335, lat: 40.74, lon: -74.17 },
  { code: "NM", name: "New Mexico", majorCity: "Albuquerque", demandMultiplier: 0.6, fuelCostMultiplierCentsPerGallon: 335, lat: 35.08, lon: -106.65 },
  { code: "NY", name: "New York", majorCity: "New York City", demandMultiplier: 1.4, fuelCostMultiplierCentsPerGallon: 375, lat: 40.71, lon: -74.01 },
  { code: "NC", name: "North Carolina", majorCity: "Charlotte", demandMultiplier: 1.15, fuelCostMultiplierCentsPerGallon: 310, lat: 35.23, lon: -80.84 },
  { code: "ND", name: "North Dakota", majorCity: "Fargo", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 320, lat: 46.88, lon: -96.79 },
  { code: "OH", name: "Ohio", majorCity: "Columbus", demandMultiplier: 1.3, fuelCostMultiplierCentsPerGallon: 320, lat: 39.96, lon: -83.0 },
  { code: "OK", name: "Oklahoma", majorCity: "Oklahoma City", demandMultiplier: 0.8, fuelCostMultiplierCentsPerGallon: 300, lat: 35.47, lon: -97.52 },
  { code: "OR", name: "Oregon", majorCity: "Portland", demandMultiplier: 0.85, fuelCostMultiplierCentsPerGallon: 405, lat: 45.52, lon: -122.68 },
  { code: "PA", name: "Pennsylvania", majorCity: "Philadelphia", demandMultiplier: 1.35, fuelCostMultiplierCentsPerGallon: 380, lat: 39.95, lon: -75.17 },
  { code: "RI", name: "Rhode Island", majorCity: "Providence", demandMultiplier: 0.5, fuelCostMultiplierCentsPerGallon: 360, lat: 41.82, lon: -71.41 },
  { code: "SC", name: "South Carolina", majorCity: "Columbia", demandMultiplier: 0.95, fuelCostMultiplierCentsPerGallon: 300, lat: 34.0, lon: -81.03 },
  { code: "SD", name: "South Dakota", majorCity: "Sioux Falls", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 315, lat: 43.55, lon: -96.7 },
  { code: "TN", name: "Tennessee", majorCity: "Nashville", demandMultiplier: 1.1, fuelCostMultiplierCentsPerGallon: 300, lat: 36.16, lon: -86.78 },
  { code: "TX", name: "Texas", majorCity: "Houston", demandMultiplier: 1.45, fuelCostMultiplierCentsPerGallon: 300, lat: 29.76, lon: -95.37 },
  { code: "UT", name: "Utah", majorCity: "Salt Lake City", demandMultiplier: 0.75, fuelCostMultiplierCentsPerGallon: 355, lat: 40.76, lon: -111.89 },
  { code: "VT", name: "Vermont", majorCity: "Burlington", demandMultiplier: 0.4, fuelCostMultiplierCentsPerGallon: 355, lat: 44.48, lon: -73.21 },
  { code: "VA", name: "Virginia", majorCity: "Richmond", demandMultiplier: 1.1, fuelCostMultiplierCentsPerGallon: 320, lat: 37.54, lon: -77.44 },
  { code: "WA", name: "Washington", majorCity: "Seattle", demandMultiplier: 1.05, fuelCostMultiplierCentsPerGallon: 400, lat: 47.61, lon: -122.33 },
  { code: "WV", name: "West Virginia", majorCity: "Charleston", demandMultiplier: 0.5, fuelCostMultiplierCentsPerGallon: 335, lat: 38.35, lon: -81.63 },
  { code: "WI", name: "Wisconsin", majorCity: "Milwaukee", demandMultiplier: 0.95, fuelCostMultiplierCentsPerGallon: 320, lat: 43.04, lon: -87.91 },
  { code: "WY", name: "Wyoming", majorCity: "Cheyenne", demandMultiplier: 0.35, fuelCostMultiplierCentsPerGallon: 335, lat: 41.14, lon: -104.82 },
  { code: "DC", name: "District of Columbia", majorCity: "Washington", demandMultiplier: 0.6, fuelCostMultiplierCentsPerGallon: 350, lat: 38.9, lon: -77.04 },
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

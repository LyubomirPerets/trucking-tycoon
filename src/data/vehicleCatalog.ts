import type { VehicleClass } from "../types";

export interface VehicleCatalogEntry {
  class: VehicleClass;
  make: string;
  model: string;
  year: number;
  priceCents: number;
  maintenanceCostPerMileCents: number;
  fuelEfficiencyMpg: number;
  cargoCapacityLbs: number;
}

export const VEHICLE_CATALOG: VehicleCatalogEntry[] = [
  {
    class: "van",
    make: "Ford",
    model: "Transit 250",
    year: 2021,
    priceCents: 3_200_000, // $32,000
    maintenanceCostPerMileCents: 12,
    fuelEfficiencyMpg: 18,
    cargoCapacityLbs: 3_800,
  },
  {
    class: "van",
    make: "Ram",
    model: "ProMaster 2500",
    year: 2022,
    priceCents: 3_600_000, // $36,000
    maintenanceCostPerMileCents: 11,
    fuelEfficiencyMpg: 17,
    cargoCapacityLbs: 4_000,
  },
  {
    class: "boxTruck",
    make: "Isuzu",
    model: "NPR-HD",
    year: 2020,
    priceCents: 6_800_000, // $68,000
    maintenanceCostPerMileCents: 22,
    fuelEfficiencyMpg: 12,
    cargoCapacityLbs: 12_000,
  },
  {
    class: "semi",
    make: "Freightliner",
    model: "Cascadia",
    year: 2019,
    priceCents: 14_500_000, // $145,000
    maintenanceCostPerMileCents: 38,
    fuelEfficiencyMpg: 7,
    cargoCapacityLbs: 45_000,
  },
];

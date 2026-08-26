export const DRIVER_FIRST_NAMES = [
  "James",
  "Maria",
  "Robert",
  "Linda",
  "Michael",
  "Patricia",
  "David",
  "Barbara",
  "Carlos",
  "Jennifer",
  "Marcus",
  "Angela",
  "Kevin",
  "Denise",
  "Anthony",
  "Rosa",
  "Brian",
  "Tanya",
  "Willie",
  "Sandra",
];

export const DRIVER_LAST_NAMES = [
  "Hendricks",
  "Osei",
  "Nguyen",
  "Ramirez",
  "Kowalski",
  "Whitfield",
  "Delgado",
  "Novak",
  "Boone",
  "Alvarez",
  "Sutton",
  "Mercer",
  "Vasquez",
  "Larkin",
  "Petrov",
  "Okafor",
  "Reyes",
  "Fontaine",
  "Grady",
  "Ashworth",
];

// Base wage per mile by experience level (cents). Higher-experience drivers
// cost more but bring lower breakdown/failure risk once that's modeled.
export const WAGE_PER_MILE_CENTS_BY_EXPERIENCE: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 45,
  2: 55,
  3: 65,
  4: 78,
  5: 95,
};

export const CDL_CLASSES: Array<"A" | "B" | "C"> = ["A", "B", "C"];

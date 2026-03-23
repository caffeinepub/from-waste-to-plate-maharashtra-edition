export type SafetyStatus = "safe" | "urgent" | "unsafe";

export interface FoodSafetyResult {
  remainingHours: number;
  status: SafetyStatus;
  message: string;
  expiryTime: Date;
}

// Base shelf life in hours by food type
const BASE_SHELF_LIFE: Record<string, number> = {
  "Vegetable Curry": 6,
  Dal: 8,
  Rice: 6,
  Roti: 4,
  Chapati: 4,
  Biryani: 5,
  Khichdi: 6,
  Sabzi: 5,
  Poha: 3,
  Upma: 3,
  Idli: 4,
  Dosa: 2,
  Sambar: 6,
  Bread: 24,
  Fruits: 12,
  Salad: 3,
  Sweets: 12,
  Mithai: 12,
  Snacks: 8,
  default: 5,
};

// Storage condition multipliers
const STORAGE_MULTIPLIERS: Record<string, number> = {
  refrigerated: 2.5,
  hotStorage: 1.2,
  roomTemperature: 1.0,
};

// Maharashtra city temperature factors (higher temp = faster spoilage)
const CITY_CLIMATE_FACTORS: Record<string, number> = {
  Mumbai: 0.85, // High humidity, coastal
  Pune: 0.9, // Moderate
  Nagpur: 0.75, // Very hot, inland
  Nashik: 0.92, // Cooler
  Aurangabad: 0.8, // Hot, dry
  Kolhapur: 0.88, // Moderate
};

export function computeFoodSafety(
  foodType: string,
  cookTimeMs: number,
  storageCondition: string,
  city: string,
): FoodSafetyResult {
  const now = Date.now();
  const cookTimeDate = new Date(cookTimeMs / 1_000_000); // Convert nanoseconds to ms
  const elapsedHours = (now - cookTimeDate.getTime()) / (1000 * 60 * 60);

  const baseLife = BASE_SHELF_LIFE[foodType] ?? BASE_SHELF_LIFE.default;
  const storageMult = STORAGE_MULTIPLIERS[storageCondition] ?? 1.0;
  const climateFactor = CITY_CLIMATE_FACTORS[city] ?? 0.88;

  const totalShelfLife = baseLife * storageMult * climateFactor;
  const remainingHours = Math.max(0, totalShelfLife - elapsedHours);

  const expiryTime = new Date(
    cookTimeDate.getTime() + totalShelfLife * 60 * 60 * 1000,
  );

  let status: SafetyStatus;
  let message: string;

  if (remainingHours >= 3) {
    status = "safe";
    message = `Safe for ${remainingHours.toFixed(1)} more hours`;
  } else if (remainingHours >= 1) {
    status = "urgent";
    message = `Priority pickup recommended — ${remainingHours.toFixed(1)} hours remaining`;
  } else {
    status = "unsafe";
    message =
      remainingHours <= 0
        ? "Food may have expired"
        : `Critical — only ${(remainingHours * 60).toFixed(0)} minutes remaining`;
  }

  return { remainingHours, status, message, expiryTime };
}

import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  MapPin,
  Mic,
  MicOff,
  Star,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useEmergencyMode, useLanguage } from "../App";
import {
  useCreateFoodDonation,
  useGetNgosByCity,
  useRateNgo,
} from "../hooks/useQueries";
import {
  type FoodSafetyResult,
  computeFoodSafety,
} from "../utils/foodSafetyEngine";
import { type NgoMatch, matchNgos } from "../utils/ngoMatcher";

const MAHARASHTRA_CITIES = [
  "Mumbai",
  "Pune",
  "Nagpur",
  "Nashik",
  "Aurangabad",
  "Kolhapur",
];

const CITY_NEIGHBORHOODS: Record<string, string[]> = {
  Mumbai: [
    "Andheri East",
    "Andheri West",
    "Dadar West",
    "Bandra Kurla Complex",
    "Bandra West",
    "Borivali",
    "Malad",
    "Goregaon",
    "Kurla",
    "Chembur",
  ],
  Pune: [
    "FC Road",
    "Hinjewadi",
    "Kothrud",
    "Shivajinagar",
    "Koregaon Park",
    "Viman Nagar",
    "Hadapsar",
    "Wakad",
    "Baner",
    "Aundh",
  ],
  Nagpur: [
    "Sitabuldi",
    "Wardha Road",
    "Dharampeth",
    "Sadar",
    "Ramdaspeth",
    "Manish Nagar",
    "Hingna",
    "Kamptee",
  ],
  Nashik: [
    "Gangapur Road",
    "College Road",
    "Panchavati",
    "Nashik Road",
    "Cidco",
    "Satpur",
  ],
  Aurangabad: [
    "Cidco",
    "Garkheda",
    "Osmanpura",
    "Cantonment",
    "Waluj",
    "Aurangpura",
  ],
  Kolhapur: [
    "Rajarampuri",
    "Shivaji Park",
    "Tarabai Park",
    "Kasba Bawada",
    "Shahupuri",
  ],
};

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Pune: { lat: 18.5204, lon: 73.8567 },
  Nagpur: { lat: 21.1458, lon: 79.0882 },
  Nashik: { lat: 19.9975, lon: 73.7898 },
  Aurangabad: { lat: 19.8762, lon: 75.3433 },
  Kolhapur: { lat: 16.705, lon: 74.2433 },
};

const FOOD_TYPES = [
  "Vegetable Curry",
  "Dal",
  "Rice",
  "Roti",
  "Chapati",
  "Biryani",
  "Khichdi",
  "Sabzi",
  "Poha",
  "Upma",
  "Idli",
  "Dosa",
  "Sambar",
  "Bread",
  "Fruits",
  "Salad",
  "Sweets",
  "Mithai",
  "Snacks",
];

const STORAGE_OPTIONS = [
  { value: "roomTemperature", label: "Room Temperature" },
  { value: "refrigerated", label: "Refrigerated" },
  { value: "hotStorage", label: "Hot Storage" },
];

function SafetyBadge({ result }: { result: FoodSafetyResult }) {
  const colors = {
    safe: "bg-green-100 border-green-400 text-green-800",
    urgent: "bg-yellow-100 border-yellow-400 text-yellow-800",
    unsafe: "bg-red-100 border-red-400 text-red-800",
  };
  const icons = {
    safe: <CheckCircle className="w-5 h-5 text-green-600" />,
    urgent: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    unsafe: <XCircle className="w-5 h-5 text-red-600" />,
  };
  const labels = { safe: "🟢 Safe", urgent: "🟡 Urgent", unsafe: "🔴 Unsafe" };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border-2 ${colors[result.status]} transition-all duration-500`}
    >
      {icons[result.status]}
      <div>
        <p className="font-bold text-sm">{labels[result.status]}</p>
        <p className="text-sm">{result.message}</p>
      </div>
    </div>
  );
}

function StarRating({ onRate }: { onRate: (rating: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => {
            setSelected(star);
            onRate(star);
          }}
          className="transition-transform hover:scale-125"
        >
          <Star
            className={`w-7 h-7 transition-colors ${star <= (hovered || selected) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function DonateFood() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { emergencyMode } = useEmergencyMode();
  const createDonation = useCreateFoodDonation();
  const rateNgoMutation = useRateNgo();

  const [step, setStep] = useState<"form" | "result">("form");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Form state
  const [foodType, setFoodType] = useState("Vegetable Curry");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("servings");
  const [cookTime, setCookTime] = useState("");
  const [storageCondition, setStorageCondition] = useState("roomTemperature");
  const [city, setCity] = useState("Mumbai");
  const [neighborhood, setNeighborhood] = useState("Andheri East");
  const [donorName, setDonorName] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  // Result state
  const [safetyResult, setSafetyResult] = useState<FoodSafetyResult | null>(
    null,
  );
  const [ratedNgoId, setRatedNgoId] = useState<bigint | null>(null);
  const [ngoMatches, setNgoMatches] = useState<NgoMatch[]>([]);
  const [_submittedDonationId, setSubmittedDonationId] = useState<
    bigint | null
  >(null);

  const { data: ngosInCity } = useGetNgosByCity(city);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setUseCurrentLocation(true);
        toast.success("Location detected!");
      },
      () => toast.error("Could not detect location"),
    );
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      toast.info(`Voice: "${transcript}"`);
      const found = FOOD_TYPES.find((f) =>
        transcript.toLowerCase().includes(f.toLowerCase()),
      );
      if (found) setFoodType(found);
      const numMatch = transcript.match(/\d+/);
      if (numMatch) setQuantity(numMatch[0]);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !quantity || !cookTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const cookTimeMs = new Date(cookTime).getTime();
    const cookTimeNs = BigInt(cookTimeMs) * 1_000_000n;
    const donorCoords = coords ?? CITY_COORDS[city];

    const safety = computeFoodSafety(
      foodType,
      cookTimeMs * 1_000_000,
      storageCondition,
      city,
    );
    setSafetyResult(safety);

    if (ngosInCity && ngosInCity.length > 0) {
      const matches = matchNgos(
        donorCoords.lat,
        donorCoords.lon,
        ngosInCity,
        safety.remainingHours,
      );
      setNgoMatches(matches.slice(0, 3));
    }

    try {
      const id = await createDonation.mutateAsync({
        donorName,
        foodType,
        quantity: Number.parseFloat(quantity),
        unit,
        cookTime: cookTimeNs,
        storageCondition: storageCondition as any,
        city,
        neighborhood,
        latitude: donorCoords.lat,
        longitude: donorCoords.lon,
      });
      setSubmittedDonationId(id);
      setStep("result");
      toast.success("🎉 Food donation submitted successfully!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit donation");
    }
  };

  const handleRateNgo = async (ngoId: bigint, rating: number) => {
    try {
      await rateNgoMutation.mutateAsync({ ngoId, rating });
      setRatedNgoId(ngoId);
      toast.success("Thank you for rating this NGO!");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not submit rating");
    }
  };

  if (step === "result" && safetyResult) {
    const topNgo = ngoMatches[0];
    return (
      <div className="min-h-screen bg-background py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              Donation Submitted!
            </h1>
            <p className="text-muted-foreground">
              Your food donation is now being matched with the nearest NGO.
            </p>
          </div>

          {/* Safety Badge */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              🧪 AI Food Safety Analysis
            </h2>
            <SafetyBadge result={safetyResult} />
          </div>

          {/* NGO Match */}
          {topNgo && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                🏢 Best NGO Match
              </h2>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">
                      {topNgo.ngo.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {topNgo.ngo.neighborhood}, {topNgo.ngo.city}
                    </p>
                    <p className="text-sm text-primary font-medium mt-1">
                      📍 {topNgo.distanceKm.toFixed(1)} km · ⏱ ~
                      {topNgo.estimatedPickupMinutes} min
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-500 font-bold">
                      ⭐ {topNgo.ngo.rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Capacity: {topNgo.ngo.capacity.toString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate NGO */}
              {ratedNgoId !== topNgo.ngo.id && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Rate this NGO:
                  </p>
                  <StarRating onRate={(r) => handleRateNgo(topNgo.ngo.id, r)} />
                </div>
              )}
              {ratedNgoId === topNgo.ngo.id && (
                <p className="text-sm text-green-600 font-medium">
                  ✅ Thank you for your rating!
                </p>
              )}
            </div>
          )}

          {/* All Matches */}
          {ngoMatches.length > 1 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-3">
                🗺️ Other Nearby NGOs
              </h2>
              <div className="space-y-2">
                {ngoMatches.slice(1).map((match) => (
                  <div
                    key={match.ngo.id.toString()}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {match.ngo.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {match.ngo.city}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{match.distanceKm.toFixed(1)} km</div>
                      <div>⭐ {match.ngo.rating.toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setSafetyResult(null);
                setNgoMatches([]);
              }}
              className="flex-1 py-3 border border-border rounded-xl font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Donate Again
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/impact" })}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              View Impact
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-10 px-4 ${emergencyMode ? "bg-red-50 dark:bg-red-950/20" : "bg-background"}`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-foreground mb-2">
            {emergencyMode ? "🚨" : "🍱"} {t("donate.title")}
          </h1>
          <p className="text-muted-foreground">{t("donate.subtitle")}</p>
          {emergencyMode && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              Emergency Mode — Priority Processing Active
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-5"
        >
          {/* Donor Name */}
          <div>
            <label
              htmlFor="donor-name"
              className="block text-sm font-semibold text-foreground mb-1.5"
            >
              Your Name / Hotel Name *
            </label>
            <input
              id="donor-name"
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. Taj Hotel Mumbai"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Food Type */}
          <div>
            <label
              htmlFor="food-type"
              className="block text-sm font-semibold text-foreground mb-1.5"
            >
              {t("donate.foodType")} *
            </label>
            <div className="flex gap-2">
              <select
                id="food-type"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {FOOD_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`px-3 py-2.5 rounded-xl border transition-colors ${isListening ? "bg-red-100 border-red-400 text-red-600 animate-pulse" : "border-border hover:bg-muted text-muted-foreground"}`}
                title={t("donate.voice")}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="donate-quantity"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                {t("donate.quantity")} *
              </label>
              <input
                id="donate-quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 50"
                min="1"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label
                htmlFor="donate-unit"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                {t("donate.unit")}
              </label>
              <select
                id="donate-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {["servings", "kg", "litres", "packets", "boxes", "plates"].map(
                  (u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {/* Cook Time */}
          <div>
            <label
              htmlFor="donate-cooktime"
              className="block text-sm font-semibold text-foreground mb-1.5"
            >
              {t("donate.cookTime")} *
            </label>
            <input
              id="donate-cooktime"
              type="datetime-local"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Storage Condition */}
          <div>
            <p className="block text-sm font-semibold text-foreground mb-1.5">
              {t("donate.storage")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STORAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStorageCondition(opt.value)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${storageCondition === opt.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* City & Neighborhood */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="donate-city"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                {t("donate.city")}
              </label>
              <select
                id="donate-city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setNeighborhood(
                    CITY_NEIGHBORHOODS[e.target.value]?.[0] ?? "",
                  );
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {MAHARASHTRA_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="donate-neighborhood"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                {t("donate.neighborhood")}
              </label>
              <select
                id="donate-neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {(CITY_NEIGHBORHOODS[city] ?? []).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <button
              type="button"
              onClick={handleDetectLocation}
              className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <MapPin className="w-4 h-4" />
              {useCurrentLocation
                ? "✅ Using current location"
                : "Use my current location (optional)"}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createDonation.isPending}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {createDonation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              t("donate.submit")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

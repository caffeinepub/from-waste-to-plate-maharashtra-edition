import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  ChevronRight,
  Heart,
  Leaf,
  MapPin,
  Mic,
  MicOff,
  TrendingUp,
  Truck,
  Users,
  Utensils,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../App";
import { useGetImpactCounters } from "../hooks/useQueries";

const MAHARASHTRA_CITIES = [
  "Mumbai",
  "Pune",
  "Nagpur",
  "Nashik",
  "Aurangabad",
  "Kolhapur",
];

function AnimatedCounter({
  target,
  duration = 2000,
  suffix = "",
}: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <div ref={ref} className="tabular-nums">
      {count.toLocaleString("en-IN")}
      {suffix}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: impactCounters } = useGetImpactCounters();
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const recognitionRef = useRef<any>(null);

  const cityStats = impactCounters?.cityBreakdown?.find(
    ([city]) => city === selectedCity,
  );
  const cityMeals = cityStats ? Number(cityStats[1]) : 0;

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
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
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setVoiceText(transcript);
      if (transcript.includes("donate") || transcript.includes("food"))
        navigate({ to: "/donate" });
      else if (transcript.includes("ngo") || transcript.includes("trust"))
        navigate({ to: "/ngo" });
      else if (transcript.includes("volunteer")) navigate({ to: "/volunteer" });
      else if (transcript.includes("impact") || transcript.includes("stats"))
        navigate({ to: "/impact" });
      else if (transcript.includes("admin")) navigate({ to: "/admin" });
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const howItWorksSteps = [
    {
      icon: <Utensils className="w-8 h-8" />,
      title: t("home.how.step1"),
      desc: t("home.how.step1.desc"),
      color: "text-green-600",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: t("home.how.step2"),
      desc: t("home.how.step2.desc"),
      color: "text-orange-500",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: t("home.how.step3"),
      desc: t("home.how.step3.desc"),
      color: "text-green-600",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: t("home.how.step4"),
      desc: t("home.how.step4.desc"),
      color: "text-orange-500",
    },
  ];

  const featuredNgos = [
    {
      name: "Robin Hood Army",
      city: "Mumbai",
      area: "Andheri",
      meals: "1M+",
      rating: 4.8,
    },
    {
      name: "Seva Sahayog",
      city: "Pune",
      area: "Shivajinagar",
      meals: "500K+",
      rating: 4.8,
    },
    {
      name: "Bhojan Seva Trust",
      city: "Nagpur",
      area: "Dharampeth",
      meals: "200K+",
      rating: 4.6,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom right, rgba(20,83,45,0.85), rgba(154,52,18,0.75)), url('/assets/generated/hero-banner.dim_1440x600.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["p0", "p1", "p2", "p3", "p4", "p5"].map((pk, i) => (
            <div
              key={pk}
              className="absolute w-2 h-2 rounded-full bg-white/20 animate-bounce"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${2 + i * 0.3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/assets/generated/logo-icon.dim_128x128.png"
              alt="Left2Lift"
              className="w-16 h-16 rounded-2xl shadow-2xl"
            />
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                Left2Lift
              </h1>
              <p className="text-green-300 font-semibold text-lg">
                Maharashtra Edition
              </p>
            </div>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white/95">
            {t("home.hero.title")}
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-2 font-medium">
            {t("home.hero.subtitle")}
          </p>
          <p className="text-base text-white/70 mb-8 max-w-2xl mx-auto">
            {t("home.hero.tagline")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              type="button"
              onClick={() => navigate({ to: "/donate" })}
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-2xl text-lg shadow-2xl hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              🍱 {t("home.hero.donate")}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/ngo" })}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-2xl text-lg shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              🏢 {t("home.hero.ngo")}
            </button>
          </div>

          {/* Voice Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 ${
                isListening
                  ? "bg-red-500 animate-pulse shadow-red-500/50"
                  : "bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              }`}
              title="Voice navigation"
            >
              {isListening ? (
                <MicOff className="w-7 h-7 text-white" />
              ) : (
                <Mic className="w-7 h-7 text-white" />
              )}
            </button>
            <p className="text-white/60 text-sm">
              {isListening ? "Listening..." : "Tap to navigate by voice"}
            </p>
            {voiceText && (
              <p className="text-white/80 text-sm bg-white/10 px-3 py-1 rounded-full">
                "{voiceText}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Live Counters */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            🌍 Real-Time Impact
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Live statistics from across Maharashtra
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                label: t("home.counters.meals"),
                value: impactCounters
                  ? Number(impactCounters.totalMealsSaved)
                  : 50000,
                icon: "🍽️",
                color: "from-green-500 to-green-600",
              },
              {
                label: t("home.counters.people"),
                value: impactCounters
                  ? Number(impactCounters.totalPeopleFed)
                  : 25000,
                icon: "👥",
                color: "from-orange-500 to-orange-600",
              },
              {
                label: t("home.counters.co2"),
                value: impactCounters
                  ? Math.round(impactCounters.co2Reduced)
                  : 12500,
                icon: "🌱",
                color: "from-emerald-500 to-teal-600",
              },
            ].map((counter) => (
              <div
                key={counter.label}
                className="glass-card rounded-2xl p-6 text-center hover-lift"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${counter.color} flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg`}
                >
                  {counter.icon}
                </div>
                <div className="text-4xl font-black text-foreground mb-2">
                  <AnimatedCounter target={counter.value} />
                </div>
                <p className="text-muted-foreground font-medium">
                  {counter.label}
                </p>
              </div>
            ))}
          </div>

          {/* City Selector */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              City-wise Impact
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {MAHARASHTRA_CITIES.map((city) => (
                <button
                  type="button"
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                    selectedCity === city
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl">
              <div className="text-4xl">🏙️</div>
              <div>
                <p className="text-2xl font-black text-primary">
                  {cityMeals > 0 ? cityMeals.toLocaleString("en-IN") : "—"}
                </p>
                <p className="text-muted-foreground">
                  meals rescued in {selectedCity}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            {t("home.how.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, i) => (
              <div
                key={step.title}
                className="glass-card rounded-2xl p-6 text-center hover-lift group"
              >
                <div
                  className={`${step.color} mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  {step.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured NGOs */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            🤝 Featured NGO Partners
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Verified organizations across Maharashtra
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredNgos.map((ngo) => (
              <div
                key={ngo.name}
                className="glass-card rounded-2xl p-6 hover-lift"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                    🏢
                  </div>
                  <span className="text-yellow-500 font-bold text-sm">
                    ⭐ {ngo.rating}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">
                  {ngo.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {ngo.area}, {ngo.city}
                </p>
                <p className="text-primary font-bold">
                  {ngo.meals} meals served
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of donors, NGOs, and volunteers across Maharashtra
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => navigate({ to: "/donate" })}
              className="px-8 py-4 bg-white text-green-700 font-bold rounded-2xl hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 shadow-xl"
            >
              Start Donating Today
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/impact" })}
              className="px-8 py-4 bg-white/20 text-white font-bold rounded-2xl hover:bg-white/30 transition-all duration-300 hover:-translate-y-1 border border-white/30"
            >
              View Impact Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

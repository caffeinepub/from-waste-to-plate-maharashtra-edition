# Left2Lift – Maharashtra Edition

## Current State
Full-stack platform exists with Home page, Donate, NGO/Volunteer/Hotel/Admin dashboards, login pages, and role-based navigation. The Home page uses translation keys (e.g. `t('home.hero.title')`) that are NOT defined in the translations map, causing placeholder key strings to render in the UI instead of real text. Navbar links and section headings also display raw keys.

## Requested Changes (Diff)

### Add
- Missing translation keys for hero title, subtitle, tagline, CTA buttons, how-it-works steps in all 3 languages (en/mr/hi)

### Modify
- Home.tsx: Replace all `t('home.hero.*')` and `t('home.how.*')` and `t('home.counters.*')` calls with real hardcoded English text (or use added translation keys). Real text:
  - Hero title: "Reduce Food Waste, Feed Lives"
  - Hero subtitle: "Connecting donors with NGOs to deliver surplus food to those in need across Maharashtra."
  - Hero tagline: "One meal can make a difference."
  - Donate button: "Donate Food"
  - NGO button: "Join as NGO"
  - How It Works title: "How It Works"
  - Step 1: "Register Donation" / "Enter details of surplus food you want to donate."
  - Step 2: "Get Matched" / "Our system connects you with nearby NGOs."
  - Step 3: "Pickup & Delivery" / "Volunteers collect and deliver food safely."
  - Step 4: "Make Impact" / "Your food reaches people who need it most."
  - Counters: "Meals Saved", "People Fed", "CO₂ Reduced (kg)"
- App.tsx: Add all missing translation keys to all 3 language maps
- Navbar: Ensure guest/unauthenticated nav shows Dashboard (/), Donate Food (/donate-food), Impact (/impact) links
- Overall design remains dark-themed, glassmorphism, green→orange gradient

### Remove
- Nothing removed

## Implementation Plan
1. Update translations in App.tsx with all missing keys (home.hero.*, home.how.*, home.counters.*)
2. Update Home.tsx to use the translation keys (which now resolve to real text) — remove raw placeholder fallback behavior
3. Ensure guest nav links include Dashboard, Donate Food, Impact

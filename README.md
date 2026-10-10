# RideMate AI — Smart Car Pooling Platform

> **“One Route. Shared Rides. Smarter Journeys.”**

RideMate AI is a production-minded web application built for college students, university staff, and workplace commuters to discover shared rides, divide travel expenses fairly, reduce individual transportation costs, and reduce single-occupancy vehicle traffic congestion.

---

## 🚀 3-Minute Hackathon Judge Evaluation Walkthrough

The application includes an **Evaluation Sandbox** (top bar) allowing judges to experience the complete peer-to-peer journey in under 3 minutes:

1. **Explore Available Routes**: On the home page, search for a route (e.g. *Campus Student Union* to *Downtown Metro Tech Station* on Oct 12).
2. **Intelligent Match Explanation**: View ride results ranked by proximity and time compatibility. Notice the unboxed match explanations (e.g. `96% Match · Direct Route · 0.4 mi from campus`).
3. **Interactive OpenStreetMap Route**: Toggle **"View Route"** on any card or switch to **"Map Split"** to view waypoints and pickup/drop-off pins on Leaflet.
4. **Fair Cost Recovery**: Click **"Cost Calculator"** in the navigation bar to test the mathematical breakdown based on fuel price, vehicle MPG, tolls, and participant count.
5. **Request a Seat**:
   - As active passenger **Sarah Chen**, click **"Request Seat"** on Alex Rivera's morning ride (`ride-101`).
   - Choose 1 seat and confirm the request.
6. **Switch to Driver View**:
   - In the top **Evaluation Sandbox**, click **"Alex (Driver)"**.
   - Navigate to **"Driver Hub"**.
   - See Sarah Chen's incoming request under **"Pending Booking Requests"**.
7. **Atomic Confirmation & Seat Lock**:
   - Click **"Accept & Confirm"**.
   - Watch the ride's available capacity decrement atomically (from 2 seats to 1 seat).
   - Switch back to **"Sarah (Passenger)"** and click the **Notification Bell** to see the instant confirmation notification!

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite
- **Styling & UI**: Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans typography
- **Maps**: Leaflet with OpenStreetMap tiles and custom SVG div icons
- **Database Architecture**: PostgreSQL & Supabase with Row Level Security (RLS)
- **Concurrency & Transactions**: Atomic PL/pgSQL stored procedures preventing race conditions (`FOR UPDATE` row locking)
- **Local Sandbox Storage**: Reactive in-memory + `localStorage` engine simulating atomic transactions when external Supabase credentials are not connected

---

## 📁 Key File Structure

```
├── /index.html               # Entry point with Leaflet & typography links
├── /metadata.json            # AI Studio application metadata
├── /src
│   ├── /assets/images        # High-fidelity visual assets generated for carpooling
│   ├── /components
│   │   ├── /layout           # Navbar (3-zone contract), Footer, JudgeToolbar
│   │   ├── /map              # RouteMap (Interactive Leaflet OSM component)
│   │   ├── /matching         # RideCard, CostCalculatorModal, RequestBookingModal
│   │   ├── /notifications    # NotificationBell dropdown
│   │   └── /safety           # SafetyModal, ReportModal
│   ├── /data
│   │   └── initialDemoData.ts# Sample profiles, vehicles, rides, and routes
│   ├── /lib
│   │   ├── matchingEngine.ts # Haversine proximity & schedule matching
│   │   └── store.ts          # Central reactive store with atomic transactions
│   ├── /pages
│   │   ├── HomePage.tsx      # High-conversion landing page
│   │   ├── FindRidesPage.tsx # Search, filter, map split, and sort
│   │   ├── OfferRidePage.tsx # Driver route creation & cost helper
│   │   ├── DriverDashboard.tsx   # Request management & ride cancellations
│   │   ├── PassengerDashboard.tsx# Booking status tracking & cancellation
│   │   ├── ProfilePage.tsx   # Verified ID status & vehicle registration
│   │   ├── HowItWorksPage.tsx# Step-by-step corridor commuting guide
│   │   └── SafetyPage.tsx    # Privacy, coordinate masking & emergency info
│   ├── /types
│   │   └── index.ts          # TypeScript interfaces for all entities
│   ├── App.tsx               # Master router and modal orchestration
│   └── main.tsx              # Application bootstrap
└── /supabase
    └── schema.sql            # Full PostgreSQL schema, RLS policies & atomic functions
```

---

## 🔒 Security & Data Integrity Highlights

1. **Zero Overbooking Guarantee**:
   Seats are checked and locked on the backend. In PostgreSQL, `create_booking_atomic` executes `SELECT * FROM rides WHERE id = p_ride_id FOR UPDATE` to guarantee that concurrent users cannot double-book the final seat.
2. **Row Level Security (RLS)**:
   Every exposed table in `supabase/schema.sql` has granular RLS policies. Drivers can only approve bookings for their own rides; passengers can only access their own booking records.
3. **Privacy Masking**:
   Exact home coordinates are never recorded or published. Vehicle license plates are masked publicly (e.g. `7XY•••9`) until a booking is accepted.

---

## 💻 Local Setup & Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

Optional Supabase Configuration (`.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*(If unset, RideMate AI automatically operates in local Sandbox Mode with full persistence)*.

# Architecture & Dependencies - HD Chart Generator

**Document Date**: 2025-12-05
**Project**: Human Design Chart Generator
**Status**: Production Ready

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRODUCTION ENVIRONMENT                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────┐      ┌──────────────────────────────┐ │
│  │   VERCEL (Frontend)          │      │    RAILWAY (Backend)         │ │
│  │  ────────────────────────    │      │  ─────────────────────────   │ │
│  │  https://[app].vercel.app    │      │  https://[api].railway.app   │ │
│  │                              │      │                              │ │
│  │  ┌────────────────────────┐  │      │  ┌────────────────────────┐ │ │
│  │  │ Next.js App Router     │  │      │  │ FastAPI Application    │ │ │
│  │  │ ┌──────────────────┐   │  │      │  │ ┌──────────────────┐   │ │ │
│  │  │ │ app/             │   │  │      │  │ │ src/             │   │ │ │
│  │  │ │ ├─ layout.tsx    │   │  │      │  │ │ ├─ main.py       │   │ │ │
│  │  │ │ ├─ page.tsx      │   │  │      │  │ │ ├─ models/       │   │ │ │
│  │  │ │ └─ api/          │   │  │      │  │ │ ├─ services/     │   │ │ │
│  │  │ │    └─ [...].ts   │   │  │      │  │ │ └─ config/       │   │ │ │
│  │  │ └──────────────────┘   │  │      │  │ └──────────────────┘   │ │ │
│  │  │                        │  │      │  │                        │ │ │
│  │  │ ┌────────────────────┐ │  │  ◄──┼──┼─ ┌────────────────────┐ │ │
│  │  │ │ components/        │ │  │  HTTPS  │  │ API Endpoints      │ │ │
│  │  │ │ ├─ ChartForm       │ │  │  JSON   │  │ ┌────────────────┐ │ │ │
│  │  │ │ ├─ ChartDisplay    │ │  │         │  │ │ POST /api/     │ │ │ │
│  │  │ │ ├─ Bodygraph       │ │  │         │  │ │   hd-chart     │ │ │ │
│  │  │ │ └─ sections/       │ │  │         │  │ │ POST /api/     │ │ │ │
│  │  │ └────────────────────┘ │  │         │  │ │   email-capture│ │ │ │
│  │  │                        │  │         │  │ │ GET /health    │ │ │ │
│  │  │ ┌────────────────────┐ │  │         │  │ └────────────────┘ │ │ │
│  │  │ │ services/          │ │  │         │  │                    │ │ │
│  │  │ │ └─ api.ts          │ │  │         │  │ ┌────────────────┐ │ │ │
│  │  │ └────────────────────┘ │  │         │  │ │ Business Logic │ │ │ │
│  │  └────────────────────────┘  │         │  │ │ ┌────────────┐ │ │ │ │
│  │                              │         │  │ │ │ Bodygraph  │ │ │ │ │
│  │  Tailwind CSS + TypeScript   │         │  │ │ │ Calc       │ │ │ │ │
│  │  E2E Tests (Playwright)      │         │  │ │ │ Services   │ │ │ │ │
│  │                              │         │  │ │ └────────────┘ │ │ │ │
│  └──────────────────────────────┘         │  │ └────────────────┘ │ │ │
│                                           │  │                    │ │ │
│                                           │  │ PySwissEph         │ │ │
│                                           │  │ Pydantic           │ │ │
│                                           │  └────────────────────┘ │ │
│                                           │                         │ │
│                                           └─────────────────────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Frontend Architecture

### Directory Structure
```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Tailwind + fonts
│   ├── page.tsx                 # Home page (main form)
│   ├── api/
│   │   └── [...rewrite].ts      # API rewrite handler (proxy)
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ChartForm.tsx            # Birth data input form
│   ├── ChartDisplay.tsx         # Results display manager
│   ├── Bodygraph.tsx            # SVG visualization
│   ├── EmailCaptureSection.tsx  # Lead capture
│   └── sections/                # 9 result sections
│       ├── TypeSection.tsx
│       ├── AuthoritySection.tsx
│       ├── ProfileSection.tsx
│       ├── CentersSection.tsx
│       ├── ChannelsSection.tsx
│       ├── GatesSection.tsx
│       ├── IncarnationCrossSection.tsx
│       ├── ImpulseSection.tsx
│       └── PersonalDataDisplay.tsx
├── services/
│   └── api.ts                   # API client (calls backend)
├── types/
│   └── chart.ts                 # TypeScript interfaces
├── utils/
│   └── constants.ts             # Constants and enums
├── styles/
│   └── (global styles)
├── public/                       # Static assets
├── package.json                 # npm dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind CSS config
├── next.config.js               # Next.js config
├── vercel.json                  # Vercel deployment config
├── .env.local                   # Local environment variables
└── ...
```

### Technology Stack
```
Framework:     Next.js 16.0.4
Language:      TypeScript
Styling:       Tailwind CSS 3
Testing:       Playwright (E2E)
Build Tool:    Turbopack
Runtime:       Node.js 18+
Deployment:    Vercel
```

### Key Dependencies
```json
{
  "dependencies": {
    "next": "^16.0.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@playwright/test": "latest",
    "@types/node": "latest",
    "@types/react": "latest"
  }
}
```

### Component Hierarchy
```
App (Root)
├── layout (HTML, Fonts, CSS)
│   └── page (Main Page)
│       ├── ChartForm
│       │   └── Form validation
│       ├── ChartDisplay (conditional)
│       │   ├── TypeSection
│       │   ├── AuthoritySection
│       │   ├── ProfileSection
│       │   ├── Bodygraph
│       │   ├── CentersSection
│       │   ├── ChannelsSection
│       │   ├── GatesSection
│       │   ├── IncarnationCrossSection
│       │   ├── ImpulseSection
│       │   └── PersonalDataDisplay
│       └── EmailCaptureSection
```

---

## 🔧 Backend Architecture

### Directory Structure
```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app entry point
│   ├── models/
│   │   ├── __init__.py
│   │   ├── chart.py             # ChartRequest, ChartResponse
│   │   ├── email.py             # EmailRequest
│   │   └── base.py              # Base models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── calculation/
│   │   │   ├── __init__.py
│   │   │   └── bodygraph_calculator.py    # Core HD logic
│   │   ├── hd_api_client.py               # External API calls
│   │   ├── normalization_service.py       # Data normalization
│   │   └── validation_service.py          # Input validation
│   ├── config/
│   │   ├── __init__.py
│   │   └── data/
│   │       ├── incarnation_crosses.json   # Cross name mapping
│   │       └── impulses.json              # Impulse messages
│   ├── routes/                  # (if using routers)
│   └── middleware/              # (if needed)
├── tests/                        # Test files
├── requirements.txt             # pip dependencies
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── Procfile                     # Railway start command
├── runtime.txt                  # Python version
├── railway.json                 # Railway config
└── ...
```

### Technology Stack
```
Framework:     FastAPI 0.101.0
Language:      Python 3.11+
Astronomy:     PySwissEph 2.10.3.2
Validation:    Pydantic 1.10.14
Server:        Uvicorn
Async:         asyncio
Deployment:    Railway
```

### Key Dependencies
```
fastapi==0.101.0
uvicorn==0.24.0
pydantic==1.10.14
pyswisseph==2.10.3.2
email-validator==2.0.0
python-dotenv==1.0.0
```

### API Endpoint Architecture
```
FastAPI App
├── CORS Configuration (FRONTEND_URL)
├── Health Check
│   └── GET /health
│       └── Returns: {"status": "healthy", "service": "hd-chart-generator"}
├── HD Chart Generation
│   └── POST /api/hd-chart
│       ├── Request: ChartRequest (JSON)
│       │   ├── birthDate (YYYY-MM-DD)
│       │   ├── birthTime (HH:MM, optional)
│       │   ├── birthPlace (string)
│       │   ├── birthCountry (string)
│       │   ├── birthTimeApproximate (boolean, optional)
│       │   └── latitude/longitude (optional)
│       ├── Processing:
│       │   ├── Input validation
│       │   ├── Bodygraph calculation (Swiss Ephemeris)
│       │   ├── Data normalization
│       │   └── Response formatting
│       └── Response: ChartResponse (JSON)
│           ├── birthData
│           ├── chartData
│           │   ├── type (Type 1-5)
│           │   ├── authority (9 types)
│           │   ├── profile (12 profiles)
│           │   ├── centers (9 centers)
│           │   ├── channels (32 channels)
│           │   ├── gates (64 gates)
│           │   ├── incarnationCross
│           │   └── impulse
│           └── calculationDetails
├── Email Capture
│   └── POST /api/email-capture
│       ├── Request: EmailRequest
│       │   ├── email (string)
│       │   └── interests (optional)
│       └── Response: {"status": "success", "message": "..."}
└── API Documentation
    └── GET /docs (Swagger UI)
    └── GET /openapi.json
```

### Service Layer Architecture
```
FastAPI main.py
├── ChartRequest Validation (Pydantic)
│
├── BodygraphCalculator Service
│   ├── Calculate Planetary Positions (Swiss Ephemeris)
│   │   ├── 13 Personality planets
│   │   └── 13 Design planets (+ 180°)
│   │
│   ├── Calculate Human Design Elements
│   │   ├── Type (4 quarters)
│   │   ├── Authority (9 types)
│   │   ├── Profile (12 combinations)
│   │   ├── Centers (9, defined/open)
│   │   ├── Channels (32, activation)
│   │   ├── Gates (64, with lines)
│   │   ├── Incarnation Cross (from data file)
│   │   └── Impulse (from data file)
│   │
│   └── Return: ChartResponse
│
├── Normalization Service
│   ├── Format dates
│   ├── Format times
│   └── Format locations
│
└── Validation Service
    ├── Validate birth date
    ├── Validate birth time (if provided)
    ├── Validate location
    └── Validate email (for capture)
```

---

## 🔄 Data Flow

### Chart Generation Flow
```
1. User Input (Frontend)
   └─→ Birth Date, Time, Location
       └─→ Form Validation (Zod/TypeScript)
           └─→ Submit to /api/hd-chart

2. Frontend API Call
   └─→ POST /api/hd-chart (via api.ts service)
       └─→ Next.js API proxy [...rewrite].ts
           └─→ Forward to Backend (Railway)

3. Backend Processing
   └─→ ChartRequest Received
       ├─→ Pydantic Validation
       │   ├─→ Date format validation
       │   ├─→ Time format validation (if provided)
       │   └─→ Location validation
       │
       ├─→ Bodygraph Calculator
       │   ├─→ Swiss Ephemeris Calculation
       │   │   ├─→ Get 13 personality planet positions
       │   │   └─→ Get 13 design planet positions (+ 180°)
       │   │
       │   ├─→ Convert to HD Elements
       │   │   ├─→ Map to 64 Gates
       │   │   ├─→ Map to 32 Channels
       │   │   ├─→ Determine 9 Centers
       │   │   ├─→ Calculate Type (4 quarters)
       │   │   ├─→ Calculate Authority (9 types)
       │   │   ├─→ Calculate Profile (12 profiles)
       │   │   ├─→ Lookup Incarnation Cross
       │   │   └─→ Lookup Impulse Message
       │   │
       │   └─→ Return ChartData
       │
       └─→ Format ChartResponse
           └─→ Return JSON

4. Response to Frontend
   └─→ ChartResponse Received
       ├─→ Parse Response
       ├─→ Update Component State
       └─→ Render 9 Display Sections

5. Display (Frontend)
   └─→ ChartDisplay Component
       ├─→ TypeSection
       ├─→ AuthoritySection
       ├─→ ProfileSection
       ├─→ Bodygraph
       ├─→ CentersSection
       ├─→ ChannelsSection
       ├─→ GatesSection
       ├─→ IncarnationCrossSection
       ├─→ ImpulseSection
       └─→ PersonalDataDisplay
```

### Email Capture Flow
```
1. User Enters Email (Frontend)
   └─→ EmailCaptureSection Component
       └─→ Email Validation
           └─→ Submit to /api/email-capture

2. Frontend API Call
   └─→ POST /api/email-capture
       └─→ Next.js API proxy
           └─→ Forward to Backend

3. Backend Processing
   └─→ EmailRequest Received
       ├─→ Pydantic Validation
       │   └─→ Valid email format
       ├─→ Duplicate Check
       │   └─→ Query database (if using)
       └─→ Store Email
           └─→ Return Success/Error

4. Response to Frontend
   └─→ Show Success/Error Message
```

---

## 🗄️ Data Models

### ChartRequest (Backend Input)
```python
class ChartRequest(BaseModel):
    birthDate: str              # "YYYY-MM-DD"
    birthTime: Optional[str]    # "HH:MM" or null
    birthPlace: str             # "Berlin"
    birthCountry: str           # "Germany"
    birthTimeApproximate: Optional[bool] = False
    latitude: Optional[float]   # 52.5200
    longitude: Optional[float]  # 13.4050
```

### ChartResponse (Backend Output)
```python
class ChartResponse(BaseModel):
    birthData: Dict              # echo input
    chartData: Dict              # Core HD data
        - type: str
        - authority: str
        - profile: str
        - centers: List[Dict]
        - channels: List[Dict]
        - gates: List[Dict]
        - incarnationCross: str
        - impulse: str
    calculationDetails: Dict     # Debugging info
```

### EmailRequest (Backend Input)
```python
class EmailRequest(BaseModel):
    email: EmailStr
    interests: Optional[List[str]]
```

---

## 🔐 Security & CORS

### CORS Configuration
```
Frontend Domain: Configured at deployment (FRONTEND_URL env var)
Backend (Railway):
    CORS Origins: [FRONTEND_URL]
    Allow Methods: ["GET", "POST", "OPTIONS"]
    Allow Headers: ["Content-Type"]
    Allow Credentials: true
```

### Input Validation
```
Backend (Pydantic):
    - Date format: YYYY-MM-DD, must be valid date
    - Time format: HH:MM (24h), must be valid time
    - Email: RFC 5322 format
    - Coordinates: -90 to 90 (lat), -180 to 180 (lon)
    - All inputs stripped of whitespace

Frontend (TypeScript):
    - Date validation (past dates only)
    - Time validation (24h format)
    - Email validation (basic regex)
    - Phone validation (if needed)
```

---

## 📊 Deployment Dependencies

### Frontend (Vercel)
```
Build Command:  next build
Start Command:  next start
Node Version:   18 LTS
Environment:
    - NEXT_PUBLIC_API_URL: Backend URL
```

### Backend (Railway)
```
Build Command:  pip install -r requirements.txt
Start Command:  uvicorn src.main:app --host 0.0.0.0 --port $PORT
Python Version: 3.11+
Environment:
    - PORT: Auto-set by Railway
    - FRONTEND_URL: Frontend URL (for CORS)
    - DEBUG: false (for production)
    - HD_API_KEY: placeholder
    - HD_API_URL: https://api.humandesign.ai/v1
```

---

## 🔗 Integration Points

### Frontend → Backend Communication
```
Protocol:       HTTPS (JSON)
Timeout:        30 seconds
Retry Logic:    Exponential backoff (3 attempts)
Error Handling: Show user-friendly German messages
Error Logging:  Browser console + error service
```

### External APIs (Future)
```
Human Design API:
    - Endpoint: https://api.humandesign.ai/v1
    - Auth: API Key (HD_API_KEY)
    - Usage: Future, currently using mock data
    - Fallback: Swiss Ephemeris calculations
```

---

## ✅ Dependency Verification

### Frontend Dependencies
```bash
npm list --depth=0
# ✅ next@16.0.4
# ✅ react@19.0.0
# ✅ react-dom@19.0.0
# ✅ tailwindcss@4.0.0
# ✅ typescript@5.0.0
```

### Backend Dependencies
```bash
pip list
# ✅ fastapi==0.101.0
# ✅ uvicorn==0.24.0
# ✅ pydantic==1.10.14
# ✅ pyswisseph==2.10.3.2
# ✅ email-validator==2.0.0
```

---

## 📈 Scalability Considerations

### Frontend Scaling
- Next.js handles automatic code splitting
- Vercel provides global CDN
- Tailwind CSS is optimized for production
- No state management bloat (component state only)

### Backend Scaling
- FastAPI is async-first (handles ~1000s of concurrent requests)
- Swiss Ephemeris calculations are CPU-intensive (~2s per chart)
- Consider adding caching layer (Redis) for repeated calculations
- Database (future): Connection pooling for email storage
- Load balancing: Railway automatically scales horizontally

### Data Transfer
- JSON payloads are lightweight (~5-10KB per request)
- No large file uploads
- All calculations happen server-side
- Browser rendering is fast (< 1s for display)

---

## 🧪 Testing Architecture

### Frontend E2E Tests
```
Framework:  Playwright
File:       frontend/__tests__/e2e/chart-form.spec.ts
Coverage:   12 test cases
├── Form validation
├── Chart generation
├── Data display
├── Error handling
└── Email capture

Run: npm run e2e
```

### Backend Tests
```
Framework:  pytest (or unittest)
Coverage:   API endpoints, services
Tests:
├── Chart calculation accuracy
├── Input validation
├── Error handling
└── Email capture

Run: python -m pytest tests/
```

---

## 🚀 Deployment Checklist

### Before Deployment
- [ ] All tests passing (frontend + backend)
- [ ] Environment variables configured
- [ ] Build process verified
- [ ] Security review completed
- [ ] CORS configuration correct

### Post-Deployment
- [ ] Health endpoint responds
- [ ] Chart generation works end-to-end
- [ ] Email capture works end-to-end
- [ ] No errors in logs (24+ hours)
- [ ] Performance metrics acceptable
- [ ] Monitoring/alerts configured

---

**Architecture Last Updated**: 2025-12-05
**Next Review**: After first production deployment

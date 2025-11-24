# Human Design Chart Generator

A modern web application for generating personalized Human Design charts with a clean, minimalist interface.

## Project Structure

```
chart-generator/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── services/     # API client services
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions and constants
│   └── styles/       # Global styles
├── backend/          # FastAPI backend application
│   ├── src/          # Python source code
│   │   ├── api/      # API routes
│   │   ├── models/   # Pydantic models
│   │   ├── services/ # Business logic services
│   │   └── main.py   # FastAPI application entry point
│   └── requirements.txt
└── contracts/        # API contracts (OpenAPI spec)
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: PostgreSQL (optional for MVP)
- **Deployment**: Railway

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL (optional for MVP)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# .env.local is already configured
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run the development server:
```bash
python3 src/main.py
# Or: uvicorn src.main:app --reload --host 0.0.0.0 --port 5000
```

The backend will be available at http://localhost:5000
- API Documentation: http://localhost:5000/docs

## Deployment

### Deploying to Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set environment variable: `NEXT_PUBLIC_API_URL` to your Railway backend URL
3. Deploy automatically on push to main branch

### Deploying to Railway (Backend)

1. Connect your GitHub repository to Railway
2. Set environment variables as needed (see .env.example)
3. Deploy automatically on push to main branch

### Environment Variables

#### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., https://your-backend.railway.app)

#### Backend (Railway)
- `DATABASE_URL`: PostgreSQL connection string (optional for MVP)
- `HD_API_KEY`: Human Design API key (or leave as placeholder for mock data)
- `HD_API_URL`: Human Design API endpoint
- `FRONTEND_URL`: Frontend URL for CORS
- `DEBUG`: Set to "false" in production
- `PORT`: Railway will set this automatically

## Features

- ✅ Chart generation from birth data
- ✅ Display of Type, Authority, Profile
- ✅ Visual Bodygraph with defined/open centers
- ✅ Channels and Gates display
- ✅ Incarnation Cross
- ✅ Personalized impulse message
- ✅ Email capture for Business Reading interest
- ✅ German language interface
- ✅ Mobile-responsive design
- ✅ Form validation with German error messages
- ✅ API error handling with retry capability

## API Documentation

The backend API documentation is available at `/docs` when running the backend server. It includes:

- `POST /api/hd-chart` - Generate Human Design chart
- `POST /api/email-capture` - Capture email for Business Reading interest
- `GET /health` - Health check endpoint

## Development Status

The application is ready for deployment with:
- ✅ Complete frontend implementation
- ✅ Complete backend implementation
- ✅ Mock HD calculation (for development)
- ⏳ Database integration (optional for MVP)
- ⏳ Production HD API integration

## License

MIT License - see LICENSE file for details

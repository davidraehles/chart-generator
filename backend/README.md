# Human Design Chart Generator - Backend

FastAPI backend for the Human Design Chart Generator.

## Setup

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start the development server:
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 5000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

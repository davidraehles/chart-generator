# Use Python 3.11 base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire application
COPY . .

# Copy ephemeris data files to the container
COPY data/ephemeris/ /app/data/ephemeris/

# Set default port (Railway will override with $PORT)
ENV PORT=8000

# Expose port (documentation only - actual binding done by CMD)
EXPOSE 8000

# Run the FastAPI application with uvicorn
# Use shell form to allow environment variable expansion
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

# Dockerfile for FPT TFA FastAPI Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install --no-cache-dir uv

# Copy dependency definition
COPY pyproject.toml uv.lock ./

# Install project dependencies
RUN uv sync --all-extras --no-cache

# Copy project source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run Uvicorn production server
CMD ["uv", "run", "uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "8000"]

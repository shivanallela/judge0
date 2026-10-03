FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Railway automatically supplies $PORT, fallback to 8080
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "gunicorn -b 0.0.0.0:${PORT:-8080} --workers 2 --timeout 120 \"app:app\""]

# Fast-Whisper Service Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Create models directory
RUN mkdir -p /app/models

# Expose port
EXPOSE 8000

# Environment variables
ENV WHISPER_MODEL_SIZE=medium
ENV WHISPER_DEVICE=cpu
ENV WHISPER_COMPUTE_TYPE=int8
ENV PORT=8000
ENV HOST=0.0.0.0

# Run the application
CMD ["python", "main.py"]

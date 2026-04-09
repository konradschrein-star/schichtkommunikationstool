# Fast-Whisper Transcription Service

FastAPI service for audio transcription using faster-whisper, optimized for construction site audio (Polish/German, noisy environments).

## Features

- Multi-language support (German, Polish, auto-detect)
- Voice Activity Detection (VAD) to filter out construction noise
- GPU acceleration support (CUDA)
- Optimized for construction jargon and mixed languages

## Installation

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

### Docker

```bash
# Build image
docker build -t whisper-service .

# Run container (CPU)
docker run -p 8000:8000 whisper-service

# Run container (GPU)
docker run --gpus all -p 8000:8000 \
  -e WHISPER_DEVICE=cuda \
  -e WHISPER_COMPUTE_TYPE=float16 \
  whisper-service
```

## Configuration

Environment variables:

- `WHISPER_MODEL_SIZE`: Model size (tiny, base, small, medium, large) - default: medium
- `WHISPER_DEVICE`: Device (cpu, cuda) - default: cpu
- `WHISPER_COMPUTE_TYPE`: Compute type (int8, float16, float32) - default: int8
- `PORT`: Service port - default: 8000
- `HOST`: Service host - default: 0.0.0.0

## API Endpoints

### POST /v2/transcribe

Transcribe audio file.

**Request:**
- `file`: Audio file (multipart/form-data)
- `language`: Language code ('auto', 'de', 'pl') - optional, default: 'auto'
- `vad_filter`: Enable VAD ('true', 'false') - optional, default: 'true'

**Response:**
```json
{
  "transcript": "Transcribed text...",
  "language": "de",
  "duration": 45.2,
  "language_probability": 0.98
}
```

### GET /health

Health check endpoint.

### GET /info

Get service information (model, device, version).

## Performance Tips

### CPU Usage
- Use `medium` model for best balance of speed/quality
- Set `WHISPER_COMPUTE_TYPE=int8` for faster inference
- Enable VAD to reduce processing time

### GPU Usage
- Use `large` model for maximum accuracy
- Set `WHISPER_DEVICE=cuda` and `WHISPER_COMPUTE_TYPE=float16`
- Requires NVIDIA GPU with CUDA support

## Testing

```bash
# Test with curl
curl -X POST http://localhost:8000/v2/transcribe \
  -F "file=@test-audio.webm" \
  -F "language=de" \
  -F "vad_filter=true"
```

"""
Fast-Whisper Transcription Service
FastAPI service for audio transcription using faster-whisper
Optimized for construction site audio (Polish/German, noisy environments)
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import uvicorn
import tempfile
import os
from typing import Optional
import logging

# ============================================================================
# CONFIGURATION
# ============================================================================

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model configuration
MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "medium")  # tiny, base, small, medium, large
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")  # cpu or cuda
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")  # int8, float16, float32

# For GPU: use "cuda" and "float16"
# For CPU: use "cpu" and "int8"

logger.info(f"Initializing Whisper model: {MODEL_SIZE} on {DEVICE} with {COMPUTE_TYPE}")

# ============================================================================
# APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="Fast-Whisper Transcription Service",
    description="Audio transcription service for construction site documentation",
    version="1.0.0"
)

# CORS configuration (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# MODEL LOADING
# ============================================================================

# Load model once at startup
model = None

@app.on_event("startup")
async def startup_event():
    """Load Whisper model on startup"""
    global model
    try:
        model = WhisperModel(
            MODEL_SIZE,
            device=DEVICE,
            compute_type=COMPUTE_TYPE,
            download_root="./models"  # Cache models locally
        )
        logger.info(f"Whisper model loaded successfully: {MODEL_SIZE}")
    except Exception as e:
        logger.error(f"Failed to load Whisper model: {e}")
        raise

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model": MODEL_SIZE,
        "device": DEVICE,
        "compute_type": COMPUTE_TYPE
    }

@app.get("/info")
async def get_info():
    """Get service information"""
    return {
        "model": MODEL_SIZE,
        "device": DEVICE,
        "compute_type": COMPUTE_TYPE,
        "version": "1.0.0"
    }

@app.post("/v2/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form("auto"),
    vad_filter: str = Form("true")
):
    """
    Transcribe audio file

    Args:
        file: Audio file (webm, mp4, wav, mp3, etc.)
        language: Language code ('auto', 'de', 'pl', etc.)
        vad_filter: Enable Voice Activity Detection (true/false)

    Returns:
        JSON with transcript, detected language, and duration
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Validate language
    valid_languages = ['auto', 'de', 'pl', 'en', 'fr', 'es', 'it', 'pt', 'ru', 'zh']
    if language not in valid_languages:
        language = 'auto'

    # Parse VAD filter
    enable_vad = vad_filter.lower() == "true"

    # Create temporary file
    temp_file = None
    try:
        # Read uploaded file
        audio_bytes = await file.read()

        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name

        logger.info(f"Transcribing file: {file.filename}, language: {language}, VAD: {enable_vad}")

        # Transcribe with VAD parameters optimized for construction sites
        vad_parameters = {
            "min_silence_duration_ms": 500,  # Minimum silence duration
            "speech_pad_ms": 400,            # Padding around speech segments
        } if enable_vad else None

        segments, info = model.transcribe(
            temp_file_path,
            language=None if language == "auto" else language,
            vad_filter=enable_vad,
            vad_parameters=vad_parameters,
            # Additional parameters for better quality
            beam_size=5,
            best_of=5,
            temperature=0.0,
            compression_ratio_threshold=2.4,
            log_prob_threshold=-1.0,
            no_speech_threshold=0.6,
        )

        # Extract transcript from segments
        transcript_text = " ".join([segment.text for segment in segments])

        # Clean up transcript (remove extra whitespace)
        transcript_text = " ".join(transcript_text.split())

        logger.info(f"Transcription completed: {len(transcript_text)} chars, language: {info.language}")

        return {
            "transcript": transcript_text,
            "language": info.language,
            "duration": info.duration,
            "language_probability": info.language_probability,
        }

    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    finally:
        # Clean up temporary file
        if temp_file is not None:
            try:
                os.unlink(temp_file_path)
            except:
                pass

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )

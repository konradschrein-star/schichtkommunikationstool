'use client';

import { useState, useRef, useEffect } from 'react';
import { submitWorkerReport } from '@/app/actions/worker-report';
import Link from 'next/link';

type RecordingState = 'idle' | 'recording' | 'uploading' | 'processing' | 'needs-input' | 'success' | 'error';

interface RecordingClientProps {
  workerId: string;
  workerName: string;
  shiftId: string;
  profession?: string;
}

export default function RecordingClient({ workerId, workerName, shiftId, profession }: RecordingClientProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Waveform
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cleanupAudio();
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupAudio = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  };

  const startWaveform = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        const canvas = canvasRef.current;
        const a = analyserRef.current;
        if (!canvas || !a) return;
        const c = canvas.getContext('2d');
        if (!c) return;
        a.getByteFrequencyData(data);
        const w = canvas.width;
        const h = canvas.height;
        c.clearRect(0, 0, w, h);
        const bars = 32;
        const step = Math.floor(data.length / bars);
        const barW = w / bars;
        for (let i = 0; i < bars; i++) {
          const v = data[i * step] / 255;
          const barH = Math.max(4, v * h);
          c.fillStyle = '#00D26A';
          c.fillRect(i * barW + 2, (h - barH) / 2, barW - 4, barH);
        }
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch {
      // Waveform is decorative — ignore failures, recording continues.
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        cleanupAudio();
        uploadAndProcess(blob);
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setState('recording');
      setRecordingTime(0);
      startWaveform(stream);

      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch (error) {
      console.error('Microphone access error:', error);
      setErrorMessage('Mikrofon-Zugriff verweigert. Bitte Berechtigungen prüfen.');
      setState('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState('uploading');
    }
  };

  const uploadAndProcess = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob);
      formData.append('workerId', workerId);
      photos.forEach((p) => formData.append('images', p));

      const uploadResponse = await fetch('/api/upload/audio', { method: 'POST', body: formData });
      if (!uploadResponse.ok) throw new Error('Upload fehlgeschlagen');
      const uploadData = await uploadResponse.json();
      if (!uploadData.success || !uploadData.audioPath) {
        throw new Error(uploadData.error || 'Upload fehlgeschlagen');
      }

      setState('processing');

      const result = await submitWorkerReport({
        audioPath: uploadData.audioPath,
        imagePaths: uploadData.imagePaths,
        workerId,
        shiftId,
        workerName,
        profession,
      });

      if (result.success) {
        setState('success');
        setPhotos([]);
        setTimeout(() => {
          setState('idle');
          setRecordingTime(0);
        }, 3500);
      } else if ('needsInput' in result && result.needsInput) {
        setSuggestedQuestions(result.suggestedQuestions);
        setState('needs-input');
      } else if ('error' in result) {
        setErrorMessage(result.error);
        setState('error');
      } else {
        setErrorMessage('Ein unbekannter Fehler ist aufgetreten');
        setState('error');
      }
    } catch (error) {
      console.error('Upload/Processing error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
      setState('error');
    }
  };

  const handleRetry = () => {
    setState('idle');
    setErrorMessage('');
    setSuggestedQuestions([]);
    setRecordingTime(0);
  };

  const onPickPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotos((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="text-sm font-semibold text-gray-400 hover:text-gray-700">
            ← Konto
          </Link>
          <div className="text-right">
            <div className="text-2xl font-bold text-black leading-tight">{workerName}</div>
            <div className="text-gray-500">{profession || 'Bauarbeiter'}</div>
          </div>
        </div>

        {state === 'idle' && (
          <div className="space-y-5">
            <button
              onClick={startRecording}
              className="w-full h-40 bg-[#00D26A] hover:bg-[#00BD5F] active:scale-95 transition-all rounded-3xl shadow-2xl flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-6xl mb-2">🎙️</div>
                <div className="text-white text-2xl font-bold">Aufnahme starten</div>
                <div className="text-white/80 text-sm mt-1">Tippen zum Sprechen (DE / PL)</div>
              </div>
            </button>

            <label className="w-full h-20 bg-white border-2 border-gray-200 hover:border-gray-400 active:scale-95 transition-all rounded-2xl shadow flex items-center justify-center gap-3 cursor-pointer">
              <span className="text-3xl">📷</span>
              <span className="text-lg font-bold text-gray-800">
                {photos.length > 0 ? `${photos.length} Foto(s) angehängt` : 'Foto / Datei anhängen'}
              </span>
              <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={onPickPhotos} />
            </label>

            {photos.length > 0 && (
              <button onClick={() => setPhotos([])} className="w-full text-sm text-gray-400 hover:text-red-600">
                Fotos entfernen
              </button>
            )}

            <p className="text-center text-gray-500 text-sm pt-2">
              Erzähl einfach, was in deiner Schicht passiert ist.
            </p>
          </div>
        )}

        {state === 'recording' && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="w-28 h-28 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <canvas ref={canvasRef} width={360} height={80} className="w-full h-20" />

            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-black mb-1">{formatTime(recordingTime)}</div>
              <div className="text-xl text-gray-600">Aufnahme läuft…</div>
            </div>

            <button
              onClick={stopRecording}
              className="w-full h-24 bg-black hover:bg-gray-800 active:scale-95 transition-all rounded-2xl shadow-xl flex items-center justify-center"
            >
              <div className="text-white text-2xl font-bold">Aufnahme beenden</div>
            </button>
          </div>
        )}

        {state === 'uploading' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
            <div className="text-2xl font-bold text-black">Wird hochgeladen…</div>
            <div className="text-gray-600">Bitte warten</div>
          </div>
        )}

        {state === 'processing' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-100 rounded-full" />
                <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0" />
              </div>
            </div>
            <div className="text-2xl font-bold text-black">KI analysiert deinen Bericht…</div>
            <div className="text-gray-600 max-w-sm mx-auto">
              Transkription, Vollständigkeits-Check und professionelle Formatierung.
            </div>
          </div>
        )}

        {state === 'needs-input' && (
          <div className="space-y-8">
            <div className="bg-amber-50 border-4 border-amber-400 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚠️</div>
                <div className="text-2xl font-bold text-black mb-4">Wichtige Infos fehlen</div>
                <div className="text-gray-700 text-lg mb-6">Bitte beantworte noch folgende Fragen:</div>
              </div>
              <div className="space-y-4">
                {suggestedQuestions.map((question, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                    <div className="text-2xl font-bold text-black leading-tight">{question}</div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="w-full h-24 bg-[#00D26A] hover:bg-[#00BD5F] active:scale-95 transition-all rounded-2xl shadow-xl flex items-center justify-center"
            >
              <div className="text-white text-2xl font-bold">Ergänzung aufnehmen</div>
            </button>
          </div>
        )}

        {state === 'success' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-[#00D26A] rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-black">Erfolgreich gespeichert!</div>
            <div className="text-xl text-gray-600">Dein Bericht ist beim Schichtleiter angekommen.</div>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-6">
            <div className="bg-red-50 border-4 border-red-400 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-2xl font-bold text-black mb-4">Fehler</div>
              <div className="text-lg text-gray-700">{errorMessage}</div>
            </div>
            <button
              onClick={handleRetry}
              className="w-full h-20 bg-black hover:bg-gray-800 active:scale-95 transition-all rounded-2xl shadow-xl flex items-center justify-center"
            >
              <div className="text-white text-xl font-bold">Erneut versuchen</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

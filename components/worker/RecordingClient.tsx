'use client';

import { useState, useRef, useEffect } from 'react';
import { submitWorkerReport } from '@/app/actions/worker-report';

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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        uploadAndProcess(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setState('recording');
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

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

      const uploadResponse = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

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
        setTimeout(() => {
          setState('idle');
          setRecordingTime(0);
        }, 3000);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-black tracking-tight">
            {workerName}
          </h1>
          <p className="text-xl text-gray-600">{profession || 'Bauarbeiter'}</p>
        </div>

        {state === 'idle' && (
          <div className="space-y-6">
            <button
              onClick={startRecording}
              className="w-full h-32 bg-[#00D26A] hover:bg-[#00BD5F] active:scale-95 transition-all rounded-2xl shadow-2xl flex items-center justify-center group"
            >
              <div className="text-center">
                <div className="text-white text-2xl font-bold mb-1">Aufnahme starten</div>
                <div className="text-white/80 text-sm">Tippen zum Sprechen</div>
              </div>
            </button>
            <p className="text-center text-gray-500 text-sm">
              Berichte über deine Arbeit in dieser Schicht
            </p>
          </div>
        )}

        {state === 'recording' && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-black mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="text-xl text-gray-600">Aufnahme läuft...</div>
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
              <div className="w-20 h-20 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
            <div className="text-2xl font-bold text-black">Wird hochgeladen...</div>
            <div className="text-gray-600">Bitte warten</div>
          </div>
        )}

        {state === 'processing' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
                <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
            </div>
            <div className="text-2xl font-bold text-black">KI analysiert deinen Bericht...</div>
            <div className="text-gray-600 max-w-sm mx-auto">
              Wir prüfen die Vollständigkeit und formatieren den Text professionell
            </div>
          </div>
        )}

        {state === 'needs-input' && (
          <div className="space-y-8">
            <div className="bg-amber-50 border-4 border-amber-400 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚠️</div>
                <div className="text-2xl font-bold text-black mb-4">
                  Wichtige Infos fehlen
                </div>
                <div className="text-gray-700 text-lg mb-6">
                  Bitte beantworte noch folgende Fragen:
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {suggestedQuestions.map((question, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-md"
                  >
                    <div className="text-2xl font-bold text-black leading-tight">
                      {question}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleRetry}
              className="w-full h-24 bg-[#00D26A] hover:bg-[#00BD5F] active:scale-95 transition-all rounded-2xl shadow-xl flex items-center justify-center"
            >
              <div className="text-white text-2xl font-bold">Neue Aufnahme starten</div>
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
            <div className="text-xl text-gray-600">Dein Bericht wurde dokumentiert</div>
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

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

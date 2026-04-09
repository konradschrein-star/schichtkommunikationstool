'use client';

import { useState } from 'react';
import { Camera, FileUp, CheckCircle2, Clock } from 'lucide-react';
import { AudioRecorder } from '@/components/ui/AudioRecorder';

export default function WorkerView() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsUploading(true);
    setUploadStatus('Wird hochgeladen...');

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('workerId', 'worker-123');
      formData.append('shift', '2');

      // Upload
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error('Upload failed');
      }

      setUploadStatus('Transkribiere...');

      // Transcribe
      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: uploadData.audioUrl,
          language: 'pl',
        }),
      });
      const transcribeData = await transcribeRes.json();

      setUploadStatus('KI analysiert...');

      // Process
      const processRes = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcribeData.transcript,
          workerId: 'worker-123',
          workerName: 'Piotr Kowalski',
          role: 'Baggerfahrer',
          shift: 2,
          metadata: {
            audioUrl: uploadData.audioUrl,
          },
        }),
      });
      const processData = await processRes.json();

      setUploadStatus('Erfasst!');

      // Auto-dismiss after 2 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setIsUploading(false);
      }, 2000);

    } catch (error) {
      console.error('Workflow error:', error);
      setUploadStatus('Fehler - bitte erneut versuchen');
      setTimeout(() => {
        setUploadStatus(null);
        setIsUploading(false);
      }, 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-serif font-bold mb-1">Hallo Piotr,</h1>
        <p className="text-forest-600 dark:text-stone-400 text-sm">
          Schicht 2 • Baggerfahrer • Gleis 4
        </p>
      </header>

      {/* Status Card */}
      <div className="luxury-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-glow/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-lime-glow" />
          </div>
          <div>
            <p className="text-sm font-bold">Status: Aktiv</p>
            <p className="text-xs text-stone-400">Letztes Update: vor 12 Min</p>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-md border border-forest-200 dark:border-night-700 text-xs font-medium hover:bg-forest-50 dark:hover:bg-night-800 transition-colors">
          Pause melden
        </button>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className="luxury-card p-4 text-center">
          <p className="text-sm font-bold text-lime-glow">{uploadStatus}</p>
        </div>
      )}

      {/* Audio Recorder */}
      <AudioRecorder
        onRecordingComplete={handleRecordingComplete}
        workerId="worker-123"
        shift={2}
      />

      {/* Additional Actions */}
      <div className="flex gap-4 w-full">
        <button className="flex-1 py-4 rounded-xl bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700 flex items-center justify-center gap-2 hover:bg-forest-100 dark:hover:bg-night-700 transition-colors">
          <Camera className="w-5 h-5 text-forest-600 dark:text-stone-300" />
          <span className="text-sm font-bold">Foto</span>
        </button>
        <button className="flex-1 py-4 rounded-xl bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700 flex items-center justify-center gap-2 hover:bg-forest-100 dark:hover:bg-night-700 transition-colors">
          <FileUp className="w-5 h-5 text-forest-600 dark:text-stone-300" />
          <span className="text-sm font-bold">Datei</span>
        </button>
      </div>

      {/* Recent Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">
            Letzte Einträge
          </h2>
          <span className="text-xs text-lime-glow">Live</span>
        </div>

        <div className="luxury-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <span className="text-xs text-stone-400">10:42 Uhr</span>
            </div>
            <span className="micro-label bg-lime-glow/10 text-lime-glow">Erfasst</span>
          </div>
          <p className="text-sm">
            "Bagger 3 hat ein Problem mit der Hydraulik, verliert etwas Öl."
          </p>
        </div>
      </div>
    </div>
  );
}

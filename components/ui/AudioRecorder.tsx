'use client';

import { useState, useRef } from 'react';
import { Mic } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  workerId: string;
  shift: number;
}

export function AudioRecorder({ onRecordingComplete, workerId, shift }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Mikrofon-Zugriff verweigert');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="luxury-card p-6 flex flex-col items-center justify-center text-center space-y-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
          isRecording
            ? 'bg-red-500/20 border-red-500/50 animate-pulse'
            : 'bg-lime-glow/10 border-lime-glow/30 hover:bg-lime-glow/20'
        } relative group`}
      >
        <Mic className={`w-10 h-10 ${isRecording ? 'text-red-500' : 'text-lime-glow'}`} />
      </button>

      <div>
        <p className="font-bold text-lg mb-1">
          {isRecording ? 'Aufnahme läuft...' : 'Sprachnotiz aufnehmen'}
        </p>
        <p className="text-xs text-stone-400">
          {isRecording ? formatTime(recordingTime) : '"Wir brauchen mehr Schotter an Gleis 4..."'}
        </p>
      </div>
    </div>
  );
}

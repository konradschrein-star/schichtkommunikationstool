import RecordingClient from "@/components/worker/RecordingClient";
import { db } from "@/db";
import { shifts, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

interface WorkerPageProps {
  searchParams: Promise<{
    workerId?: string;
    workerName?: string;
    profession?: string;
  }>;
}

export default async function WorkerPage({ searchParams }: WorkerPageProps) {
  const params = await searchParams;
  const { workerId, workerName, profession } = params;

  if (!workerId || !workerName) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-black">Fehlende Daten</h1>
          <p className="text-xl text-gray-600">
            Bitte über das Dashboard einloggen
          </p>
          <div className="bg-gray-50 rounded-xl p-6 text-left">
            <p className="text-sm text-gray-600 mb-2">URL-Parameter erforderlich:</p>
            <ul className="text-sm text-gray-800 space-y-1 font-mono">
              <li>• workerId</li>
              <li>• workerName</li>
              <li>• profession (optional)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  let activeShift;
  try {
    activeShift = await db.query.shifts.findFirst({
      where: eq(shifts.status, "active"),
      orderBy: [desc(shifts.date)],
    });
  } catch (error) {
    console.error("Database error fetching active shift:", error);
  }

  if (!activeShift) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-3xl font-bold text-black">Keine aktive Schicht</h1>
          <p className="text-xl text-gray-600">
            Derzeit ist keine Schicht aktiv. Bitte wende dich an deinen Schichtleiter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <RecordingClient
      workerId={workerId}
      workerName={workerName}
      shiftId={activeShift.id}
      profession={profession}
    />
  );
}

export const metadata = {
  title: "Worker Report | Schichtkommunikationstool",
  description: "Bauarbeiter Sprachbericht-Aufnahme",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

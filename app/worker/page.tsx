import RecordingClient from "@/components/worker/RecordingClient";
import { getActiveShift } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";
import Link from "next/link";

interface WorkerPageProps {
  searchParams: Promise<{
    workerId?: string;
    workerName?: string;
    profession?: string;
  }>;
}

export default async function WorkerPage({ searchParams }: WorkerPageProps) {
  const params = await searchParams;
  let { workerId, workerName, profession } = params;

  // Fall back to the logged-in account when no explicit params are given.
  if (!workerId || !workerName) {
    const user = await getCurrentUser();
    if (user) {
      workerId = user.id;
      workerName = user.name;
      profession = profession ?? user.profession;
    }
  }

  if (!workerId || !workerName) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl mb-4">👷</div>
          <h1 className="text-3xl font-bold text-black">Nicht angemeldet</h1>
          <p className="text-xl text-gray-600">
            Bitte wähle zuerst dein Konto aus.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[#00D26A] hover:bg-[#00BD5F] text-white text-lg font-bold rounded-2xl shadow-lg transition-all"
          >
            Zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  let activeShift;
  try {
    activeShift = await getActiveShift();
  } catch (error) {
    console.error("Error fetching active shift:", error);
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

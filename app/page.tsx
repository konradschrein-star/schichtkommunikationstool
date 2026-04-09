import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-black mb-6">
          Schichtkommunikationstool
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Bauarbeiter Sprachbericht-System mit KI-Auswertung
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Worker Dashboard */}
          <Link
            href="/worker?workerId=demo&workerName=Demo%20Worker"
            className="p-8 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg transition-all hover:scale-105"
          >
            <div className="text-3xl mb-3">🎙️</div>
            <div className="text-xl font-bold">Worker</div>
            <div className="text-sm mt-2">Sprachbericht aufnehmen</div>
          </Link>

          {/* Shift Leader Dashboard */}
          <Link
            href="/shift-leader"
            className="p-8 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg transition-all hover:scale-105"
          >
            <div className="text-3xl mb-3">📋</div>
            <div className="text-xl font-bold">Schichtleiter</div>
            <div className="text-sm mt-2">Schichtübergabe</div>
          </Link>

          {/* Boss Dashboard */}
          <Link
            href="/boss/dashboard"
            className="p-8 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl shadow-lg transition-all hover:scale-105"
          >
            <div className="text-3xl mb-3">📊</div>
            <div className="text-xl font-bold">Boss Dashboard</div>
            <div className="text-sm mt-2">KPIs & Analytics</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

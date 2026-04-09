import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: 'Schichtkommunikationstool',
  description: 'Bauarbeiter Sprachbericht-System mit KI-Auswertung',
  icons: {
    icon: '/favicon.ico',
  },
};

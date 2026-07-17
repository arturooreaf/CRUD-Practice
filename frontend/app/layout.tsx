import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Health CRUD · Pacientes',
  description: 'Gestión de pacientes — práctica CRUD (Next.js + Express + TS)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}

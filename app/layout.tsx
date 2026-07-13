import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'LAAS | Live Audience Activation System',
  description: 'Integrated Human Development & Behavioral Intelligence Platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'var(--m3-background)', color: 'var(--m3-on-surface)' }}>
        <Navbar />
        {/* The 'children' prop represents whatever page the user is currently on */}
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
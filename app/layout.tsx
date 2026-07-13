import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'LAAS | Live Audience Activation System',
  description: 'Integrated Human Development & Behavioral Intelligence Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'var(--m3-background)', color: 'var(--m3-on-surface)' }}>
        {children}
      </body>
    </html>
  );
}
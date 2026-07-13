import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="p-8 mt-12 text-center" style={{ backgroundColor: 'var(--m3-surface-variant)' }}>
      <div className="flex justify-center gap-8 mb-6 font-medium">
        <Link href="/support" className="hover:opacity-70">Support & FAQ</Link>
        <Link href="/legal" className="hover:opacity-70">Legal & Privacy</Link>
      </div>
      <p className="text-sm opacity-70">
        &copy; {new Date().getFullYear()} LIFE LEGACY GLOBAL INITIATIVE. All rights reserved.
      </p>
    </footer>
  );
}
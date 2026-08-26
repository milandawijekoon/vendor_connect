import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth/context';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';

export const metadata: Metadata = {
  title: {
    template: '%s | VendorConnect',
    default: 'VendorConnect — Find Your Perfect Wedding Vendors in Sri Lanka',
  },
  description:
    'Discover and connect with top wedding vendors in Sri Lanka — photographers, venues, caterers, decorators and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <div className="page-body">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

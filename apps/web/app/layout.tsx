import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth/context';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';

export const metadata: Metadata = {
  title: {
    template: '%s | VendorsLK',
    default: 'VendorsLK — Find Vendors for Any Occasion in Sri Lanka',
  },
  description:
    'Discover and connect with top event vendors in Sri Lanka for weddings, parties, and corporate events — photographers, venues, caterers, decorators and more.',
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

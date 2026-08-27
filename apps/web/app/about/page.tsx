import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage } from '../../components/ui/ContentPage';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'VendorConnect is Sri Lanka’s event vendor marketplace — connecting customers with verified photographers, venues, caterers, decorators and more.',
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About VendorConnect"
      title="Helping Sri Lanka plan better events"
      intro="VendorConnect is a marketplace that connects people planning events with trusted, verified vendors across the island."
    >
      <h2>Our story</h2>
      <p>
        Planning an event in Sri Lanka has always meant chasing recommendations, comparing quotes over the phone,
        and hoping a vendor turns out to be as good as they sounded. We built VendorConnect to make that process
        simple, transparent and fair — for both customers and the businesses that serve them.
      </p>

      <h2>What we do</h2>
      <p>
        We bring photographers, videographers, venues, caterers, decorators, makeup artists, entertainers and event
        planners into one place. Customers can search by category, city and budget, compare packages and genuine
        reviews, and send inquiries directly to vendors — at no cost.
      </p>

      <h2>For vendors</h2>
      <p>
        For vendors, VendorConnect is a way to reach thousands of customers planning weddings, parties and corporate
        events every month. Listing a business is free, and vendors manage their profile, portfolio and inquiries
        from a single dashboard.
      </p>

      <h2>Our commitment</h2>
      <ul>
        <li><strong>Verified listings</strong> — we review vendor businesses before they go live.</li>
        <li><strong>Real reviews</strong> — feedback comes from customers who used the platform to connect.</li>
        <li><strong>No hidden fees</strong> — browsing, inquiring and listing are free.</li>
      </ul>

      <h2>Get in touch</h2>
      <p>
        Have a question or want to work with us? Visit our <Link href="/contact">contact page</Link> or email{' '}
        <a href="mailto:hello@vendorconnect.lk">hello@vendorconnect.lk</a>.
      </p>
    </ContentPage>
  );
}

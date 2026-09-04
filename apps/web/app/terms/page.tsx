import type { Metadata } from 'next';
import { ContentPage } from '../../components/ui/ContentPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of the VendorsLK platform.',
};

export default function TermsPage() {
  return (
    <ContentPage eyebrow="Legal" title="Terms of Service">
      <p className="updated">Last updated: 27 August 2026</p>

      <p>
        These Terms of Service (“Terms”) govern your access to and use of the VendorsLK website and services
        (the “Platform”), operated by VendorsLK (Pvt) Ltd (“VendorsLK”, “we”, “us”). By creating an account
        or using the Platform, you agree to these Terms.
      </p>

      <h2>1. The Platform</h2>
      <p>
        VendorsLK is a marketplace that helps customers discover event vendors and contact them directly. We
        are not a party to any agreement, booking or transaction between a customer and a vendor, and we do not
        provide event services ourselves.
      </p>

      <h2>2. Eligibility and accounts</h2>
      <ul>
        <li>You must be at least 18 years old and able to form a binding contract.</li>
        <li>You are responsible for the accuracy of your account information and for keeping your password secure.</li>
        <li>You are responsible for all activity that occurs under your account.</li>
      </ul>

      <h2>3. Customer responsibilities</h2>
      <p>
        You agree to use inquiries and messaging only for genuine event-planning purposes, to provide accurate
        details, and to deal with vendors honestly. You are solely responsible for evaluating a vendor and for any
        agreement you enter into with them.
      </p>

      <h2>4. Vendor responsibilities</h2>
      <ul>
        <li>You must have the right to operate the business you list and to offer the services described.</li>
        <li>
          Listing content — including pricing, availability, portfolio images and descriptions — must be accurate,
          lawful and your own or properly licensed.
        </li>
        <li>You must respond to inquiries in good faith and honour the terms you offer to customers.</li>
        <li>
          We may review, suspend or remove listings that are inaccurate, misleading, or that violate these Terms.
        </li>
      </ul>

      <h2>5. Reviews and content</h2>
      <p>
        Reviews must reflect genuine experiences. You retain ownership of content you submit, but grant
        VendorsLK a non-exclusive, worldwide, royalty-free licence to host, display and distribute it on the
        Platform. We may remove content that is unlawful, abusive, fraudulent or otherwise violates these Terms.
      </p>

      <h2>6. Prohibited conduct</h2>
      <ul>
        <li>Posting false, deceptive or infringing content.</li>
        <li>Harassing, threatening or defrauding other users.</li>
        <li>Scraping, spamming, or interfering with the operation or security of the Platform.</li>
        <li>Using the Platform to circumvent fees or for any unlawful purpose.</li>
      </ul>

      <h2>7. Fees</h2>
      <p>
        Browsing, sending inquiries and creating a standard vendor listing are currently free. If we introduce paid
        features, the applicable fees and terms will be disclosed before you incur any charge.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The Platform, including its design, text, and logos, is owned by VendorsLK and protected by
        intellectual property laws. These Terms do not grant you any right to use our branding without prior
        written permission.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Platform is provided “as is” and “as available”. We do not warrant that listings are accurate, that
        vendors will perform as described, or that the Platform will be uninterrupted or error-free. Any dealings
        between customers and vendors are solely between those parties.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, VendorsLK will not be liable for any indirect, incidental or
        consequential damages, or for any loss arising from a transaction or dispute between a customer and a
        vendor. Our total liability for any claim relating to the Platform will not exceed LKR 25,000.
      </p>

      <h2>11. Indemnity</h2>
      <p>
        You agree to indemnify VendorsLK against claims, losses and expenses arising from your use of the
        Platform, your content, or your breach of these Terms.
      </p>

      <h2>12. Suspension and termination</h2>
      <p>
        You may close your account at any time. We may suspend or terminate access if you breach these Terms or if
        required to protect the Platform or its users.
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Platform after changes take effect
        constitutes acceptance of the revised Terms.
      </p>

      <h2>14. Governing law</h2>
      <p>
        These Terms are governed by the laws of Sri Lanka, and the courts of Colombo have exclusive jurisdiction
        over any dispute.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms? Email <a href="mailto:legal@vendorconnect.lk">legal@vendorconnect.lk</a>.
      </p>
    </ContentPage>
  );
}

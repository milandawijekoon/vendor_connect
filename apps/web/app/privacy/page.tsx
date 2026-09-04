import type { Metadata } from 'next';
import { ContentPage } from '../../components/ui/ContentPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How VendorsLK collects, uses and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <ContentPage eyebrow="Legal" title="Privacy Policy">
      <p className="updated">Last updated: 27 August 2026</p>

      <p>
        This Privacy Policy explains how VendorsLK (Pvt) Ltd (“VendorsLK”, “we”, “us”) collects, uses and
        shares information when you use our website and services (the “Platform”). By using the Platform you agree to
        the practices described here.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> — name, email address, password and role (customer or vendor) when
          you register.
        </li>
        <li>
          <strong>Vendor profile information</strong> — business name, description, categories, service areas,
          pricing, portfolio images and contact details you choose to publish.
        </li>
        <li>
          <strong>Inquiries and messages</strong> — the content of inquiries you send to or receive from vendors,
          including event details and contact information.
        </li>
        <li>
          <strong>Reviews</strong> — ratings and written feedback you submit.
        </li>
        <li>
          <strong>Usage data</strong> — pages visited, searches run, device and browser type, and IP address,
          collected automatically through cookies and similar technologies.
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>To create and manage your account and vendor listings.</li>
        <li>To route inquiries between customers and vendors.</li>
        <li>To display vendor profiles, reviews and search results.</li>
        <li>To improve the Platform, monitor performance and prevent abuse.</li>
        <li>To send service-related notices and, where you have opted in, marketing updates.</li>
      </ul>

      <h2>3. How we share information</h2>
      <p>We share information only as needed to operate the Platform:</p>
      <ul>
        <li>
          <strong>With vendors</strong> — when you send an inquiry, the vendor receives your message and contact
          details so they can respond.
        </li>
        <li>
          <strong>Publicly</strong> — vendor profile content and published reviews are visible to anyone using the
          Platform.
        </li>
        <li>
          <strong>Service providers</strong> — hosting, image storage, email delivery and analytics providers that
          process data on our behalf under contract.
        </li>
        <li>
          <strong>Legal</strong> — where required by law or to protect the rights, safety and property of
          VendorsLK or others.
        </li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>4. Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and remember your preferences, and analytics cookies to
        understand how the Platform is used. You can control cookies through your browser settings; disabling
        essential cookies may affect functionality.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We keep personal information for as long as your account is active and as needed to provide the Platform.
        We may retain certain records after account closure where required for legal, tax or dispute-resolution
        purposes.
      </p>

      <h2>6. Security</h2>
      <p>
        We use technical and organisational measures — including encryption in transit and access controls — to
        protect your information. No method of transmission or storage is completely secure, and we cannot
        guarantee absolute security.
      </p>

      <h2>7. Your rights</h2>
      <p>
        You may access, correct or delete your account information from your dashboard, or by contacting us. You may
        also object to or restrict certain processing and withdraw consent for marketing at any time.
      </p>

      <h2>8. Children</h2>
      <p>The Platform is not directed to children under 18, and we do not knowingly collect their information.</p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be posted on this page with a revised
        “last updated” date.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about this policy? Email <a href="mailto:privacy@vendorconnect.lk">privacy@vendorconnect.lk</a> or
        write to VendorsLK (Pvt) Ltd, Level 3, 123 Union Place, Colombo 00200, Sri Lanka.
      </p>
    </ContentPage>
  );
}

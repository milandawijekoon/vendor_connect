/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

// The API is a separate origin (different subdomain in staging/prod); derive it
// from the public API URL so `connect-src` stays correct across environments.
let apiOrigin = 'http://localhost:4000';
try {
  apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').origin;
} catch {
  // keep the localhost fallback
}

// Remote image hosts rendered by the app. Portfolio/cover images are on Cloudinary;
// picsum.photos (which 302-redirects to its fastly.* CDN) and i.pravatar.cc back the
// seeded demo data; Google serves review-author and OAuth avatars.
const imgHosts = [
  'https://res.cloudinary.com',
  'https://picsum.photos',
  'https://*.picsum.photos',
  'https://i.pravatar.cc',
  'https://*.googleusercontent.com',
  'https://*.gstatic.com',
];

// Google Identity Services origins per https://developers.google.com/identity/gsi/web/guides/csp
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js emits inline bootstrap/hydration scripts without a nonce; dev additionally needs eval for HMR.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://accounts.google.com/gsi/client`,
  "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
  `img-src 'self' data: blob: ${imgHosts.join(' ')}`,
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} https://accounts.google.com/gsi/${isDev ? ' ws:' : ''}`,
  'frame-src https://accounts.google.com/gsi/',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Ignored by browsers over plain HTTP; takes effect once TLS terminates in front.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  output: 'standalone',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  transpilePackages: ['@vendorconnect/shared'],
};

export default nextConfig;

/**
 * Test data factories. Each returns a plausible entity shaped like what the
 * Prisma repositories hand back, with overridable fields.
 */
import { Role, VendorStatus, InquiryStatus } from '@vendorconnect/shared';

let seq = 0;
const id = (prefix: string) => `${prefix}_${(seq += 1).toString().padStart(4, '0')}`;

export function makeUser(overrides: Partial<ReturnType<typeof baseUser>> = {}) {
  return { ...baseUser(), ...overrides };
}

function baseUser() {
  return {
    id: id('user'),
    name: 'Nimal Perera',
    email: `nimal${seq}@example.com`,
    passwordHash: '$2b$12$hashedhashedhashedhashedhashedhashedhashedhash' as string | null,
    googleId: null as string | null,
    avatarUrl: null as string | null,
    role: Role.CUSTOMER as string,
    phone: '+94771234567' as string | null,
    deletedAt: null as Date | null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
}

export function makeVendorCategory(name = 'Photography') {
  return {
    category: {
      id: id('cat'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    },
  };
}

export function makeVendorImage(order = 0) {
  return {
    id: id('img'),
    url: `https://cdn.example.com/${id('u')}.jpg`,
    cloudinaryPublicId: id('cld'),
    order,
  };
}

export function makeExternalReview(overrides: Partial<ReturnType<typeof baseExternalReview>> = {}) {
  return { ...baseExternalReview(), ...overrides };
}

function baseExternalReview() {
  return {
    id: id('ext'),
    vendorId: id('vendor'),
    source: 'GOOGLE',
    authorName: 'Rebecca Anthony',
    authorPhotoUrl: 'https://cdn.example.com/avatar.jpg' as string | null,
    rating: 5,
    text: 'Booked after reading the Google reviews — they lived up to every one of them.',
    relativeTime: '2 weeks ago',
    createdAt: new Date('2026-07-10T00:00:00.000Z'),
  };
}

/** Shaped like VendorsRepository.findByUserId / findBySlug payloads. */
export function makeVendor(overrides: Partial<ReturnType<typeof baseVendor>> = {}) {
  return { ...baseVendor(), ...overrides };
}

function baseVendor() {
  return {
    id: id('vendor'),
    userId: id('user'),
    slug: 'ceylon-lens-studio',
    businessName: 'Ceylon Lens Studio',
    description: 'Award-winning event photography across the island.',
    city: 'Colombo',
    address: '12 Galle Road, Colombo 03' as string | null,
    priceMin: 50000 as number | null,
    priceMax: 250000 as number | null,
    status: VendorStatus.APPROVED as string,
    avgRating: 4.5,
    reviewCount: 12,
    facebookUrl: 'https://www.facebook.com/ceylonlensstudio' as string | null,
    googleUrl: 'https://www.google.com/maps/search/?api=1&query=Ceylon%20Lens%20Studio' as string | null,
    googleRating: 4.8 as number | null,
    googleReviewCount: 126 as number | null,
    deletedAt: null as Date | null,
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    updatedAt: new Date('2026-02-15T00:00:00.000Z'),
    categories: [makeVendorCategory('Photography')],
    images: [makeVendorImage(0), makeVendorImage(1)],
    externalReviews: [makeExternalReview()],
    user: { name: 'Nimal Perera', phone: '+94771234567' as string | null },
  };
}

/** Shaped like InquiriesRepository.create payload. */
export function makeInquiry(overrides: Partial<ReturnType<typeof baseInquiry>> = {}) {
  return { ...baseInquiry(), ...overrides };
}

function baseInquiry() {
  return {
    id: id('inq'),
    vendorId: id('vendor'),
    userId: null as string | null,
    name: 'Kamala Silva',
    email: 'kamala@example.com',
    phone: '+94712223334',
    eventDate: new Date('2027-03-15T00:00:00.000Z') as Date | null,
    message: 'Looking for a photographer for a March 2027 event.',
    status: InquiryStatus.NEW as string,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
  };
}

/** Shaped like ReviewsRepository.create payload (includes user.name). */
export function makeReview(overrides: Partial<ReturnType<typeof baseReview>> = {}) {
  return { ...baseReview(), ...overrides };
}

function baseReview() {
  return {
    id: id('rev'),
    vendorId: id('vendor'),
    userId: id('user'),
    rating: 5,
    comment: 'Absolutely stunning photos.' as string | null,
    createdAt: new Date('2026-07-01T00:00:00.000Z'),
    user: { name: 'Kamala Silva' },
  };
}

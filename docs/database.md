# Database Design

## 1. Entity Relationship Overview

```
User ──1:1── VendorProfile ──1:N── PortfolioImage
  │                │
  │                ├──N:N── Category (via VendorCategory)
  │                ├──1:N── Review
  │                └──1:N── Inquiry
  │
  └──1:N── Review (as reviewer)
  └──1:N── Inquiry (as customer, optional/nullable)
```

## 2. Prisma Schema (MVP)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER
  VENDOR
  ADMIN
}

enum VendorStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

enum InquiryStatus {
  NEW
  CONTACTED
  CONFIRMED
  CLOSED
}

model User {
  id            String        @id @default(cuid())
  email         String        @unique
  passwordHash  String
  role          Role          @default(CUSTOMER)
  name          String
  phone         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?     // soft delete

  vendorProfile VendorProfile?
  reviews       Review[]
  inquiries     Inquiry[]

  @@index([role])
}

model VendorProfile {
  id            String        @id @default(cuid())
  userId        String        @unique
  user          User          @relation(fields: [userId], references: [id])

  businessName  String
  slug          String        @unique
  description   String        @db.Text
  city          String
  address       String?
  priceMin      Int?
  priceMax      Int?
  status        VendorStatus  @default(PENDING)
  avgRating     Float         @default(0)
  reviewCount   Int           @default(0)

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?

  categories    VendorCategory[]
  images        PortfolioImage[]
  reviews       Review[]
  inquiries     Inquiry[]

  @@index([city])
  @@index([status])
  @@index([priceMin, priceMax])
}

model Category {
  id      String            @id @default(cuid())
  name    String            @unique
  slug    String            @unique
  vendors VendorCategory[]
}

model VendorCategory {
  vendorId   String
  categoryId String
  vendor     VendorProfile @relation(fields: [vendorId], references: [id])
  category   Category      @relation(fields: [categoryId], references: [id])

  @@id([vendorId, categoryId])
  @@index([categoryId])
}

model PortfolioImage {
  id               String        @id @default(cuid())
  vendorId         String
  vendor           VendorProfile @relation(fields: [vendorId], references: [id])
  cloudinaryPublicId String
  url              String
  order            Int           @default(0)
  createdAt        DateTime      @default(now())

  @@index([vendorId])
}

model Review {
  id        String        @id @default(cuid())
  vendorId  String
  vendor    VendorProfile @relation(fields: [vendorId], references: [id])
  userId    String
  user      User          @relation(fields: [userId], references: [id])
  rating    Int           // 1–5, validated at application layer
  comment   String?       @db.Text
  createdAt DateTime      @default(now())

  @@unique([vendorId, userId]) // one review per customer per vendor
  @@index([vendorId])
}

model Inquiry {
  id        String        @id @default(cuid())
  vendorId  String
  vendor    VendorProfile @relation(fields: [vendorId], references: [id])
  userId    String?       // nullable — allow guest inquiries pre-auth
  user      User?         @relation(fields: [userId], references: [id])

  name      String
  email     String
  phone     String
  eventDate DateTime?
  message   String        @db.Text
  status    InquiryStatus @default(NEW)
  createdAt DateTime      @default(now())

  @@index([vendorId])
  @@index([status])
}
```

## 3. Design Notes

- **Soft deletes** (`deletedAt`) on `User` and `VendorProfile` — vendors/users are never
  hard-deleted at MVP; excluded from queries via a Prisma middleware/repository filter.
- **`avgRating`/`reviewCount` are denormalized** onto `VendorProfile` for fast list/sort
  queries (avoids aggregating `Review` on every vendor listing page). Recalculated in the
  `ReviewsService` whenever a review is created/updated/deleted.
- **Guest inquiries**: `Inquiry.userId` is nullable so a customer can submit an inquiry
  without creating an account first — reduces friction, matches how WedMeGood-style
  lead capture actually converts.
- **Indexes** are placed on the columns used in the vendor search/filter query
  (`city`, `status`, `priceMin/priceMax`) and all foreign keys, per the requirement to
  design for query performance and avoid N+1s (repositories should use Prisma `include`
  deliberately, not lazy per-row fetching).
- **Migrations**: use `prisma migrate dev` locally and `prisma migrate deploy` in CI/CD.
  `prisma db push` is not used as the migration strategy — every schema change is a
  tracked, reviewed migration file.

## 4. Future Schema Extensions (not MVP, noted so today's schema doesn't block them)

- `Booking` table with payment status, deposit amount, PayHere transaction ref (Phase 2)
- `Conversation`/`Message` tables if in-app chat replaces WhatsApp handoff (Phase 2/3)
- `VendorSubscription` table for paid listing tiers (Phase 2)
- `Locale` field on content tables if Sinhala/Tamil i18n is added

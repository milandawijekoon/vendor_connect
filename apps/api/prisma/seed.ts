import { PrismaClient, VendorStatus, Role, InquiryStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── Helpers ────────────────────────────────────────────────────────────────
const hash = (pw: string) => bcrypt.hashSync(pw, 10);
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const pickN = <T>(arr: T[], n: number): T[] => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ── Category-relevant portfolio imagery ────────────────────────────────────
// loremflickr serves keyword-matched photos; `lock` makes each URL deterministic
// so re-seeding yields stable images.
const CATEGORY_IMAGE_TAGS: Record<string, string> = {
  'photography':             'wedding,photographer',
  'videography':             'wedding,filmmaker',
  'venues':                  'wedding,venue',
  'catering':                'catering,banquet',
  'decoration':              'wedding,decoration',
  'makeup-hair':             'bridal,makeup',
  'music-entertainment':     'wedding,band',
  'flowers-floral':          'wedding,bouquet',
  'cakes-desserts':          'wedding,cake',
  'attire-styling':          'bridal,dress',
  'sound-lighting':          'stage,lighting',
  'invitations-stationery':  'wedding,invitation',
  'transportation':          'wedding,car',
  'jewellery':               'jewellery,diamond',
  'event-planning':          'wedding,event',
};

const img = (category: string, lock: number, w = 800, h = 600) => {
  const tags = CATEGORY_IMAGE_TAGS[category] ?? 'wedding';
  return `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;
};

// ── Categories ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Photography',           slug: 'photography' },
  { name: 'Videography',           slug: 'videography' },
  { name: 'Venues',                slug: 'venues' },
  { name: 'Catering',              slug: 'catering' },
  { name: 'Decoration',            slug: 'decoration' },
  { name: 'Makeup & Hair',         slug: 'makeup-hair' },
  { name: 'Music & Entertainment', slug: 'music-entertainment' },
  { name: 'Flowers & Floral',      slug: 'flowers-floral' },
  { name: 'Cakes & Desserts',      slug: 'cakes-desserts' },
  { name: 'Attire & Styling',      slug: 'attire-styling' },
  { name: 'Sound & Lighting',      slug: 'sound-lighting' },
  { name: 'Invitations & Stationery', slug: 'invitations-stationery' },
  { name: 'Transportation',        slug: 'transportation' },
  { name: 'Jewellery',             slug: 'jewellery' },
  { name: 'Event Planning',        slug: 'event-planning' },
];

// ── Sri Lanka cities ───────────────────────────────────────────────────────
const CITIES = [
  'Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna',
  'Matara', 'Kurunegala', 'Anuradhapura', 'Nuwara Eliya', 'Trincomalee',
];

// ── Vendor data (50 vendors) ───────────────────────────────────────────────
interface VendorSpec {
  name: string;
  category: string;    // slug
  city: string;
  priceMin: number;
  priceMax: number;
  desc: string;
}

const VENDORS: VendorSpec[] = [
  // Photography (10)
  { name: 'Lens & Light Studio',     category: 'photography', city: 'Colombo',    priceMin: 80000,  priceMax: 250000, desc: 'Award-winning photography studio specialising in cinematic wedding storytelling. We capture raw emotions and timeless moments with our team of 5 professional photographers.' },
  { name: 'Ceylon Moments',           category: 'photography', city: 'Kandy',      priceMin: 60000,  priceMax: 180000, desc: 'Based in the heart of Kandy, we blend traditional Kandyan wedding aesthetics with modern photographic techniques to deliver breathtaking galleries.' },
  { name: 'Galle Light Photography',  category: 'photography', city: 'Galle',      priceMin: 75000,  priceMax: 220000, desc: 'Specialising in beach and colonial fort weddings around the southern coast. Natural light, candid shots, and editorial storytelling.' },
  { name: 'Snapshot Pro',             category: 'photography', city: 'Negombo',    priceMin: 50000,  priceMax: 150000, desc: 'Affordable premium photography for budget-conscious customers without compromise on quality. Full-day coverage with edited album.' },
  { name: 'Eternal Frames',           category: 'photography', city: 'Colombo',    priceMin: 100000, priceMax: 300000, desc: 'Luxury destination wedding photographers. Featured in Wedding Magazine Sri Lanka 2024. Drone included in all packages.' },
  { name: 'Golden Hour Studios',      category: 'photography', city: 'Galle',      priceMin: 90000,  priceMax: 260000, desc: 'Two-photographer team offering full wedding day coverage, pre-shoot sessions, and premium leather-bound albums.' },
  { name: 'Jaffna Memories',          category: 'photography', city: 'Jaffna',     priceMin: 45000,  priceMax: 130000, desc: 'Specialists in traditional Tamil and Hindu wedding photography. Fluent in all northern ceremony traditions.' },
  { name: 'Hill Country Captures',    category: 'photography', city: 'Nuwara Eliya', priceMin: 70000, priceMax: 200000, desc: 'Stunning mountain backdrop photography for tea country weddings. Partners with all major estate venues.' },
  { name: 'Coastal Clicks',           category: 'photography', city: 'Matara',     priceMin: 55000,  priceMax: 160000, desc: 'Southern coast specialists delivering warm, sun-kissed wedding galleries. Underwater photography packages available.' },
  { name: 'Urban Lens Collective',    category: 'photography', city: 'Colombo',    priceMin: 120000, priceMax: 350000, desc: 'Four-photographer collective for large weddings. Live slideshow on wedding day, cloud gallery within 3 days.' },

  // Videography (5)
  { name: 'Cinematic Dreams',         category: 'videography', city: 'Colombo',    priceMin: 90000,  priceMax: 280000, desc: 'Hollywood-style wedding films with drone aerials, 4K cameras, and cinematic colour grading. 3–5 minute highlight reel + full ceremony.' },
  { name: 'Memories on Film',         category: 'videography', city: 'Kandy',      priceMin: 70000,  priceMax: 200000, desc: 'Emotional storytelling through film. We interview family and friends for a personalised wedding documentary.' },
  { name: 'SL Film House',            category: 'videography', city: 'Galle',      priceMin: 80000,  priceMax: 240000, desc: 'Two-camera setup, multi-day coverage, same-day edit for reception. Full 4K delivery with streaming link.' },
  { name: 'Frame by Frame',           category: 'videography', city: 'Negombo',    priceMin: 60000,  priceMax: 170000, desc: 'Budget-friendly cinematic videography. Packages include highlight reel, full ceremony, and reception.' },
  { name: 'Aerial Wedding Films',     category: 'videography', city: 'Colombo',    priceMin: 110000, priceMax: 320000, desc: 'Specialist drone cinematography for stunning aerial perspectives. FAA-certified pilots, insurance included.' },

  // Venues (8)
  { name: 'The Grand Cinnamon',       category: 'venues', city: 'Colombo',    priceMin: 300000, priceMax: 800000, desc: 'Iconic 5-star ballroom in Colombo 3 with capacity for 500 guests. Dedicated wedding coordinator, in-house catering, valet parking.' },
  { name: 'Kandy Lake Club',          category: 'venues', city: 'Kandy',      priceMin: 200000, priceMax: 600000, desc: 'Colonial heritage venue overlooking the beautiful Kandy Lake. Stunning views, outdoor and indoor options, 300 guest capacity.' },
  { name: 'Galle Fort Mansion',       category: 'venues', city: 'Galle',      priceMin: 250000, priceMax: 700000, desc: 'Exclusive hire of a 400-year-old colonial mansion inside the UNESCO World Heritage Galle Fort. Intimate and romantic.' },
  { name: 'Negombo Beach Resort',     category: 'venues', city: 'Negombo',    priceMin: 180000, priceMax: 500000, desc: 'Beachfront wedding venue with ceremony on white sandy beach. Sunset packages, garden receptions, 400 guest capacity.' },
  { name: 'Tea Estate Weddings',      category: 'venues', city: 'Nuwara Eliya', priceMin: 220000, priceMax: 650000, desc: 'Exclusive working tea estate in the highlands. Majestic views, cool misty climate, traditional colonial bungalow.' },
  { name: 'Sunset Terrace Matara',    category: 'venues', city: 'Matara',     priceMin: 150000, priceMax: 450000, desc: 'Open-air cliffside venue with panoramic ocean views. Sunset ceremony packages, catering partners available.' },
  { name: 'Heritage Hall Kurunegala', category: 'venues', city: 'Kurunegala', priceMin: 120000, priceMax: 380000, desc: 'Elegant air-conditioned ballroom in the heart of Kurunegala. Capacity 350, full AV system, ample free parking.' },
  { name: 'Ancient City Resort',      category: 'venues', city: 'Anuradhapura', priceMin: 140000, priceMax: 420000, desc: 'Lush garden venue surrounded by ancient ruins. Unique historical backdrop, outdoor pool area, 250 guest capacity.' },

  // Catering (6)
  { name: 'Royal Feast Catering',     category: 'catering', city: 'Colombo',  priceMin: 2500,   priceMax: 8000,   desc: 'Per-head pricing. 5-star hotel chefs, live cooking stations, Sri Lankan and international cuisine. Minimum 100 guests.' },
  { name: 'Spice Route Events',       category: 'catering', city: 'Kandy',    priceMin: 1800,   priceMax: 5000,   desc: 'Authentic Sri Lankan cuisine specialists. Traditional rice & curry, hoppers, string hoppers. Buffet and plated service.' },
  { name: 'Colombo Bites',            category: 'catering', city: 'Colombo',  priceMin: 3000,   priceMax: 9000,   desc: 'Upscale catering with Michelin-trained chefs. Western, Asian fusion, and Sri Lankan menus. Wine pairing available.' },
  { name: 'Southern Spice Caterers',  category: 'catering', city: 'Galle',    priceMin: 1500,   priceMax: 4500,   desc: 'Local southern cuisine experts. Seafood specialties, fresh coconut-based curries, traditional sweets.' },
  { name: 'North Star Catering',      category: 'catering', city: 'Jaffna',   priceMin: 1200,   priceMax: 3500,   desc: 'Specialists in traditional Jaffna Tamil cuisine. Vegetarian and non-vegetarian packages, traditional serving style.' },
  { name: 'Garden Fresh Catering',    category: 'catering', city: 'Negombo',  priceMin: 2000,   priceMax: 6000,   desc: 'Farm-to-table catering with organic ingredients. Custom menus, dietary accommodations, eco-friendly service.' },

  // Decoration (5)
  { name: 'Bloom & Drape',            category: 'decoration', city: 'Colombo', priceMin: 150000, priceMax: 500000, desc: 'Luxury wedding decorators turning venues into dreamscapes. Specialising in floral arches, ceiling drapes, and table centrepieces.' },
  { name: 'Crystal Decor Kandy',      category: 'decoration', city: 'Kandy',   priceMin: 100000, priceMax: 350000, desc: 'Kandy-based decoration team with expertise in traditional Kandyan and modern fusion themes. 200+ weddings completed.' },
  { name: 'Fairy Lights Events',      category: 'decoration', city: 'Colombo', priceMin: 80000,  priceMax: 280000, desc: 'LED and fairy light specialists. Canopy lighting, neon signs, photo booths, balloon installations.' },
  { name: 'Island Blooms',            category: 'decoration', city: 'Galle',   priceMin: 120000, priceMax: 400000, desc: 'Tropical floral design studio. Fresh-cut arrangements, palm leaf installations, beachside ceremony setups.' },
  { name: 'Elegance by Nirasha',      category: 'decoration', city: 'Negombo', priceMin: 90000,  priceMax: 300000, desc: 'Bespoke event decoration with personal design consultation. White, blush, and gold themes our specialty.' },

  // Makeup & Hair (4)
  { name: 'Bridal Glow Studio',       category: 'makeup-hair', city: 'Colombo', priceMin: 25000, priceMax: 80000,  desc: 'Celebrity makeup artists serving Sri Lanka\'s top brides. Airbrush foundation, hair styling, saree draping all included.' },
  { name: 'Glam by Dilani',           category: 'makeup-hair', city: 'Kandy',   priceMin: 18000, priceMax: 60000,  desc: 'Specialist in Kandyan bridal looks. Gold jewellery draping, traditional headpiece, natural and HD makeup packages.' },
  { name: 'Studio M Beauty',          category: 'makeup-hair', city: 'Galle',   priceMin: 20000, priceMax: 70000,  desc: 'Southern Sri Lanka\'s premier bridal studio. Trial sessions, on-location service, bridesmaids packages.' },
  { name: 'Beauty & Beyond Jaffna',   category: 'makeup-hair', city: 'Jaffna',  priceMin: 15000, priceMax: 50000,  desc: 'Experienced in Tamil bridal makeup traditions. Full day service from getting-ready to reception, team of 3 artists.' },

  // Music & Entertainment (4)
  { name: 'Harmony Live Band',        category: 'music-entertainment', city: 'Colombo', priceMin: 120000, priceMax: 350000, desc: '8-piece live wedding band performing Sinhalese, English, and Tamil songs. Professional sound system, 4-hour sets.' },
  { name: 'DJ Beats Ceylon',          category: 'music-entertainment', city: 'Colombo', priceMin: 50000,  priceMax: 150000, desc: 'Professional DJ with 15 years wedding experience. Full PA system, lighting rig, MC services included.' },
  { name: 'Kandy Drummers',           category: 'music-entertainment', city: 'Kandy',   priceMin: 40000,  priceMax: 120000, desc: 'Traditional Kandyan drum troupe for ceremony processions and cultural performances. Full Perahera experience.' },
  { name: 'Acoustic Serenades',       category: 'music-entertainment', city: 'Galle',   priceMin: 60000,  priceMax: 180000, desc: 'Elegant acoustic duo specialising in dinner receptions. Violin and guitar, covers of your favourite songs.' },

  // Flowers & Floral (3)
  { name: 'Petal Perfect',            category: 'flowers-floral', city: 'Colombo', priceMin: 50000,  priceMax: 200000, desc: 'Luxury floral design for weddings. Bridal bouquets, ceremony arches, table arrangements, pew flowers. Fresh imports daily.' },
  { name: 'Garden of Eden Flowers',   category: 'flowers-floral', city: 'Kandy',   priceMin: 35000,  priceMax: 140000, desc: 'Fresh local and imported flowers. Orchids, lilies, roses, and jasmine specialists. Free delivery within Kandy.' },
  { name: 'Tropical Blooms',          category: 'flowers-floral', city: 'Galle',   priceMin: 40000,  priceMax: 160000, desc: 'Southern Sri Lanka\'s leading florist. Native tropical arrangements using anthurium, bird of paradise, and frangipani.' },

  // Attire & Styling (3)
  { name: 'Silk & Sequins Couture',   category: 'attire-styling', city: 'Colombo', priceMin: 80000,  priceMax: 400000, desc: 'Designer sarees, lehengas, and gowns for weddings, galas, and formal events. Custom design service, alterations, accessories. 3-month lead time recommended.' },
  { name: 'Kandy Style Boutique',     category: 'attire-styling', city: 'Kandy',   priceMin: 60000,  priceMax: 280000, desc: 'Traditional Kandyan osariya and modern occasion wear. Embroidery and beadwork done in-house. Try before you buy.' },
  { name: 'Gown Gallery Colombo',     category: 'attire-styling', city: 'Colombo', priceMin: 100000, priceMax: 500000, desc: 'Formal gowns and evening wear for every occasion. Designer imports from UK and Italy, plus local bespoke. Accessories wall included.' },

  // Jewellery (2)
  { name: 'Gold Crown Jewellers',     category: 'jewellery', city: 'Colombo', priceMin: 100000, priceMax: 2000000, desc: 'Three-generation family jewellers. Custom design, certified diamonds, statement sets, and modern minimalist pieces for any occasion.' },
  { name: 'Heritage Gems Kandy',      category: 'jewellery', city: 'Kandy',   priceMin: 80000,  priceMax: 1500000, desc: 'Specialists in Ceylon sapphires and precious stones. Traditional Kandyan necklaces, modern sets, and gift pieces.' },
];

// ── Customer user names ──────────────────────────────────────────────────────
const CUSTOMER_NAMES = [
  'Amara Silva',      'Dilshan Fernando',  'Kavindi Perera',   'Nuwan Jayawardena',
  'Sachini Wijesekara','Thilak Rajapaksa', 'Oshani Kumari',    'Malshan Gunawardena',
  'Tharushi Bandara', 'Chathura Senanayake','Nadeesha Dissanayake','Roshan Wickramasinghe',
  'Praveen Nair',     'Sunita Krishnan',   'Ravi Kumaran',     'Priya Selvam',
  'Ashan De Silva',   'Damayanthi Herath', 'Suresh Perera',    'Lakshmi Balasingham',
  'Gayan Ratnasiri',  'Sanduni Jayasekara','Udara Madushanka', 'Piumali Seneviratne',
  'Kasun Wickrama',   'Dilrukshi Mendis',  'Hasantha Kumara',  'Thilini Weerasinghe',
  'Chamara Liyanage', 'Ishara Rajapakshe',
];

const REVIEW_COMMENTS = [
  'Absolutely stunning work! Every photo tells a story. We cried watching the slideshow.',
  'Professional, punctual, and incredibly talented. Could not have asked for better service.',
  'They made us feel so comfortable throughout the day. Results exceeded all expectations.',
  'Incredible attention to detail. The team went above and beyond to capture our special moments.',
  'Worth every rupee! Our family was blown away by the quality. Highly recommended.',
  'Super friendly team, very experienced. They knew exactly the right moments to capture.',
  'We had a rough morning before the ceremony but the team handled everything calmly and kept us relaxed.',
  'The portfolio on the website does not do justice — the actual delivery was even better!',
  'Booked 8 months in advance after seeing their Instagram. No regrets at all.',
  'My mother-in-law was skeptical at first but she was amazed on the day. Thank you!',
  'They coordinated perfectly with our other vendors. Very professional and well-organised.',
  'Received so many compliments from guests. Multiple people asked for their contact.',
  'Quick turnaround time, delivered everything promised in the contract. No hidden costs.',
  'Beautiful work, great communication, and competitive pricing. A complete package.',
  'They captured moments I did not even know were happening. Truly talented artists.',
  'Best decision we made for our event. Wish we could relive the day just to hire them again.',
];

// ── External (Google) review content ───────────────────────────────────────
const GOOGLE_REVIEW_AUTHORS = [
  'Nimal Perera',       'Shivani Raj',        'Dinesh Fernando',   'Aisha Mohamed',
  'Kumar Sivakumar',    'Rebecca Anthony',    'Lasith Gunaratne',  'Menaka Alwis',
  'Farhan Nizam',       'Chloe Peiris',       'Ranil Abeywardena', 'Yuki Tanaka',
  'Georgina Muller',    'Pradeep Kariyawasam','Hansika Fonseka',   'David Whitmore',
];

const GOOGLE_REVIEW_TEXTS = [
  'Found them on Google and so glad we did. Communication was quick and professional from the first message.',
  'Booked after reading the Google reviews — they lived up to every one of them. Highly recommend.',
  'Great value for money. The team was punctual, friendly and delivered exactly what was promised.',
  'We interviewed three vendors and picked this one. Best decision of our planning process.',
  'Responsive on WhatsApp, transparent pricing, and no surprises on the day. Five stars.',
  'A little pricey but absolutely worth it. The quality speaks for itself.',
  'Professional setup, arrived early, and stayed until everything was wrapped up. Thank you!',
  'They handled a last-minute venue change without any fuss. Very experienced team.',
  'Lovely people to work with. Our families are still talking about how good they were.',
  'Delivered everything ahead of schedule. Would book again for any future event.',
  'Attention to detail is on another level. Every request was noted and delivered.',
  'Smooth experience end to end. The Google listing photos are an accurate preview of their work.',
];

const GOOGLE_RELATIVE_TIMES = [
  'a week ago', '2 weeks ago', 'a month ago', '2 months ago',
  '3 months ago', '5 months ago', '7 months ago', 'a year ago',
];

const fbHandle = (name: string) =>
  name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '').slice(0, 40) || 'vendor';

const googleMapsUrl = (name: string, city: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${city}, Sri Lanka`)}`;

const INQUIRY_MESSAGES = [
  'Hello, we are planning an event for early next year and would love to know your availability and packages.',
  'Hi! I came across your profile and loved your work. Could you share your pricing for a 300-guest function?',
  'We have an event in Colombo in March. Do you cover outstation bookings as well?',
  'I would like to know if you are available on 15th February 2027 and what packages you offer.',
  'Can you please share your brochure and pricing list? We have a budget of around 150,000.',
  'We love your portfolio. Are you available for a weekend event in December?',
  'We need coverage from morning setup through to the reception dinner. What is included?',
  'Do you offer pre-event sessions as part of your package? Also what is the delivery timeline?',
  'Hello! We found you through VendorsLK and would like to schedule a meeting to discuss details.',
  'What is your cancellation policy and do you require a deposit to hold the date?',
];

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');

  // ── 1. Categories ──────────────────────────────────────────────────────
  console.log('📂 Seeding categories...');
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    categoryMap[cat.slug] = c.id;
  }
  console.log(`   ✓ ${CATEGORIES.length} categories\n`);

  // ── 2. Admin user ──────────────────────────────────────────────────────
  console.log('👑 Seeding admin user...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vendorslk.com' },
    update: {},
    create: {
      email: 'admin@vendorslk.com',
      passwordHash: hash('Admin@1234'),
      name: 'VendorsLK Admin',
      role: Role.ADMIN,
    },
  });
  console.log(`   ✓ admin@vendorslk.com (password: Admin@1234)\n`);

  // ── 3. Vendor users ────────────────────────────────────────────────────
  console.log('🏢 Seeding vendor users & profiles...');
  const vendorUsers: { id: string; email: string }[] = [];
  for (let i = 0; i < VENDORS.length; i++) {
    const v = VENDORS[i]!;
    const email = `vendor${i + 1}@vendorslk.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hash('Vendor@1234'),
        name: `${v.name} Owner`,
        role: Role.VENDOR,
        phone: `+9477${String(1000000 + i).slice(1)}`,
      },
    });
    vendorUsers.push({ id: user.id, email });
  }
  console.log(`   ✓ ${vendorUsers.length} vendor users\n`);

  // ── 4. Vendor profiles ─────────────────────────────────────────────────
  console.log('🏪 Seeding vendor profiles...');
  const vendorProfiles: { id: string; slug: string; name: string }[] = [];

  for (let i = 0; i < VENDORS.length; i++) {
    const v      = VENDORS[i]!;
    const user   = vendorUsers[i]!;
    const catId  = categoryMap[v.category];
    if (!catId) continue;

    const vendorSlug = slug(v.name) + (i > 0 ? `-${i}` : '');

    // Social / external presence
    const facebookUrl       = `https://www.facebook.com/${fbHandle(v.name)}`;
    const googleUrl         = googleMapsUrl(v.name, v.city);
    const googleReviewCount = rand(24, 320);
    const googleRating      = Math.min(5, Math.max(3.7, Math.round((4.3 + (Math.random() - 0.4)) * 10) / 10));

    // Check existing
    const existing = await prisma.vendorProfile.findFirst({ where: { userId: user.id } });
    let profileId: string;

    if (existing) {
      profileId = existing.id;
      await prisma.vendorProfile.update({
        where: { id: profileId },
        data: {
          businessName: v.name,
          description:  v.desc,
          city:         v.city,
          priceMin:     v.priceMin,
          priceMax:     v.priceMax,
          facebookUrl,
          googleUrl,
          googleRating,
          googleReviewCount,
        },
      });
    } else {
      const profile = await prisma.vendorProfile.create({
        data: {
          userId:       user.id,
          businessName: v.name,
          slug:         vendorSlug,
          description:  v.desc,
          city:         v.city,
          address:      `${rand(1, 200)} ${pick(['Main St', 'High St', 'Temple Rd', 'Lake Rd', 'Beach Rd', 'Queen St'])}, ${v.city}`,
          priceMin:     v.priceMin,
          priceMax:     v.priceMax,
          status:       VendorStatus.APPROVED,
          facebookUrl,
          googleUrl,
          googleRating,
          googleReviewCount,
          categories: {
            create: [{ categoryId: catId }],
          },
        },
      });
      profileId = profile.id;
    }

    // Portfolio images (4 category-relevant photos per vendor) — refreshed each run
    await prisma.portfolioImage.deleteMany({ where: { vendorId: profileId } });
    for (let j = 0; j < 4; j++) {
      const lock = i * 10 + j;
      await prisma.portfolioImage.create({
        data: {
          vendorId:          profileId,
          cloudinaryPublicId: `vendorconnect/seed/${v.category}-${i}-${j}`,
          url:               img(v.category, lock),
          order:             j,
        },
      });
    }

    // External (Google) reviews (3–5 per vendor) — refreshed each run
    await prisma.externalReview.deleteMany({ where: { vendorId: profileId } });
    const gReviewers = pickN(GOOGLE_REVIEW_AUTHORS, rand(3, 5));
    for (let g = 0; g < gReviewers.length; g++) {
      await prisma.externalReview.create({
        data: {
          vendorId:     profileId,
          source:       'GOOGLE',
          authorName:   gReviewers[g]!,
          authorPhotoUrl: `https://i.pravatar.cc/80?u=${encodeURIComponent(gReviewers[g]! + i)}`,
          rating:       pick([4, 4, 5, 5, 5]),
          text:         pick(GOOGLE_REVIEW_TEXTS),
          relativeTime: pick(GOOGLE_RELATIVE_TIMES),
        },
      });
    }

    vendorProfiles.push({ id: profileId, slug: vendorSlug, name: v.name });
  }
  console.log(`   ✓ ${vendorProfiles.length} vendor profiles with portfolio images, social links & Google reviews\n`);

  // ── 5. Customer users ────────────────────────────────────────────────────
  console.log('🙋 Seeding customer users...');
  const customerUsers: { id: string; name: string }[] = [];
  for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
    const name = CUSTOMER_NAMES[i]!;
    const email = `customer${i + 1}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hash('Customer@1234'),
        name,
        role: Role.CUSTOMER,
        phone: `+9476${String(2000000 + i).slice(1)}`,
      },
    });
    customerUsers.push({ id: user.id, name });
  }
  console.log(`   ✓ ${customerUsers.length} customer users\n`);

  // ── 6. Reviews ─────────────────────────────────────────────────────────
  console.log('⭐ Seeding reviews...');
  await prisma.review.deleteMany({});
  let reviewCount = 0;
  const reviewedPairs = new Set<string>();

  for (const vendor of vendorProfiles) {
    // Pick 5–12 unique customers to review this vendor
    const reviewers = pickN(customerUsers, rand(5, 12));
    const ratings: number[] = [];

    for (const customer of reviewers) {
      const key = `${vendor.id}:${customer.id}`;
      if (reviewedPairs.has(key)) continue;
      reviewedPairs.add(key);

      const rating = pick([3, 4, 4, 4, 5, 5, 5, 5]); // weighted toward good ratings
      ratings.push(rating);

      const daysAgo = rand(10, 400);
      const createdAt = new Date(Date.now() - daysAgo * 86400000);

      await prisma.review.create({
        data: {
          vendorId:  vendor.id,
          userId:    customer.id,
          rating,
          comment:   Math.random() > 0.2 ? pick(REVIEW_COMMENTS) : null,
          createdAt,
        },
      });
      reviewCount++;
    }

    // Update vendor avgRating & reviewCount
    if (ratings.length > 0) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      await prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: {
          avgRating:   Math.round(avg * 10) / 10,
          reviewCount: ratings.length,
        },
      });
    }
  }
  console.log(`   ✓ ${reviewCount} reviews\n`);

  // ── 7. Inquiries ───────────────────────────────────────────────────────
  console.log('💬 Seeding inquiries...');
  await prisma.inquiry.deleteMany({});
  let inquiryCount = 0;
  const STATUSES = [
    InquiryStatus.NEW, InquiryStatus.NEW, InquiryStatus.NEW,
    InquiryStatus.CONTACTED, InquiryStatus.CONTACTED,
    InquiryStatus.CONFIRMED,
    InquiryStatus.CLOSED,
  ];

  for (const vendor of vendorProfiles) {
    const inquirers = pickN(customerUsers, rand(4, 10));

    for (const customer of inquirers) {
      const daysAgo = rand(1, 300);
      const eventDaysFromNow = rand(30, 600);
      const createdAt = new Date(Date.now() - daysAgo * 86400000);
      const eventDate = new Date(Date.now() + eventDaysFromNow * 86400000);

      await prisma.inquiry.create({
        data: {
          vendorId:  vendor.id,
          userId:    customer.id,
          name:      customer.name,
          email:     `customer${customerUsers.indexOf(customer) + 1}@example.com`,
          phone:     `+9476${String(2000000 + customerUsers.indexOf(customer)).slice(1)}`,
          eventDate: Math.random() > 0.2 ? eventDate : null,
          message:   pick(INQUIRY_MESSAGES),
          status:    pick(STATUSES),
          createdAt,
        },
      });
      inquiryCount++;
    }

    // Also add 2–4 guest inquiries (no userId)
    const guestCount = rand(2, 4);
    for (let g = 0; g < guestCount; g++) {
      await prisma.inquiry.create({
        data: {
          vendorId:  vendor.id,
          userId:    null,
          name:      `Guest ${rand(100, 999)}`,
          email:     `guest${rand(1000, 9999)}@gmail.com`,
          phone:     `+9477${String(rand(1000000, 9999999))}`,
          message:   pick(INQUIRY_MESSAGES),
          status:    pick([InquiryStatus.NEW, InquiryStatus.CONTACTED]),
          createdAt: new Date(Date.now() - rand(1, 200) * 86400000),
        },
      });
      inquiryCount++;
    }
  }
  console.log(`   ✓ ${inquiryCount} inquiries\n`);

  // ── Summary ────────────────────────────────────────────────────────────
  const [totalUsers, totalVendors, totalReviews, totalInquiries] = await Promise.all([
    prisma.user.count(),
    prisma.vendorProfile.count(),
    prisma.review.count(),
    prisma.inquiry.count(),
  ]);

  console.log('✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Users:     ${totalUsers}  (1 admin + ${VENDORS.length} vendors + ${CUSTOMER_NAMES.length} customers)`);
  console.log(`  Vendors:   ${totalVendors}`);
  console.log(`  Reviews:   ${totalReviews}`);
  console.log(`  Inquiries: ${totalInquiries}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Test credentials:');
  console.log('  Admin:  admin@vendorslk.com  / Admin@1234');
  console.log('  Vendor: vendor1@vendorslk.com / Vendor@1234');
  console.log('  Customer: customer1@example.com       / Customer@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => { void prisma.$disconnect(); });

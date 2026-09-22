/**
 * Seed data for local development. Prices are rough 2025-era estimates in MNT
 * per person and exist to demo the product — verify everything before launch.
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { slugify } from "../src/lib/utils";

const db = new PrismaClient();

type SeedPlace = {
  name: string;
  category: string;
  district: string;
  address: string;
  description: string;
  priceMin: number;
  priceMax: number;
  menu?: { name: string; price: number; note?: string }[];
};

/**
 * Approximate WGS84 coordinates, keyed by place name. Good enough to drop a
 * marker roughly where the venue is; verify each one before a public launch.
 */
const COORDS: Record<string, [number, number]> = {
  "Modern Nomads": [47.9195, 106.9145],
  "The Bull Hot Pot": [47.9155, 106.913],
  Hazara: [47.9145, 106.942],
  Veranda: [47.9154, 106.9188],
  "Rosewood Kitchen + Enoteca": [47.9168, 106.913],
  "BD's Mongolian Barbeque": [47.916, 106.9135],
  "Grand Khaan Irish Pub": [47.9158, 106.9152],
  "Mint Club": [47.888, 106.915],
  "Tom N Toms Coffee (Central Tower)": [47.918, 106.917],
  "Caffe Bene (Peace Avenue)": [47.92, 106.905],
  "Cafe Amsterdam": [47.9185, 106.912],
  "Sky Star Karaoke": [47.9175, 106.88],
  "Melody Karaoke Lounge": [47.919, 106.91],
  "State Department Store": [47.9185, 106.905],
  "Shangri-La Mall": [47.9135, 106.919],
  "Hunnu Mall": [47.879, 106.833],
  "Naran Tuul Market": [47.909, 106.95],
  "Urgoo Cinema (Shangri-La)": [47.9135, 106.9192],
  "Tengis Cinema": [47.9215, 106.911],
  "UB Bowling Center": [47.918, 106.885],
  "National Amusement Park": [47.911, 106.908],
  "National Museum of Mongolia": [47.9205, 106.916],
  "Chinggis Khaan National Museum": [47.92, 106.918],
  "Gandantegchinlen Monastery": [47.9235, 106.8945],
  "Sky Resort": [47.845, 106.995],
  "Oasis Spa & Sauna": [47.889, 106.918],
  "Khunnu Craft Beer Taproom": [47.923, 106.93],
};

const places: SeedPlace[] = [
  {
    name: "Modern Nomads",
    category: "RESTAURANT",
    district: "Sukhbaatar",
    address: "Baga Toiruu, near Sukhbaatar Square",
    description:
      "Popular Mongolian cuisine chain — khorkhog, buuz and modern takes on traditional dishes. Good first stop for guests from abroad.",
    priceMin: 25000,
    priceMax: 50000,
    menu: [
      { name: "Buuz (8 pcs)", price: 14000 },
      { name: "Khorkhog set (for 2)", price: 58000 },
      { name: "Suutei tsai", price: 3500 },
    ],
  },
  {
    name: "The Bull Hot Pot",
    category: "RESTAURANT",
    district: "Sukhbaatar",
    address: "Seoul Street",
    description: "Well-known hot pot chain, great for groups on cold evenings.",
    priceMin: 30000,
    priceMax: 60000,
    menu: [
      { name: "Beef set (per person)", price: 35000 },
      { name: "Broth (half & half)", price: 12000 },
    ],
  },
  {
    name: "Hazara",
    category: "RESTAURANT",
    district: "Bayanzurkh",
    address: "Peace Avenue, behind Wrestling Palace",
    description: "Long-running North Indian restaurant, a UB institution.",
    priceMin: 30000,
    priceMax: 60000,
    menu: [
      { name: "Butter chicken", price: 28000 },
      { name: "Garlic naan", price: 6000 },
    ],
  },
  {
    name: "Veranda",
    category: "RESTAURANT",
    district: "Sukhbaatar",
    address: "Jamiyan Gun Street, next to Choijin Lama Temple",
    description:
      "Italian & Mediterranean with a terrace view over the Choijin Lama Temple — a classic date spot.",
    priceMin: 35000,
    priceMax: 70000,
    menu: [
      { name: "Pasta carbonara", price: 26000 },
      { name: "House wine (glass)", price: 15000 },
    ],
  },
  {
    name: "Rosewood Kitchen + Enoteca",
    category: "RESTAURANT",
    district: "Sukhbaatar",
    address: "Downtown, near Beatles Square",
    description: "Cozy bistro popular for brunch and dinner dates.",
    priceMin: 25000,
    priceMax: 55000,
  },
  {
    name: "BD's Mongolian Barbeque",
    category: "RESTAURANT",
    district: "Sukhbaatar",
    address: "Seoul Street",
    description: "Build-your-own stir-fry bowls, all-you-can-eat option.",
    priceMin: 25000,
    priceMax: 45000,
  },
  {
    name: "Grand Khaan Irish Pub",
    category: "BAR_PUB",
    district: "Sukhbaatar",
    address: "Seoul Street, opposite Central Tower",
    description: "The best-known pub in the city center. Live music on weekends.",
    priceMin: 20000,
    priceMax: 50000,
    menu: [
      { name: "Draft beer (0.5L)", price: 9000 },
      { name: "Fish & chips", price: 24000 },
    ],
  },
  {
    name: "Mint Club",
    category: "BAR_PUB",
    district: "Khan-Uul",
    address: "Zaisan area",
    description: "Late-night club popular with the younger crowd. (demo entry)",
    priceMin: 30000,
    priceMax: 80000,
  },
  {
    name: "Tom N Toms Coffee (Central Tower)",
    category: "CAFE",
    district: "Sukhbaatar",
    address: "Central Tower, Sukhbaatar Square",
    description: "Korean coffee chain with a view of the square.",
    priceMin: 8000,
    priceMax: 18000,
    menu: [
      { name: "Americano", price: 7500 },
      { name: "Honey butter bread", price: 12000 },
    ],
  },
  {
    name: "Caffe Bene (Peace Avenue)",
    category: "CAFE",
    district: "Chingeltei",
    address: "Peace Avenue",
    description: "Comfortable chain cafe, reliable Wi-Fi, good for study dates.",
    priceMin: 8000,
    priceMax: 18000,
  },
  {
    name: "Cafe Amsterdam",
    category: "CAFE",
    district: "Sukhbaatar",
    address: "Baga Toiruu",
    description: "Indie cafe with good breakfast; a quiet-morning favourite.",
    priceMin: 10000,
    priceMax: 22000,
  },
  {
    name: "Sky Star Karaoke",
    category: "KARAOKE",
    district: "Bayangol",
    address: "Peace Avenue West (demo entry)",
    description: "Private rooms, big song library incl. Mongolian hits. (demo entry)",
    priceMin: 25000,
    priceMax: 60000,
    menu: [
      { name: "Room, 1hr (weekday)", price: 30000, note: "per room" },
      { name: "Room, 1hr (weekend)", price: 45000, note: "per room" },
    ],
  },
  {
    name: "Melody Karaoke Lounge",
    category: "KARAOKE",
    district: "Sukhbaatar",
    address: "Baga Toiruu (demo entry)",
    description: "Mid-range karaoke with snacks and drinks service. (demo entry)",
    priceMin: 20000,
    priceMax: 50000,
  },
  {
    name: "State Department Store",
    category: "SHOP",
    district: "Chingeltei",
    address: "Peace Avenue 44",
    description:
      "The historic 'Ikh Delguur' — six floors incl. souvenirs and a food court.",
    priceMin: 5000,
    priceMax: 100000,
  },
  {
    name: "Shangri-La Mall",
    category: "SHOP",
    district: "Sukhbaatar",
    address: "Olympic Street 19A",
    description: "Upscale mall with cinema, food court and brand stores.",
    priceMin: 10000,
    priceMax: 200000,
  },
  {
    name: "Hunnu Mall",
    category: "SHOP",
    district: "Khan-Uul",
    address: "Chinggis Avenue, near the airport road",
    description: "Big mall with an IMAX cinema and a dinosaur skeleton display.",
    priceMin: 10000,
    priceMax: 150000,
  },
  {
    name: "Naran Tuul Market",
    category: "SHOP",
    district: "Bayanzurkh",
    address: "Ikh Toiruu East",
    description:
      "The famous 'black market' — cashmere, boots, antiques, everything. Haggle!",
    priceMin: 5000,
    priceMax: 80000,
  },
  {
    name: "Urgoo Cinema (Shangri-La)",
    category: "CINEMA",
    district: "Sukhbaatar",
    address: "Shangri-La Mall, 4F",
    description: "Modern multiplex; most foreign films with Mongolian subtitles.",
    priceMin: 12000,
    priceMax: 25000,
    menu: [
      { name: "Adult ticket (2D, evening)", price: 16000 },
      { name: "Popcorn set", price: 15000 },
    ],
  },
  {
    name: "Tengis Cinema",
    category: "CINEMA",
    district: "Chingeltei",
    address: "Liberty Square",
    description: "Classic downtown cinema, slightly cheaper tickets.",
    priceMin: 10000,
    priceMax: 20000,
  },
  {
    name: "UB Bowling Center",
    category: "ENTERTAINMENT",
    district: "Bayangol",
    address: "Peace Avenue West (demo entry)",
    description: "Bowling lanes, billiards and arcade corner. (demo entry)",
    priceMin: 15000,
    priceMax: 30000,
  },
  {
    name: "National Amusement Park",
    category: "ENTERTAINMENT",
    district: "Sukhbaatar",
    address: "Naadamchdiin Road, south of downtown",
    description: "Rides, paddle boats and the ferris wheel — summer classic.",
    priceMin: 5000,
    priceMax: 30000,
  },
  {
    name: "National Museum of Mongolia",
    category: "CULTURE",
    district: "Chingeltei",
    address: "Juulchin Street 1",
    description: "From the Hunnu empire to the democratic revolution.",
    priceMin: 10000,
    priceMax: 15000,
  },
  {
    name: "Chinggis Khaan National Museum",
    category: "CULTURE",
    district: "Chingeltei",
    address: "Baga Toiruu, near Sukhbaatar Square",
    description: "Huge modern museum on the Mongol empire, opened 2022.",
    priceMin: 15000,
    priceMax: 20000,
  },
  {
    name: "Gandantegchinlen Monastery",
    category: "CULTURE",
    district: "Bayangol",
    address: "Gandan hill, Zanabazar Street",
    description: "UB's main active monastery with the 26m Migjid Janraisig statue.",
    priceMin: 0,
    priceMax: 10000,
  },
  {
    name: "Sky Resort",
    category: "SPORT",
    district: "Bayanzurkh",
    address: "Bogd Khan mountain, 13km from center",
    description: "Ski slopes in winter, golf & lounge in summer.",
    priceMin: 40000,
    priceMax: 90000,
    menu: [
      { name: "Ski pass 4hr (weekday)", price: 45000 },
      { name: "Full gear rental", price: 35000 },
    ],
  },
  {
    name: "Oasis Spa & Sauna",
    category: "BEAUTY_SPA",
    district: "Khan-Uul",
    address: "Zaisan area (demo entry)",
    description: "Spa, sauna and massage packages for couples. (demo entry)",
    priceMin: 50000,
    priceMax: 120000,
  },
];

async function main() {
  console.log("Clearing old data...");
  await db.meetupJoin.deleteMany();
  await db.meetup.deleteMany();
  await db.templateComment.deleteMany();
  await db.templateVote.deleteMany();
  await db.templateItem.deleteMany();
  await db.template.deleteMany();
  await db.review.deleteMany();
  await db.priceItem.deleteMany();
  await db.place.deleteMany();
  await db.user.deleteMany();

  console.log("Creating users...");
  // Passwords are never hardcoded: this repo is public and the database is
  // live, so a committed password is an open admin account. Supply them via
  // env vars, or let the seed mint random ones and print them once at the end.
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? randomBytes(12).toString("base64url");
  const demoPassword =
    process.env.SEED_DEMO_PASSWORD ?? randomBytes(9).toString("base64url");
  const generated = {
    admin: !process.env.SEED_ADMIN_PASSWORD,
    demo: !process.env.SEED_DEMO_PASSWORD,
  };
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const demoHash = await bcrypt.hash(demoPassword, 10);
  const admin = await db.user.create({
    data: { email: "admin@uulzy.mn", name: "Uulzy Admin", passwordHash: adminHash, role: "ADMIN" },
  });
  const bataa = await db.user.create({
    data: { email: "bataa@example.com", name: "Bataa", passwordHash: demoHash, points: 40 },
  });
  const sarnai = await db.user.create({
    data: { email: "sarnai@example.com", name: "Sarnai", passwordHash: demoHash, points: 65 },
  });
  const temuulen = await db.user.create({
    data: { email: "temuulen@example.com", name: "Temuulen", passwordHash: demoHash, points: 20 },
  });
  const demoUsers = [bataa, sarnai, temuulen];

  console.log("Creating places...");
  const bySlug: Record<string, string> = {};
  for (const p of places) {
    const { menu, ...data } = p;
    const slug = slugify(p.name);
    const coords = COORDS[p.name];
    const place = await db.place.create({
      data: {
        ...data,
        slug,
        lat: coords?.[0] ?? null,
        lng: coords?.[1] ?? null,
        status: "APPROVED",
        createdById: admin.id,
        priceItems: menu
          ? {
              create: menu.map((m) => ({
                name: m.name,
                price: m.price,
                note: m.note ?? "",
                status: "APPROVED",
                submittedById: demoUsers[Math.floor(Math.random() * demoUsers.length)].id,
              })),
            }
          : undefined,
      },
    });
    bySlug[slug] = place.id;
  }

  // A couple of pending submissions so the admin queue has content.
  await db.place.create({
    data: {
      name: "Khunnu Craft Beer Taproom",
      slug: slugify("Khunnu Craft Beer Taproom"),
      category: "BAR_PUB",
      district: "Sukhbaatar",
      address: "Student street (demo pending entry)",
      description: "Suggested by a user — awaiting admin approval.",
      lat: COORDS["Khunnu Craft Beer Taproom"][0],
      lng: COORDS["Khunnu Craft Beer Taproom"][1],
      priceMin: 15000,
      priceMax: 40000,
      status: "PENDING",
      createdById: bataa.id,
    },
  });
  await db.priceItem.create({
    data: {
      placeId: bySlug[slugify("Veranda")],
      name: "Tiramisu",
      price: 18000,
      status: "PENDING",
      submittedById: sarnai.id,
    },
  });

  console.log("Creating reviews...");
  const reviewData: [string, typeof bataa, number, string][] = [
    [slugify("Veranda"), bataa, 5, "Terrace at sunset is unbeatable. Book ahead on weekends."],
    [slugify("Veranda"), sarnai, 4, "Lovely view, service a bit slow when full."],
    [slugify("Modern Nomads"), temuulen, 4, "Solid buuz, good for showing guests Mongolian food."],
    [slugify("Grand Khaan Irish Pub"), bataa, 4, "Live band Fridays. Gets crowded after 21:00."],
    [slugify("Sky Resort"), sarnai, 5, "Best slopes near the city, rent gear early."],
    [slugify("Tom N Toms Coffee (Central Tower)"), sarnai, 3, "Nice view but pricey for what it is."],
  ];
  for (const [slug, user, rating, comment] of reviewData) {
    await db.review.create({
      data: { placeId: bySlug[slug], userId: user.id, rating, comment },
    });
  }

  console.log("Creating templates...");
  const classicDate = await db.template.create({
    data: {
      title: "Classic First Date Downtown",
      description:
        "Safe, walkable first-date route in the city center. Works year-round.",
      isPublic: true,
      authorId: sarnai.id,
      items: {
        create: [
          { order: 0, activity: "Coffee & chat", placeId: bySlug[slugify("Tom N Toms Coffee (Central Tower)")], startTime: "15:00", endTime: "16:30", priceMin: 8000, priceMax: 15000 },
          { order: 1, activity: "Walk to museum", placeId: bySlug[slugify("Chinggis Khaan National Museum")], startTime: "16:30", endTime: "18:00", priceMin: 15000, priceMax: 20000 },
          { order: 2, activity: "Dinner with a view", placeId: bySlug[slugify("Veranda")], startTime: "18:30", endTime: "20:30", priceMin: 35000, priceMax: 70000 },
        ],
      },
    },
  });
  const cheapFun = await db.template.create({
    data: {
      title: "Broke Student Weekend",
      description: "Full fun day under 40k per person.",
      isPublic: true,
      authorId: bataa.id,
      items: {
        create: [
          { order: 0, activity: "Morning at Gandan", placeId: bySlug[slugify("Gandantegchinlen Monastery")], startTime: "10:00", endTime: "11:30", priceMin: 0, priceMax: 5000 },
          { order: 1, activity: "Cheap movie", placeId: bySlug[slugify("Tengis Cinema")], startTime: "12:00", endTime: "14:00", priceMin: 10000, priceMax: 15000 },
          { order: 2, activity: "Amusement park", placeId: bySlug[slugify("National Amusement Park")], startTime: "14:30", endTime: "17:00", priceMin: 5000, priceMax: 20000 },
        ],
      },
    },
  });
  const winterDate = await db.template.create({
    data: {
      title: "Winter Adventure Date",
      description: "Ski day at Sky Resort followed by hot pot to warm up.",
      isPublic: true,
      authorId: temuulen.id,
      items: {
        create: [
          { order: 0, activity: "Skiing", placeId: bySlug[slugify("Sky Resort")], startTime: "10:00", endTime: "14:00", priceMin: 60000, priceMax: 90000 },
          { order: 1, activity: "Hot pot dinner", placeId: bySlug[slugify("The Bull Hot Pot")], startTime: "16:00", endTime: "18:00", priceMin: 30000, priceMax: 60000 },
          { order: 2, activity: "Karaoke nightcap", placeId: bySlug[slugify("Sky Star Karaoke")], startTime: "18:30", endTime: "20:00", priceMin: 15000, priceMax: 25000 },
        ],
      },
    },
  });

  const votes: [string, typeof bataa, number][] = [
    [classicDate.id, bataa, 1],
    [classicDate.id, temuulen, 1],
    [classicDate.id, admin, 1],
    [cheapFun.id, sarnai, 1],
    [cheapFun.id, temuulen, 1],
    [winterDate.id, bataa, 1],
    [winterDate.id, sarnai, -1],
  ];
  for (const [templateId, user, value] of votes) {
    await db.templateVote.create({ data: { templateId, userId: user.id, value } });
  }
  await db.templateComment.create({
    data: { templateId: classicDate.id, userId: bataa.id, body: "Tried this last Saturday — museum was the highlight. Book Veranda ahead!" },
  });
  await db.templateComment.create({
    data: { templateId: cheapFun.id, userId: sarnai.id, body: "Amusement park is closed in deep winter, swap for bowling." },
  });

  console.log("Creating meetups...");
  const inDays = (d: number, h: number) => {
    const t = new Date();
    t.setDate(t.getDate() + d);
    t.setHours(h, 0, 0, 0);
    return t;
  };
  const ski = await db.meetup.create({
    data: {
      title: "Saturday ski group — beginners welcome",
      description: "Renting a car to Sky Resort, splitting fuel. I can teach basics!",
      placeId: bySlug[slugify("Sky Resort")],
      location: "",
      dateTime: inDays(3, 9),
      capacity: 5,
      hostId: temuulen.id,
    },
  });
  await db.meetup.create({
    data: {
      title: "Board game night at Cafe Amsterdam",
      description: "Catan, Splendor and whatever you bring. English & Mongolian friendly.",
      placeId: bySlug[slugify("Cafe Amsterdam")],
      location: "",
      dateTime: inDays(5, 19),
      capacity: 8,
      hostId: sarnai.id,
    },
  });
  await db.meetupJoin.create({
    data: { meetupId: ski.id, userId: bataa.id, message: "Total beginner, need gear rental — is that ok?", status: "ACCEPTED" },
  });

  console.log("Seed complete.");
  if (generated.admin || generated.demo) {
    console.log("");
    console.log("  Generated credentials — save these now, they are not stored:");
    if (generated.admin) {
      console.log(`    admin@uulzy.mn   ${adminPassword}`);
    }
    if (generated.demo) {
      console.log(`    demo users       ${demoPassword}`);
    }
    console.log("  Set SEED_ADMIN_PASSWORD / SEED_DEMO_PASSWORD to choose your own.");
    console.log("");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

import { z } from "zod";
import { CATEGORIES, DISTRICTS, parseHM } from "@/lib/utils";
import { publicBaseUrl } from "@/lib/storage";

const categoryValues = CATEGORIES.map((c) => c.value) as [string, ...string[]];
const districtValues = [...DISTRICTS] as [string, ...string[]];

export const registerSchema = z.object({
  email: z.string().email().max(200),
  name: z.string().trim().min(2).max(60),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(100),
});

const priceRange = {
  priceMin: z.number().int().min(0).max(100_000_000),
  priceMax: z.number().int().min(0).max(100_000_000),
};

function checkRange(data: { priceMin: number; priceMax: number }) {
  return data.priceMax >= data.priceMin;
}

export const placeSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    category: z.enum(categoryValues),
    district: z.enum(districtValues),
    address: z.string().trim().min(3).max(300),
    description: z.string().trim().max(2000).default(""),
    imageUrl: z.string().url().max(500).or(z.literal("")).default(""),
    lat: z.number().min(-90).max(90).nullable().default(null),
    lng: z.number().min(-180).max(180).nullable().default(null),
    ...priceRange,
  })
  .refine(checkRange, { message: "priceMax must be >= priceMin" });

/**
 * Only URLs we ourselves handed out from /api/uploads are accepted — never an
 * arbitrary external URL. The value must sit under our own bucket's public
 * base, and the key after it must be a plain path with no traversal.
 */
const uploadPath = z.string().superRefine((value, ctx) => {
  const base = publicBaseUrl();
  const prefix = `${base}/`;
  const invalid = (message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, message });

  if (!base || base.startsWith("/")) {
    invalid("File storage is not configured on this server.");
    return;
  }
  if (!value.startsWith(prefix)) {
    invalid("Invalid upload URL");
    return;
  }
  const key = value.slice(prefix.length);
  if (!/^[A-Za-z0-9][A-Za-z0-9._\-]*(?:\/[A-Za-z0-9][A-Za-z0-9._\-]*)*$/.test(key)) {
    invalid("Invalid upload URL");
  }
});

export const priceItemSchema = z.object({
  name: z.string().trim().min(1).max(150),
  price: z.number().int().min(0).max(100_000_000),
  note: z.string().trim().max(300).default(""),
  photoUrl: uploadPath.or(z.literal("")).default(""),
});

export const activityMediaSchema = z.object({
  url: uploadPath,
  kind: z.enum(["IMAGE", "VIDEO"]),
  caption: z.string().trim().max(300).default(""),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).default(""),
});

const timeString = z
  .string()
  .refine((t) => parseHM(t) !== null, { message: "Time must be HH:MM" });

export const templateItemSchema = z
  .object({
    activity: z.string().trim().min(1).max(150),
    placeId: z.string().max(50).nullable().default(null),
    startTime: timeString,
    endTime: timeString,
    ...priceRange,
  })
  .refine(checkRange, { message: "priceMax must be >= priceMin" });

export const templateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(2000).default(""),
  isPublic: z.boolean().default(false),
  items: z.array(templateItemSchema).min(1).max(20),
});

export const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]), // 0 removes the vote
});

export const commentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const meetupSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(2000).default(""),
  placeId: z.string().max(50).nullable().default(null),
  location: z.string().trim().max(300).default(""),
  dateTime: z.coerce.date(),
  capacity: z.number().int().min(2).max(100),
});

export const joinSchema = z.object({
  message: z.string().trim().max(500).default(""),
});

export const moderationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { placeSchema } from "@/lib/validate";
import { slugify } from "@/lib/utils";
import { ok, handleErrors } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") ?? undefined;
    const district = url.searchParams.get("district") ?? undefined;
    const q = url.searchParams.get("q") ?? undefined;
    const places = await db.place.findMany({
      where: {
        status: "APPROVED",
        ...(category ? { category } : {}),
        ...(district ? { district } : {}),
        ...(q ? { name: { contains: q } } : {}),
      },
      include: { reviews: { select: { rating: true } } },
      orderBy: { name: "asc" },
    });
    return ok({ places });
  } catch (err) {
    return handleErrors(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = placeSchema.parse(await req.json());
    const base = slugify(body.name);
    let slug = base;
    for (let i = 2; await db.place.findUnique({ where: { slug } }); i++) {
      slug = `${base}-${i}`;
    }
    const place = await db.place.create({
      data: { ...body, slug, status: "PENDING", createdById: user.id },
    });
    return ok({ place }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}

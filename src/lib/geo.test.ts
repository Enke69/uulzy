import { describe, expect, it } from "vitest";
import {
  CATEGORY_GROUPS,
  categoriesInGroup,
  directionsUrl,
  formatDistance,
  haversineKm,
  routeDistanceKm,
} from "./utils";
import { checkUpload, uploadFilename, MAX_IMAGE_BYTES } from "./upload";

const SUKHBAATAR_SQ = { lat: 47.9188, lng: 106.9176 };
const GANDAN = { lat: 47.9235, lng: 106.8945 };

describe("category groups", () => {
  it("maps a group to its categories", () => {
    expect(categoriesInGroup("FOOD")).toEqual([
      "RESTAURANT",
      "CAFE",
      "BAR_PUB",
    ]);
  });
  it("returns an empty list for no group or an unknown one", () => {
    expect(categoriesInGroup(undefined)).toEqual([]);
    expect(categoriesInGroup("NOPE")).toEqual([]);
  });
  it("covers every category exactly once across all groups", () => {
    const all = CATEGORY_GROUPS.flatMap((g) => g.categories);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("haversineKm", () => {
  it("is zero for the same point", () => {
    expect(haversineKm(SUKHBAATAR_SQ, SUKHBAATAR_SQ)).toBe(0);
  });
  it("measures a known short UB hop within a sensible range", () => {
    // Sukhbaatar Square to Gandan Monastery is roughly 1.5-2.5km apart.
    const km = haversineKm(SUKHBAATAR_SQ, GANDAN);
    expect(km).toBeGreaterThan(1.5);
    expect(km).toBeLessThan(2.5);
  });
  it("is symmetric", () => {
    expect(haversineKm(SUKHBAATAR_SQ, GANDAN)).toBeCloseTo(
      haversineKm(GANDAN, SUKHBAATAR_SQ),
      10
    );
  });
});

describe("routeDistanceKm", () => {
  it("sums consecutive legs", () => {
    const stops = [SUKHBAATAR_SQ, GANDAN, SUKHBAATAR_SQ];
    expect(routeDistanceKm(stops)).toBeCloseTo(
      haversineKm(SUKHBAATAR_SQ, GANDAN) * 2,
      10
    );
  });
  it("is zero for fewer than two stops", () => {
    expect(routeDistanceKm([])).toBe(0);
    expect(routeDistanceKm([SUKHBAATAR_SQ])).toBe(0);
  });
});

describe("formatDistance", () => {
  it("uses metres under 1km", () => {
    expect(formatDistance(0.4)).toBe("400m");
  });
  it("uses one decimal km above that", () => {
    expect(formatDistance(2.34)).toBe("2.3km");
  });
});

describe("directionsUrl", () => {
  it("is null with fewer than two stops", () => {
    expect(directionsUrl([SUKHBAATAR_SQ])).toBeNull();
  });
  it("puts middle stops in waypoints", () => {
    const url = directionsUrl([SUKHBAATAR_SQ, GANDAN, SUKHBAATAR_SQ])!;
    expect(url).toContain("origin=47.9188%2C106.9176");
    expect(url).toContain("destination=47.9188%2C106.9176");
    expect(url).toContain("waypoints=47.9235%2C106.8945");
  });
  it("omits waypoints for a two-stop route", () => {
    expect(directionsUrl([SUKHBAATAR_SQ, GANDAN])!).not.toContain("waypoints");
  });
});

describe("checkUpload", () => {
  it("accepts a normal jpeg", () => {
    expect(checkUpload("image/jpeg", 1024)).toEqual({
      ok: true,
      kind: "IMAGE",
      ext: "jpg",
    });
  });
  it("accepts mp4 video", () => {
    expect(checkUpload("video/mp4", 1024)).toEqual({
      ok: true,
      kind: "VIDEO",
      ext: "mp4",
    });
  });
  it("tolerates a charset suffix and odd casing", () => {
    expect(checkUpload("IMAGE/PNG; charset=binary", 10).ok).toBe(true);
  });
  it("rejects disallowed types", () => {
    expect(checkUpload("application/pdf", 10).ok).toBe(false);
    expect(checkUpload("text/html", 10).ok).toBe(false);
    expect(checkUpload("", 10).ok).toBe(false);
  });
  it("rejects empty files", () => {
    expect(checkUpload("image/png", 0).ok).toBe(false);
  });
  it("enforces the image size cap", () => {
    expect(checkUpload("image/png", MAX_IMAGE_BYTES).ok).toBe(true);
    expect(checkUpload("image/png", MAX_IMAGE_BYTES + 1).ok).toBe(false);
  });
});

describe("uploadFilename", () => {
  it("ends with the given extension and has no path separators", () => {
    const name = uploadFilename("jpg");
    expect(name.endsWith(".jpg")).toBe(true);
    expect(name).not.toMatch(/[/\\]/);
  });
  it("does not collide across calls", () => {
    const names = new Set(Array.from({ length: 50 }, () => uploadFilename("png")));
    expect(names.size).toBe(50);
  });
});

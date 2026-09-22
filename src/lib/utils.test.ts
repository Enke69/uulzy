import { describe, expect, it } from "vitest";
import {
  averageRating,
  computeTotals,
  formatDuration,
  formatMNT,
  formatRange,
  itemDurationMin,
  parseHM,
  priceTier,
  slugify,
  voteScore,
} from "./utils";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Modern Nomads")).toBe("modern-nomads");
  });
  it("strips punctuation and collapses runs", () => {
    expect(slugify("BD's Mongolian Barbeque!")).toBe("bd-s-mongolian-barbeque");
  });
  it("keeps Cyrillic letters", () => {
    expect(slugify("Их Дэлгүүр")).toBe("их-дэлгүүр");
  });
  it("falls back for empty result", () => {
    expect(slugify("!!!")).toBe("place");
  });
});

describe("money formatting", () => {
  it("formats MNT with separators", () => {
    expect(formatMNT(25000)).toBe("25,000₮");
  });
  it("formats a range", () => {
    expect(formatRange(25000, 40000)).toBe("25,000–40,000₮");
  });
  it("collapses equal min/max", () => {
    expect(formatRange(5000, 5000)).toBe("5,000₮");
  });
});

describe("priceTier", () => {
  it("maps average spend to tiers 1-4", () => {
    expect(priceTier(5000, 10000)).toBe(1);
    expect(priceTier(20000, 40000)).toBe(2);
    expect(priceTier(50000, 90000)).toBe(3);
    expect(priceTier(100000, 200000)).toBe(4);
  });
});

describe("time parsing and durations", () => {
  it("parses HH:MM", () => {
    expect(parseHM("09:30")).toBe(570);
    expect(parseHM("23:59")).toBe(1439);
  });
  it("rejects malformed times", () => {
    expect(parseHM("25:00")).toBeNull();
    expect(parseHM("12:75")).toBeNull();
    expect(parseHM("noon")).toBeNull();
  });
  it("computes duration inside a day", () => {
    expect(
      itemDurationMin({ startTime: "18:00", endTime: "20:30", priceMin: 0, priceMax: 0 })
    ).toBe(150);
  });
  it("treats end before start as crossing midnight", () => {
    expect(
      itemDurationMin({ startTime: "23:00", endTime: "01:00", priceMin: 0, priceMax: 0 })
    ).toBe(120);
  });
});

describe("computeTotals", () => {
  it("sums prices and durations across items", () => {
    const totals = computeTotals([
      { startTime: "15:00", endTime: "16:30", priceMin: 8000, priceMax: 15000 },
      { startTime: "18:30", endTime: "20:30", priceMin: 35000, priceMax: 70000 },
    ]);
    expect(totals).toEqual({
      totalMin: 43000,
      totalMax: 85000,
      totalMinutes: 90 + 120,
    });
  });
  it("returns zeros for no items", () => {
    expect(computeTotals([])).toEqual({ totalMin: 0, totalMax: 0, totalMinutes: 0 });
  });
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(45)).toBe("45min");
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(210)).toBe("3h 30min");
  });
});

describe("voteScore", () => {
  it("sums up and down votes", () => {
    expect(voteScore([{ value: 1 }, { value: 1 }, { value: -1 }])).toBe(1);
    expect(voteScore([])).toBe(0);
  });
});

describe("averageRating", () => {
  it("averages to one decimal", () => {
    expect(averageRating([{ rating: 5 }, { rating: 4 }])).toBe(4.5);
    expect(averageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toBe(4.3);
  });
  it("is null with no reviews", () => {
    expect(averageRating([])).toBeNull();
  });
});

import L from "leaflet";
import { categoryEmoji } from "@/lib/utils";

/**
 * Leaflet's default marker icons are loaded from relative image paths that
 * bundlers rewrite, so we draw our own emoji pins instead — no image assets.
 */
export function emojiPin(category: string, highlighted = false): L.DivIcon {
  return L.divIcon({
    className: "uulzy-pin",
    html: `<span class="uulzy-pin-inner${highlighted ? " uulzy-pin-hi" : ""}">${categoryEmoji(category)}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}

/** Numbered pin for the stops on a plan's route. */
export function numberPin(n: number): L.DivIcon {
  return L.divIcon({
    className: "uulzy-pin",
    html: `<span class="uulzy-pin-inner uulzy-pin-num">${n}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}

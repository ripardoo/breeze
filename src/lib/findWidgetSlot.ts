import type { LayoutItem } from "react-grid-layout";
import { GRID_COLS, GRID_ROWS } from "@/lib/gridConfig";

/**
 * Check if two rectangles overlap.
 * Rectangles are defined by (x, y) top-left and (w, h) size.
 */
function overlaps(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/**
 * Find the first available slot for a widget of the given size.
 * Searches row by row (y), then column by column (x).
 * Returns { x, y } or null if no space found.
 */
export function findFirstAvailableSlot(
  layout: LayoutItem[],
  w: number,
  h: number,
  cols: number = GRID_COLS,
  maxRows: number = GRID_ROWS,
): { x: number; y: number } | null {
  for (let y = 0; y <= maxRows - h; y++) {
    for (let x = 0; x <= cols - w; x++) {
      const hasOverlap = layout.some((item) =>
        overlaps(x, y, w, h, item.x, item.y, item.w, item.h),
      );
      if (!hasOverlap) {
        return { x, y };
      }
    }
  }
  return null;
}

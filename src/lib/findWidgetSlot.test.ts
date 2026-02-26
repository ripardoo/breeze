import { describe, it, expect } from "vitest";
import { findFirstAvailableSlot } from "./findWidgetSlot";
import type { LayoutItem } from "react-grid-layout";

describe("findFirstAvailableSlot", () => {
  it("returns (0,0) for an empty layout", () => {
    const result = findFirstAvailableSlot([], 2, 2);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it("returns the next open column when first slot is occupied", () => {
    const layout: LayoutItem[] = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];
    const result = findFirstAvailableSlot(layout, 2, 2);
    expect(result).toEqual({ x: 2, y: 0 });
  });

  it("wraps to the next row when the first row is full", () => {
    const layout: LayoutItem[] = [];
    const cols = 4;
    for (let x = 0; x < cols; x += 2) {
      layout.push({ i: `w${x}`, x, y: 0, w: 2, h: 2 });
    }
    const result = findFirstAvailableSlot(layout, 2, 2, cols, 4);
    expect(result).toEqual({ x: 0, y: 2 });
  });

  it("finds a gap between occupied slots", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
      { i: "b", x: 2, y: 0, w: 1, h: 1 },
    ];
    const result = findFirstAvailableSlot(layout, 1, 1, 4, 4);
    expect(result).toEqual({ x: 1, y: 0 });
  });

  it("returns null when the grid is completely full", () => {
    const cols = 4;
    const rows = 2;
    const layout: LayoutItem[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        layout.push({ i: `w${x}_${y}`, x, y, w: 1, h: 1 });
      }
    }
    const result = findFirstAvailableSlot(layout, 1, 1, cols, rows);
    expect(result).toBeNull();
  });

  it("returns null when no valid position exists around a large widget", () => {
    // 3x3 widget in a 4x4 grid leaves no space for a 2x2 widget
    const layout: LayoutItem[] = [{ i: "big", x: 0, y: 0, w: 3, h: 3 }];
    const result = findFirstAvailableSlot(layout, 2, 2, 4, 4);
    expect(result).toBeNull();
  });

  it("finds slot below a widget when grid is tall enough", () => {
    // 3x3 widget in a 4x6 grid — 2x2 fits at (0,3)
    const layout: LayoutItem[] = [{ i: "big", x: 0, y: 0, w: 3, h: 3 }];
    const result = findFirstAvailableSlot(layout, 2, 2, 4, 6);
    expect(result).toEqual({ x: 0, y: 3 });
  });

  it("returns null when widget does not fit at all", () => {
    const result = findFirstAvailableSlot([], 5, 5, 4, 4);
    expect(result).toBeNull();
  });

  it("handles a 1x1 widget in a tight grid", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
      { i: "b", x: 1, y: 0, w: 1, h: 1 },
      { i: "c", x: 0, y: 1, w: 1, h: 1 },
    ];
    const result = findFirstAvailableSlot(layout, 1, 1, 2, 2);
    expect(result).toEqual({ x: 1, y: 1 });
  });

  it("uses default cols and maxRows from gridConfig", () => {
    const result = findFirstAvailableSlot([], 1, 1);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it("handles overlapping existing items correctly", () => {
    const layout: LayoutItem[] = [{ i: "a", x: 0, y: 0, w: 3, h: 1 }];
    // w=2 widget can't fit at x=3 (only 1 col left), so it goes to row 1
    const result = findFirstAvailableSlot(layout, 2, 1, 4, 2);
    expect(result).toEqual({ x: 0, y: 1 });
  });
});

import { describe, it, expect } from "vitest";
import {
  GRID_COLS,
  GRID_ROWS,
  GRID_GAP,
  GRID_PADDING,
  DEFAULT_WIDGET_W,
  DEFAULT_WIDGET_H,
} from "./gridConfig";

describe("gridConfig", () => {
  it("exports expected grid dimensions", () => {
    expect(GRID_COLS).toBe(32);
    expect(GRID_ROWS).toBe(18);
  });

  it("exports expected spacing values", () => {
    expect(GRID_GAP).toBe(8);
    expect(GRID_PADDING).toBe(8);
  });

  it("exports expected default widget size", () => {
    expect(DEFAULT_WIDGET_W).toBe(2);
    expect(DEFAULT_WIDGET_H).toBe(2);
  });

  it("default widget fits within the grid", () => {
    expect(DEFAULT_WIDGET_W).toBeLessThanOrEqual(GRID_COLS);
    expect(DEFAULT_WIDGET_H).toBeLessThanOrEqual(GRID_ROWS);
  });
});

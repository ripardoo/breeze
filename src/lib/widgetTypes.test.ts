import { describe, it, expect } from "vitest";
import { WIDGET_TYPES, WIDGET_TYPE_LIST, getDefaultMetadata } from "./widgetTypes";

describe("WIDGET_TYPE_LIST", () => {
  it("contains link and notes", () => {
    expect(WIDGET_TYPE_LIST).toContain("link");
    expect(WIDGET_TYPE_LIST).toContain("notes");
    expect(WIDGET_TYPE_LIST).toHaveLength(2);
  });
});

describe("WIDGET_TYPES", () => {
  it("provides label and type for each widget type", () => {
    expect(WIDGET_TYPES).toEqual([
      { type: "link", label: "Link" },
      { type: "notes", label: "Notes" },
    ]);
  });
});

describe("getDefaultMetadata", () => {
  it("returns default metadata for link type", () => {
    const meta = getDefaultMetadata("link");
    expect(meta).toEqual({
      type: "link",
      title: "Link",
      data: { url: "" },
    });
  });

  it("returns default metadata for notes type", () => {
    const meta = getDefaultMetadata("notes");
    expect(meta).toEqual({
      type: "notes",
      title: "Notes",
      data: { content: "" },
    });
  });

  it("returns a new object each time (not a reference)", () => {
    const meta1 = getDefaultMetadata("link");
    const meta2 = getDefaultMetadata("link");
    expect(meta1).toEqual(meta2);
    expect(meta1).not.toBe(meta2);
  });
});

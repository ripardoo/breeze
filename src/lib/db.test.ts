import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDefaultStore } from "jotai";
import { dbAtom } from "@/atoms";

vi.mock("@tauri-apps/plugin-sql", () => {
  return import("@/test/mocks/tauri-plugin-sql");
});

import { mockDb } from "@/test/mocks/tauri-plugin-sql";
import {
  loadDb,
  getDashboards,
  createDashboard,
  updateDashboard,
  reorderDashboards,
  deleteDashboard,
  getWidgets,
  upsertWidgets,
  deleteWidget,
} from "./db";

function injectMockDb() {
  const store = getDefaultStore();
  store.set(dbAtom, mockDb as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  injectMockDb();
});

describe("loadDb", () => {
  it("calls Database.load and returns the database instance", async () => {
    const db = await loadDb();
    expect(db).toBeDefined();
  });
});

describe("getDashboards", () => {
  it("executes SELECT query and returns rows", async () => {
    const rows = [
      { id: "1", name: "Dashboard 1", sort_order: 0, created_at: "", updated_at: "" },
    ];
    mockDb.select.mockResolvedValueOnce(rows);

    const result = await getDashboards();
    expect(result).toEqual(rows);
    expect(mockDb.select).toHaveBeenCalledWith(
      "SELECT * FROM dashboards ORDER BY sort_order ASC",
    );
  });

  it("returns empty array when select returns non-array", async () => {
    mockDb.select.mockResolvedValueOnce(null);
    const result = await getDashboards();
    expect(result).toEqual([]);
  });
});

describe("createDashboard", () => {
  it("inserts a new dashboard and returns it", async () => {
    mockDb.select.mockResolvedValueOnce([]);

    const dashboard = await createDashboard("My Dashboard");

    expect(dashboard.name).toBe("My Dashboard");
    expect(dashboard.sort_order).toBe(0);
    expect(dashboard.id).toBeDefined();
    expect(mockDb.execute).toHaveBeenCalledWith(
      "INSERT INTO dashboards (id, name, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
      expect.arrayContaining(["My Dashboard", 0]),
    );
  });

  it("sets sort_order based on existing dashboard count", async () => {
    mockDb.select.mockResolvedValueOnce([
      { id: "1", name: "A", sort_order: 0, created_at: "", updated_at: "" },
      { id: "2", name: "B", sort_order: 1, created_at: "", updated_at: "" },
    ]);

    const dashboard = await createDashboard("Third");
    expect(dashboard.sort_order).toBe(2);
  });
});

describe("updateDashboard", () => {
  it("updates the name when provided", async () => {
    await updateDashboard("abc", { name: "Renamed" });

    expect(mockDb.execute).toHaveBeenCalledWith(
      "UPDATE dashboards SET name = $1, updated_at = $2 WHERE id = $3",
      expect.arrayContaining(["Renamed", "abc"]),
    );
  });

  it("updates sort_order when provided", async () => {
    await updateDashboard("abc", { sort_order: 5 });

    expect(mockDb.execute).toHaveBeenCalledWith(
      "UPDATE dashboards SET sort_order = $1, updated_at = $2 WHERE id = $3",
      expect.arrayContaining([5, "abc"]),
    );
  });

  it("updates both name and sort_order when both provided", async () => {
    await updateDashboard("abc", { name: "New", sort_order: 3 });
    expect(mockDb.execute).toHaveBeenCalledTimes(2);
  });
});

describe("reorderDashboards", () => {
  it("updates sort_order for each dashboard", async () => {
    await reorderDashboards(["id-b", "id-a", "id-c"]);

    expect(mockDb.execute).toHaveBeenCalledTimes(3);
    expect(mockDb.execute).toHaveBeenCalledWith(
      "UPDATE dashboards SET sort_order = $1, updated_at = $2 WHERE id = $3",
      expect.arrayContaining([0, "id-b"]),
    );
    expect(mockDb.execute).toHaveBeenCalledWith(
      "UPDATE dashboards SET sort_order = $1, updated_at = $2 WHERE id = $3",
      expect.arrayContaining([1, "id-a"]),
    );
    expect(mockDb.execute).toHaveBeenCalledWith(
      "UPDATE dashboards SET sort_order = $1, updated_at = $2 WHERE id = $3",
      expect.arrayContaining([2, "id-c"]),
    );
  });
});

describe("deleteDashboard", () => {
  it("deletes widgets first then the dashboard", async () => {
    await deleteDashboard("dash-1");

    expect(mockDb.execute).toHaveBeenCalledTimes(2);
    expect(mockDb.execute).toHaveBeenNthCalledWith(
      1,
      "DELETE FROM widgets WHERE dashboard_id = $1",
      ["dash-1"],
    );
    expect(mockDb.execute).toHaveBeenNthCalledWith(
      2,
      "DELETE FROM dashboards WHERE id = $1",
      ["dash-1"],
    );
  });
});

describe("getWidgets", () => {
  it("returns layout items mapped from database rows", async () => {
    const rows = [
      { id: "w1", x: 0, y: 0, w: 2, h: 2 },
      { id: "w2", x: 4, y: 1, w: 3, h: 1 },
    ];
    mockDb.select.mockResolvedValueOnce(rows);

    const result = await getWidgets("dash-1");
    expect(result).toEqual([
      { i: "w1", x: 0, y: 0, w: 2, h: 2 },
      { i: "w2", x: 4, y: 1, w: 3, h: 1 },
    ]);
    expect(mockDb.select).toHaveBeenCalledWith(
      "SELECT id, x, y, w, h FROM widgets WHERE dashboard_id = $1",
      ["dash-1"],
    );
  });

  it("returns empty array for non-array response", async () => {
    mockDb.select.mockResolvedValueOnce(undefined);
    const result = await getWidgets("dash-1");
    expect(result).toEqual([]);
  });
});

describe("upsertWidgets", () => {
  it("deletes existing widgets then inserts new ones", async () => {
    const layout = [
      { i: "w1", x: 0, y: 0, w: 2, h: 2 },
      { i: "w2", x: 3, y: 0, w: 1, h: 1 },
    ];

    await upsertWidgets("dash-1", layout);

    expect(mockDb.execute).toHaveBeenCalledTimes(3);
    expect(mockDb.execute).toHaveBeenNthCalledWith(
      1,
      "DELETE FROM widgets WHERE dashboard_id = $1",
      ["dash-1"],
    );
    expect(mockDb.execute).toHaveBeenNthCalledWith(
      2,
      "INSERT INTO widgets (id, dashboard_id, x, y, w, h, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      expect.arrayContaining(["w1", "dash-1", 0, 0, 2, 2]),
    );
  });

  it("only deletes when layout is empty", async () => {
    await upsertWidgets("dash-1", []);
    expect(mockDb.execute).toHaveBeenCalledTimes(1);
    expect(mockDb.execute).toHaveBeenCalledWith(
      "DELETE FROM widgets WHERE dashboard_id = $1",
      ["dash-1"],
    );
  });
});

describe("deleteWidget", () => {
  it("deletes a single widget by id", async () => {
    await deleteWidget("w-42");
    expect(mockDb.execute).toHaveBeenCalledWith(
      "DELETE FROM widgets WHERE id = $1",
      ["w-42"],
    );
  });
});

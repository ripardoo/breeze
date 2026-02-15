import Database from "@tauri-apps/plugin-sql";
import { getDefaultStore } from "jotai";
import type { LayoutItem } from "react-grid-layout";
import { dbAtom } from "@/atoms";
import type { Dashboard } from "@/atoms";

const DB_PATH = "sqlite:breeze.db";

function getDb(): Database {
  const db = getDefaultStore().get(dbAtom);
  if (!db) throw new Error("Database not initialized");
  return db;
}

export async function loadDb(): Promise<Database> {
  const db = await Database.load(DB_PATH);
  return db;
}

export async function getDashboards(): Promise<Dashboard[]> {
  const db = getDb();
  const rows = await db.select<Dashboard[]>("SELECT * FROM dashboards ORDER BY sort_order ASC");
  return Array.isArray(rows) ? rows : [];
}

export async function createDashboard(name: string): Promise<Dashboard> {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const dashboards = await getDashboards();
  const sort_order = dashboards.length;

  await db.execute(
    "INSERT INTO dashboards (id, name, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
    [id, name, sort_order, now, now],
  );

  return { id, name, sort_order, created_at: now, updated_at: now };
}

export async function updateDashboard(id: string, updates: { name?: string; sort_order?: number }): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  if (updates.name !== undefined) {
    await db.execute("UPDATE dashboards SET name = $1, updated_at = $2 WHERE id = $3", [updates.name, now, id]);
  }
  if (updates.sort_order !== undefined) {
    await db.execute("UPDATE dashboards SET sort_order = $1, updated_at = $2 WHERE id = $3", [updates.sort_order, now, id]);
  }
}

export async function reorderDashboards(orderedIds: string[]): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  for (let i = 0; i < orderedIds.length; i++) {
    await db.execute(
      "UPDATE dashboards SET sort_order = $1, updated_at = $2 WHERE id = $3",
      [i, now, orderedIds[i]],
    );
  }
}

export async function deleteDashboard(id: string): Promise<void> {
  const db = getDb();
  await db.execute("DELETE FROM widgets WHERE dashboard_id = $1", [id]);
  await db.execute("DELETE FROM dashboards WHERE id = $1", [id]);
}

export async function getWidgets(dashboardId: string): Promise<LayoutItem[]> {
  const db = getDb();
  const rows = await db.select<{ id: string; x: number; y: number; w: number; h: number }[]>(
    "SELECT id, x, y, w, h FROM widgets WHERE dashboard_id = $1",
    [dashboardId],
  );

  if (!Array.isArray(rows)) return [];

  return rows.map((r) => ({
    i: r.id,
    x: r.x,
    y: r.y,
    w: r.w,
    h: r.h,
  }));
}

export async function upsertWidgets(dashboardId: string, layout: LayoutItem[]): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  await db.execute("DELETE FROM widgets WHERE dashboard_id = $1", [dashboardId]);

  for (const item of layout) {
    await db.execute(
      "INSERT INTO widgets (id, dashboard_id, x, y, w, h, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [item.i, dashboardId, item.x, item.y, item.w, item.h, now],
    );
  }
}

export async function deleteWidget(id: string): Promise<void> {
  const db = getDb();
  await db.execute("DELETE FROM widgets WHERE id = $1", [id]);
}

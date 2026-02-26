import Database from "@tauri-apps/plugin-sql";
import { getDefaultStore } from "jotai";
import type { LayoutItem } from "react-grid-layout";
import { dbAtom } from "@/atoms";
import type { Dashboard, WidgetMetadata } from "@/atoms";
import { getEntry } from "@/lib/widgetRegistry";

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
  const result = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM dashboards",
  );
  const sort_order = Array.isArray(result) && result[0] ? result[0].count : 0;

  await db.execute(
    "INSERT INTO dashboards (id, name, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
    [id, name, sort_order, now, now],
  );

  return { id, name, sort_order, created_at: now, updated_at: now };
}

export async function updateDashboard(
  id: string,
  updates: { name?: string; sort_order?: number },
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.name !== undefined) {
    params.push(updates.name);
    fields.push(`name = $${params.length}`);
  }
  if (updates.sort_order !== undefined) {
    params.push(updates.sort_order);
    fields.push(`sort_order = $${params.length}`);
  }
  if (fields.length === 0) return;

  params.push(now);
  fields.push(`updated_at = $${params.length}`);
  params.push(id);

  await db.execute(
    `UPDATE dashboards SET ${fields.join(", ")} WHERE id = $${params.length}`,
    params,
  );
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

export async function getWidgets(dashboardId: string): Promise<{
  layout: LayoutItem[];
  metadata: Record<string, WidgetMetadata>;
}> {
  const db = getDb();
  const rows = await db.select<
    {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
      type: string;
      title: string | null;
      data: string | null;
    }[]
  >("SELECT id, x, y, w, h, type, title, data FROM widgets WHERE dashboard_id = $1", [dashboardId]);

  if (!Array.isArray(rows)) return { layout: [], metadata: {} };

  const layout: LayoutItem[] = [];
  const metadata: Record<string, WidgetMetadata> = {};

  for (const r of rows) {
    const entry = getEntry(r.type);
    if (!entry) continue;

    let raw: unknown = {};
    try {
      raw = r.data ? JSON.parse(r.data) : {};
    } catch {
      raw = {};
    }

    layout.push({ i: r.id, x: r.x, y: r.y, w: r.w, h: r.h });
    metadata[r.id] = {
      type: r.type,
      title: r.title ?? entry.defaultTitle,
      data: entry.parseData(raw),
    };
  }

  return { layout, metadata };
}

export async function upsertWidgets(
  dashboardId: string,
  layout: LayoutItem[],
  metadata: Record<string, WidgetMetadata>,
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  await db.execute("DELETE FROM widgets WHERE dashboard_id = $1", [dashboardId]);

  for (const item of layout) {
    const meta = metadata[item.i];
    const type = meta?.type ?? "unknown";
    const title = meta?.title ?? null;
    const data = meta?.data ? JSON.stringify(meta.data) : null;

    await db.execute(
      "INSERT INTO widgets (id, dashboard_id, x, y, w, h, type, title, data, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [item.i, dashboardId, item.x, item.y, item.w, item.h, type, title, data, now],
    );
  }
}

export async function deleteWidget(id: string): Promise<void> {
  const db = getDb();
  await db.execute("DELETE FROM widgets WHERE id = $1", [id]);
}

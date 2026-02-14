import { atom } from "jotai";
import type Database from "@tauri-apps/plugin-sql";
import type { LayoutItem } from "react-grid-layout";

export interface Dashboard {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const dbAtom = atom<Database | null>(null);
export const isDbReadyAtom = atom(false);

export const dashboardsAtom = atom<Dashboard[]>([]);
export const activeDashboardIdAtom = atom<string | null>(null);
export const layoutAtom = atom<LayoutItem[]>([]);

export const activeDashboardAtom = atom((get) => {
  const dashboards = get(dashboardsAtom);
  const activeId = get(activeDashboardIdAtom);
  if (!activeId) return null;
  return dashboards.find((d) => d.id === activeId) ?? null;
});

export const toastMessageAtom = atom<string | null>(null);

export const editViewAtom = atom<boolean>(false);

export type WidgetType = "link" | "notes";

export interface WidgetMetadata {
  type: WidgetType;
  title?: string;
  data?: Record<string, unknown>;
}

export const widgetMetadataAtom = atom<Record<string, WidgetMetadata>>({});

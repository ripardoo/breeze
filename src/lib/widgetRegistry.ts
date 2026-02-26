import type React from "react";

export type WidgetData = Record<string, unknown>;

// TData has no `extends` constraint so plain interfaces work (e.g. `{ url: string }`)
export interface WidgetComponentProps<TData = WidgetData> {
  id: string;
  data: TData;
}

export interface WidgetRegistryEntry {
  type: string;
  label: string;
  icon: React.ReactNode;
  defaultTitle: string;
  defaultData: WidgetData;
  parseData: (raw: unknown) => WidgetData;
  // `any` in the component param avoids contravariance errors when registering
  // typed components (e.g. FC<WidgetComponentProps<LinkData>>)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<WidgetComponentProps<any>>;
}

const registry = new Map<string, WidgetRegistryEntry>();

export function register(entry: WidgetRegistryEntry): void {
  registry.set(entry.type, entry);
}

export function getEntry(type: string): WidgetRegistryEntry | undefined {
  return registry.get(type);
}

export function getAllEntries(): WidgetRegistryEntry[] {
  return Array.from(registry.values());
}

import type { WidgetMetadata, WidgetType } from "@/atoms";

export const WIDGET_TYPE_LIST: WidgetType[] = ["link", "notes"];

export interface WidgetTypeInfo {
  type: WidgetType;
  label: string;
}

export const WIDGET_TYPES: WidgetTypeInfo[] = [
  { type: "link", label: "Link" },
  { type: "notes", label: "Notes" },
];

const defaultMetadataMap: Record<WidgetType, WidgetMetadata> = {
  link: { type: "link", title: "Link", data: { url: "" } },
  notes: { type: "notes", title: "Notes", data: { content: "" } },
};

export function getDefaultMetadata(type: WidgetType): WidgetMetadata {
  return { ...defaultMetadataMap[type] };
}

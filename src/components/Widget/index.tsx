import type React from "react";
import type { WidgetMetadata } from "@/atoms";
import { getEntry } from "@/lib/widgetRegistry";
import Widget from "./Widget";

export { Widget };

export function renderWidget(
  id: string,
  metadata: WidgetMetadata,
  onClose: () => void,
): React.ReactElement {
  const entry = getEntry(metadata.type);
  const title = metadata.title ?? entry?.defaultTitle ?? "Widget";
  const WidgetComponent = entry?.component;
  const body = WidgetComponent ? (
    <WidgetComponent id={id} data={metadata.data} />
  ) : (
    <div className="text-sm text-base-content/50">Unknown widget type</div>
  );

  return (
    <Widget id={id} title={title} onClose={onClose}>
      {body}
    </Widget>
  );
}

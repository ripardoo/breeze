import type React from "react";
import type { WidgetMetadata } from "@/atoms";
import { getDefaultMetadata } from "@/lib/widgetTypes";
import Widget from "./Widget";
import LinkWidget from "./LinkWidget";
import NotesWidget from "./NotesWidget";

export { Widget, LinkWidget, NotesWidget };

export function renderWidget(
  id: string,
  metadata: WidgetMetadata,
  onClose: () => void,
): React.ReactElement {
  const defaultMeta = getDefaultMetadata(metadata.type);
  const title = metadata.title ?? defaultMeta.title ?? "Widget";

  const body =
    metadata.type === "link" ? (
      <LinkWidget id={id} metadata={metadata} />
    ) : metadata.type === "notes" ? (
      <NotesWidget id={id} metadata={metadata} />
    ) : (
      <div className="text-sm text-base-content/50">Unknown widget type</div>
    );

  return (
    <Widget id={id} title={title} onClose={onClose}>
      {body}
    </Widget>
  );
}

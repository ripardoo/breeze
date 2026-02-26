import { useAtomValue } from "jotai";
import { editViewAtom } from "@/atoms";
import type { WidgetMetadata } from "@/atoms";
import { getEntry } from "@/lib/widgetRegistry";
import Widget from "./Widget";

export { Widget };

interface WidgetRendererProps {
  id: string;
  metadata: WidgetMetadata;
  onClose: () => void;
}

export function WidgetRenderer({ id, metadata, onClose }: WidgetRendererProps) {
  const isEditView = useAtomValue(editViewAtom);
  const entry = getEntry(metadata.type);
  const title = metadata.title ?? entry?.defaultTitle ?? "Widget";

  const WidgetComponent =
    isEditView && entry?.editComponent ? entry.editComponent : entry?.component;

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

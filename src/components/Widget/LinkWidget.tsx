import { useAtomValue } from "jotai";
import { widgetMetadataAtom } from "@/atoms";
import type { WidgetMetadata } from "@/atoms";

interface LinkWidgetProps {
  id: string;
  metadata: WidgetMetadata;
}

function LinkWidget({ id, metadata }: LinkWidgetProps) {
  const widgetMetadata = useAtomValue(widgetMetadataAtom);

  const meta = widgetMetadata[id] ?? metadata;
  const url = (meta.data?.url as string) ?? "";
  const title = meta.title ?? "Link";

  const displayLabel = title || url || "Add a link";
  const href = url || "#";
  const isPlaceholder = !url;

  const handleClick = (e: React.MouseEvent) => {
    if (isPlaceholder) {
      e.preventDefault();
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`link link-primary block h-full w-full p-2 flex items-center text-sm ${
        isPlaceholder ? "link-hover text-base-content/50 cursor-default" : ""
      }`}
    >
      <span className="truncate w-full">{displayLabel}</span>
    </a>
  );
}

export default LinkWidget;

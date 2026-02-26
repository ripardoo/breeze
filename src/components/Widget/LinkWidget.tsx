import { useSetAtom } from "jotai";
import { widgetMetadataAtom } from "@/atoms";
import type { WidgetComponentProps } from "@/lib/widgetRegistry";

interface LinkData {
  url: string;
}

function LinkWidget({ data }: WidgetComponentProps<LinkData>) {
  const url = data.url;
  const displayLabel = url || "Add a link";
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
      className={`link link-primary h-full w-full p-2 flex items-center text-sm ${
        isPlaceholder ? "link-hover text-base-content/50 cursor-default" : ""
      }`}
    >
      <span className="truncate w-full">{displayLabel}</span>
    </a>
  );
}

export function LinkWidgetEditor({ id, data }: WidgetComponentProps<LinkData>) {
  const setWidgetMetadata = useSetAtom(widgetMetadataAtom);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidgetMetadata((prev) => ({
      ...prev,
      [id]: { ...prev[id], data: { url: e.target.value } },
    }));
  };

  return (
    <div className="flex items-center h-full w-full p-2">
      <input
        type="url"
        className="input input-sm input-ghost w-full"
        placeholder="https://..."
        value={data.url}
        onChange={handleChange}
      />
    </div>
  );
}

export default LinkWidget;

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
      className={`link link-primary block h-full w-full p-2 flex items-center text-sm ${
        isPlaceholder ? "link-hover text-base-content/50 cursor-default" : ""
      }`}
    >
      <span className="truncate w-full">{displayLabel}</span>
    </a>
  );
}

export default LinkWidget;

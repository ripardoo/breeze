import { useSetAtom } from "jotai";
import { widgetMetadataAtom } from "@/atoms";
import type { WidgetComponentProps } from "@/lib/widgetRegistry";

interface IframeData {
  url: string;
}

function IframeWidget({ data }: WidgetComponentProps<IframeData>) {
  const url = data.url.trim();

  if (!url) {
    return (
      <div className="h-full w-full p-2 flex items-center justify-center text-sm text-base-content/50">
        Add an iframe URL in edit mode
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2">
      <iframe
        src={url}
        title="Embedded content"
        className="h-full w-full rounded-md border border-base-300 bg-base-100"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export function IframeWidgetEditor({ id, data }: WidgetComponentProps<IframeData>) {
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

export default IframeWidget;

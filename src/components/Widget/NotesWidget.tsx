import { useAtomValue, useSetAtom } from "jotai";
import { widgetMetadataAtom } from "@/atoms";
import type { WidgetMetadata } from "@/atoms";

interface NotesWidgetProps {
  id: string;
  metadata: WidgetMetadata;
}

function NotesWidget({ id, metadata }: NotesWidgetProps) {
  const widgetMetadata = useAtomValue(widgetMetadataAtom);
  const setWidgetMetadata = useSetAtom(widgetMetadataAtom);

  const meta = widgetMetadata[id] ?? metadata;
  const content = (meta.data?.content as string) ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setWidgetMetadata((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? metadata),
        data: { ...(prev[id]?.data ?? metadata.data ?? {}), content: value },
      },
    }));
  };

  return (
    <textarea
      className="textarea textarea-ghost textarea-sm w-full h-full min-h-0 resize-none text-sm"
      placeholder="Write your notes..."
      value={content}
      onChange={handleChange}
    />
  );
}

export default NotesWidget;

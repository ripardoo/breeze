import { useSetAtom } from "jotai";
import { widgetMetadataAtom } from "@/atoms";
import type { WidgetComponentProps } from "@/lib/widgetRegistry";

interface NotesData {
  content: string;
}

function NotesWidget({ id, data }: WidgetComponentProps<NotesData>) {
  const setWidgetMetadata = useSetAtom(widgetMetadataAtom);
  const content = data.content;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWidgetMetadata((prev) => ({
      ...prev,
      [id]: { ...prev[id], data: { content: e.target.value } },
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

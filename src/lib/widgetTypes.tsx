import { Link, StickyNote } from "lucide-react";
import { register } from "@/lib/widgetRegistry";
import LinkWidget from "@/components/Widget/LinkWidget";
import NotesWidget from "@/components/Widget/NotesWidget";

register({
  type: "link",
  label: "Link",
  icon: <Link className="w-5 h-5" />,
  defaultTitle: "Link",
  defaultData: { url: "" },
  parseData: (raw) => {
    const r = raw as Record<string, unknown>;
    return { url: typeof r.url === "string" ? r.url : "" };
  },
  component: LinkWidget,
});

register({
  type: "notes",
  label: "Notes",
  icon: <StickyNote className="w-5 h-5" />,
  defaultTitle: "Notes",
  defaultData: { content: "" },
  parseData: (raw) => {
    const r = raw as Record<string, unknown>;
    return { content: typeof r.content === "string" ? r.content : "" };
  },
  component: NotesWidget,
});

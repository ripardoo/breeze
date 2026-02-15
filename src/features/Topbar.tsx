import { useState, useRef, useEffect } from "react";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import { Pencil, SquarePen, Plus } from "lucide-react";
import {
  activeDashboardAtom,
  layoutAtom,
  activeDashboardIdAtom,
  toastMessageAtom,
  editViewAtom,
  dashboardsAtom,
  widgetMetadataAtom,
} from "@/atoms";
import type { WidgetType } from "@/atoms";
import { updateDashboard, upsertWidgets } from "@/lib/db";
import { findFirstAvailableSlot } from "@/lib/findWidgetSlot";
import { getDefaultMetadata } from "@/lib/widgetTypes";
import { DEFAULT_WIDGET_W, DEFAULT_WIDGET_H } from "@/lib/gridConfig";
import type { LayoutItem } from "react-grid-layout";
import AddWidgetsModal from "@/components/AddWidgetsModal";

function Topbar() {
  const activeDashboard = useAtomValue(activeDashboardAtom);
  const [layout, setLayout] = useAtom(layoutAtom);
  const activeDashboardId = useAtomValue(activeDashboardIdAtom);
  const setToastMessage = useSetAtom(toastMessageAtom);
  const [editView, setEditView] = useAtom(editViewAtom);
  const setDashboards = useSetAtom(dashboardsAtom);
  const setWidgetMetadata = useSetAtom(widgetMetadataAtom);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [addWidgetsOpen, setAddWidgetsOpen] = useState(false);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  const handleStartEditName = () => {
    setEditNameValue(activeDashboard?.name ?? "Dashboard");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    setIsEditingName(false);
    const name = editNameValue.trim() || "Dashboard";
    if (!activeDashboardId || name === (activeDashboard?.name ?? "Dashboard")) return;

    try {
      await updateDashboard(activeDashboardId, { name });
      setDashboards((prev) =>
        prev.map((d) => (d.id === activeDashboardId ? { ...d, name } : d)),
      );
    } catch (err) {
      console.error("Failed to update dashboard name:", err);
    }
  };

  const handleAddWidgetOfType = (type: WidgetType) => {
    if (!activeDashboardId) return;
    const slot = findFirstAvailableSlot(layout, DEFAULT_WIDGET_W, DEFAULT_WIDGET_H);
    if (!slot) {
      setToastMessage("No space available. The dashboard is full.");
      return;
    }
    const id = `widget-${crypto.randomUUID().slice(0, 8)}`;
    const newItem: LayoutItem = {
      i: id,
      x: slot.x,
      y: slot.y,
      w: DEFAULT_WIDGET_W,
      h: DEFAULT_WIDGET_H,
    };
    const metadata = getDefaultMetadata(type);
    setWidgetMetadata((prev) => ({ ...prev, [id]: metadata }));
    const newLayout = [...layout, newItem];
    setLayout(newLayout);
    upsertWidgets(activeDashboardId, newLayout).catch((err) =>
      console.error("Failed to add widget:", err),
    );
  };

  return (
    <div className="flex items-center justify-between h-11 min-h-11 px-4 border-b border-base-300 bg-base-200/60 select-none">
      <div className="flex items-center gap-2 min-w-0">
        {isEditingName ? (
          <input
            ref={inputRef}
            type="text"
            className="input input-sm input-ghost w-48 max-w-full"
            value={editNameValue}
            onChange={(e) => setEditNameValue(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName();
              if (e.key === "Escape") {
                setIsEditingName(false);
                setEditNameValue(activeDashboard?.name ?? "Dashboard");
              }
            }}
          />
        ) : (
          <>
            <span className="text-sm font-semibold text-base-content tracking-tight truncate">
              {activeDashboard?.name ?? "Dashboard"}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square shrink-0 tooltip tooltip-bottom"
              data-tip="Edit name"
              onClick={handleStartEditName}
              aria-label="Edit dashboard name"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          className={`btn btn-ghost btn-sm btn-square tooltip tooltip-bottom ${
            editView ? "btn-active" : ""
          }`}
          data-tip="Toggle edit mode"
          onClick={() => setEditView(!editView)}
          aria-label="Toggle edit mode"
        >
          <SquarePen className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm tooltip tooltip-bottom"
          data-tip="Add widgets"
          onClick={() => setAddWidgetsOpen(true)}
          aria-label="Add widgets"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Add widgets</span>
        </button>
      </div>

      <AddWidgetsModal
        open={addWidgetsOpen}
        onClose={() => setAddWidgetsOpen(false)}
        onSelect={handleAddWidgetOfType}
      />
    </div>
  );
}

export default Topbar;

import { useAtomValue, useAtom, useSetAtom } from "jotai";
import { activeDashboardAtom, layoutAtom, activeDashboardIdAtom, toastMessageAtom } from "@/atoms";
import { upsertWidgets } from "@/lib/db";
import { findFirstAvailableSlot } from "@/lib/findWidgetSlot";
import { DEFAULT_WIDGET_W, DEFAULT_WIDGET_H } from "@/lib/gridConfig";
import type { LayoutItem } from "react-grid-layout";

function Topbar() {
  const activeDashboard = useAtomValue(activeDashboardAtom);
  const [layout, setLayout] = useAtom(layoutAtom);
  const activeDashboardId = useAtomValue(activeDashboardIdAtom);
  const setToastMessage = useSetAtom(toastMessageAtom);

  const handleAddWidget = () => {
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
    const newLayout = [...layout, newItem];
    setLayout(newLayout);
    upsertWidgets(activeDashboardId, newLayout).catch((err) =>
      console.error("Failed to add widget:", err),
    );
  };

  const handleRemoveWidget = () => {
    if (!activeDashboardId || layout.length === 0) return;
    const newLayout = layout.slice(0, -1);
    setLayout(newLayout);
    upsertWidgets(activeDashboardId, newLayout)
      .then(() => {})
      .catch((err) => console.error("Failed to remove widget:", err));
  };

  return (
    <div className="flex items-center justify-between h-11 min-h-11 px-4 border-b border-base-300 bg-base-200/60 select-none">
      <span className="text-sm font-semibold text-base-content tracking-tight">
        {activeDashboard?.name ?? "Dashboard"}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          className="btn btn-ghost btn-sm btn-square tooltip tooltip-bottom"
          data-tip="Add widget"
          onClick={handleAddWidget}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          className="btn btn-ghost btn-sm btn-square tooltip tooltip-bottom"
          data-tip="Remove widget"
          onClick={handleRemoveWidget}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Topbar;

import { useRef } from "react";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import BreezeLogo from "@/components/BreezeLogo";
import { dashboardsAtom, activeDashboardIdAtom, toastMessageAtom } from "@/atoms";
import type { Dashboard } from "@/atoms";
import { createDashboard, reorderDashboards } from "@/lib/db";

function SortableDashboardItem({
  dashboard,
  index,
  isActive,
  onSelect,
}: {
  dashboard: Dashboard;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: dashboard.id,
    index,
  });

  return (
    <li ref={ref} className="w-full" data-dragging={isDragging || undefined}>
      <div
        className={`flex w-full min-w-0 items-center gap-1 rounded-lg ${isActive ? "menu-active" : ""}`}
      >
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center justify-start gap-2 rounded-lg px-3 py-3 text-left"
          onClick={onSelect}
        >
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
          </svg>
          <span className="min-w-0 truncate text-sm">{dashboard.name}</span>
        </button>
        <span
          ref={handleRef}
          className="flex shrink-0 cursor-grab touch-none items-center px-2 py-3 text-base-content/40 opacity-60 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
          >
            <circle cx="6" cy="5" r="1.25" />
            <circle cx="10" cy="5" r="1.25" />
            <circle cx="6" cy="8" r="1.25" />
            <circle cx="10" cy="8" r="1.25" />
            <circle cx="6" cy="11" r="1.25" />
            <circle cx="10" cy="11" r="1.25" />
          </svg>
        </span>
      </div>
    </li>
  );
}

function Sidebar() {
  const dashboards = useAtomValue(dashboardsAtom);
  const [activeDashboardId, setActiveDashboardId] = useAtom(activeDashboardIdAtom);
  const setDashboards = useSetAtom(dashboardsAtom);
  const setToastMessage = useSetAtom(toastMessageAtom);
  const previousDashboards = useRef<Dashboard[]>(dashboards);

  const handleSelectDashboard = (id: string) => {
    setActiveDashboardId(id);
  };

  const handleAddView = async () => {
    try {
      const dashboard = await createDashboard(`Dashboard ${dashboards.length + 1}`);
      setDashboards((prev) => [...prev, dashboard]);
      setActiveDashboardId(dashboard.id);
    } catch {
      setToastMessage("Failed to create dashboard");
    }
  };

  return (
    <nav className="flex flex-col w-60 min-w-60 h-full bg-base-200 border-r border-base-300 select-none gap-6 py-6">
      <BreezeLogo />

      <div className="divider my-0 mx-4" />

      <div className="flex-1 min-h-0 px-4 flex flex-col gap-4 overflow-hidden">
        <span className="block px-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/40 shrink-0">
          Views
        </span>
        <div className="overflow-y-auto min-h-0 flex-1 pr-2">
          <DragDropProvider
            onDragStart={() => {
              previousDashboards.current = dashboards;
            }}
            onDragEnd={(event) => {
              if (event.canceled) {
                setDashboards(previousDashboards.current);
                return;
              }
              const reordered = move(dashboards, event);
              if (reordered !== dashboards) {
                setDashboards(reordered.map((d, i) => ({ ...d, sort_order: i })));
                reorderDashboards(reordered.map((d) => d.id)).catch(() =>
                  setToastMessage("Failed to persist dashboard order"),
                );
              }
            }}
          >
            <ul className="menu menu-sm p-0 gap-2 w-full">
              {dashboards.map((d, index) => (
                <SortableDashboardItem
                  key={d.id}
                  dashboard={d}
                  index={index}
                  isActive={activeDashboardId === d.id}
                  onSelect={() => handleSelectDashboard(d.id)}
                />
              ))}
            </ul>
          </DragDropProvider>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2 border-t border-base-300 shrink-0">
        <button
          type="button"
          className="btn btn-dash btn-block btn-sm btn-ghost gap-2"
          onClick={handleAddView}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add View
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useAtomValue, useAtom, useSetAtom } from "jotai";
import GridLayout, { noCompactor } from "react-grid-layout";
import { gridBounds, minMaxSize } from "react-grid-layout/core";
import type { Layout } from "react-grid-layout";
import { activeDashboardIdAtom, layoutAtom, widgetMetadataAtom } from "@/atoms";
import { getWidgets, upsertWidgets } from "@/lib/db";
import { getDefaultMetadata } from "@/lib/widgetTypes";
import { GRID_COLS, GRID_GAP, GRID_PADDING, GRID_ROWS } from "@/lib/gridConfig";
import { renderWidget } from "@/components/Widget";

const LAYOUT_PERSIST_DEBOUNCE_MS = 300;
const freeCompactor = { ...noCompactor, preventCollision: true };

function debounce<A extends unknown[], R>(
  fn: (...args: A) => R,
  ms: number,
): (...args: A) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const activeDashboardId = useAtomValue(activeDashboardIdAtom);
  const [layout, setLayout] = useAtom(layoutAtom);
  const widgetMetadata = useAtomValue(widgetMetadataAtom);
  const setWidgetMetadata = useSetAtom(widgetMetadataAtom);

  const measure = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth, height: clientHeight });
    }
  }, []);

  useEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (activeDashboardId) {
      getWidgets(activeDashboardId).then((widgets) => setLayout(widgets));
    } else {
      setLayout([]);
    }
  }, [activeDashboardId, setLayout]);

  const rowHeight =
    dimensions.height > 0
      ? (dimensions.height - GRID_GAP * (GRID_ROWS - 1) - GRID_PADDING * 2) / GRID_ROWS
      : 40;

  const debouncedUpsert = useMemo(
    () =>
      debounce((dashboardId: string, newLayout: Layout) => {
        upsertWidgets(dashboardId, [...newLayout]).catch((err) =>
          console.error("Failed to persist layout:", err),
        );
      }, LAYOUT_PERSIST_DEBOUNCE_MS),
    [],
  );

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      setLayout([...newLayout]);
      if (activeDashboardId) {
        debouncedUpsert(activeDashboardId, newLayout);
      }
    },
    [activeDashboardId, setLayout, debouncedUpsert],
  );

  const gridConfig = useMemo(
    () => ({
      cols: GRID_COLS,
      rowHeight,
      margin: [GRID_GAP, GRID_GAP] as const,
      containerPadding: [GRID_PADDING, GRID_PADDING] as const,
      maxRows: GRID_ROWS,
    }),
    [rowHeight],
  );

  const constraints = useMemo(() => [gridBounds, minMaxSize], []);

  const handleCloseWidget = useCallback(
    (id: string) => {
      const newLayout = layout.filter((item) => item.i !== id);
      setLayout(newLayout);
      setWidgetMetadata((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (activeDashboardId) {
        upsertWidgets(activeDashboardId, newLayout).catch((err) =>
          console.error("Failed to persist layout:", err),
        );
      }
    },
    [layout, activeDashboardId, setLayout, setWidgetMetadata],
  );

  return (
    <div
      ref={containerRef}
      style={{ margin: 5, width: "calc(100% - 10px)", height: "calc(100% - 10px)" }}
      className="relative overflow-hidden"
    >
      {dimensions.width > 0 && (
        <GridLayout
          className="layout"
          layout={layout as Layout}
          width={dimensions.width}
          gridConfig={gridConfig}
          dragConfig={{ handle: ".widget-drag-handle", cancel: ".widget-close-btn" }}
          resizeConfig={{
            handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"] as const,
          }}
          compactor={freeCompactor}
          constraints={constraints}
          autoSize={false}
          onLayoutChange={handleLayoutChange}
        >
          {layout.map((item) => {
            const metadata = widgetMetadata[item.i] ?? getDefaultMetadata("link");
            return (
              <div key={item.i} className="h-full w-full">
                {renderWidget(item.i, metadata, () => handleCloseWidget(item.i))}
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
}

export default Dashboard;

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useAtom, useSetAtom } from "jotai";
import GridLayout, { noCompactor } from "react-grid-layout";
import { gridBounds, minMaxSize } from "react-grid-layout/core";
import type { Layout } from "react-grid-layout";
import { activeDashboardIdAtom, layoutAtom, widgetMetadataAtom, toastMessageAtom } from "@/atoms";
import { getWidgets, upsertWidgets } from "@/lib/db";
import { GRID_COLS, GRID_GAP, GRID_PADDING, GRID_ROWS } from "@/lib/gridConfig";
import { renderWidget } from "@/components/Widget";
import { debounce } from "@/utils/debounce";

const LAYOUT_PERSIST_DEBOUNCE_MS = 300;
const freeCompactor = { ...noCompactor, preventCollision: true };

function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeDashboardId] = useAtom(activeDashboardIdAtom);
  const [layout, setLayout] = useAtom(layoutAtom);
  const [widgetMetadata, setWidgetMetadata] = useAtom(widgetMetadataAtom);
  const setToastMessage = useSetAtom(toastMessageAtom);

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
      getWidgets(activeDashboardId)
        .then(({ layout: widgets, metadata }) => {
          setLayout(widgets);
          setWidgetMetadata(metadata);
        })
        .catch(() => setToastMessage("Failed to load widgets"));
    } else {
      setLayout([]);
      setWidgetMetadata({});
    }
  }, [activeDashboardId, setLayout, setWidgetMetadata, setToastMessage]);

  const rowHeight =
    dimensions.height > 0
      ? (dimensions.height - GRID_GAP * (GRID_ROWS - 1) - GRID_PADDING * 2) / GRID_ROWS
      : 40;

  const debouncedUpsert = useMemo(
    () =>
      debounce(
        (
          dashboardId: string,
          newLayout: Layout,
          newMetadata: Record<string, import("@/atoms").WidgetMetadata>,
        ) => {
          upsertWidgets(dashboardId, [...newLayout], newMetadata).catch(() =>
            setToastMessage("Failed to persist layout"),
          );
        },
        LAYOUT_PERSIST_DEBOUNCE_MS,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!activeDashboardId) return;
    debouncedUpsert(activeDashboardId, layout, widgetMetadata);
  }, [widgetMetadata, activeDashboardId, debouncedUpsert, layout]);

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      setLayout([...newLayout]);
      if (activeDashboardId) {
        debouncedUpsert(activeDashboardId, newLayout, widgetMetadata);
      }
    },
    [activeDashboardId, setLayout, debouncedUpsert, widgetMetadata],
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
      const newMetadata = { ...widgetMetadata };
      delete newMetadata[id];
      setLayout(newLayout);
      setWidgetMetadata(newMetadata);
      if (activeDashboardId) {
        upsertWidgets(activeDashboardId, newLayout, newMetadata).catch(() =>
          setToastMessage("Failed to persist layout"),
        );
      }
    },
    [layout, widgetMetadata, activeDashboardId, setLayout, setWidgetMetadata, setToastMessage],
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
            const metadata = widgetMetadata[item.i];
            if (!metadata) return <div key={item.i} className="h-full w-full" />;
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

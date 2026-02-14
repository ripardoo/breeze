import "./App.css";
import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import Sidebar from "@/features/Sidebar";
import Topbar from "@/features/Topbar";
import Dashboard from "@/features/Dashboard";
import Toast from "@/components/Toast";
import {
  dbAtom,
  isDbReadyAtom,
  dashboardsAtom,
  activeDashboardIdAtom,
} from "@/atoms";
import {
  loadDb,
  getDashboards,
  createDashboard,
} from "@/lib/db";

function App() {
  const isDbReady = useAtomValue(isDbReadyAtom);
  const setDb = useSetAtom(dbAtom);
  const setIsDbReady = useSetAtom(isDbReadyAtom);
  const setDashboards = useSetAtom(dashboardsAtom);
  const setActiveDashboardId = useSetAtom(activeDashboardIdAtom);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const db = await loadDb();
        if (cancelled) return;
        setDb(db);

        const dashboards = await getDashboards();
        if (cancelled) return;
        setDashboards(dashboards);

        let activeId: string | null = null;
        if (dashboards.length > 0) {
          activeId = dashboards[0].id;
        } else {
          const defaultDashboard = await createDashboard("Dashboard");
          if (cancelled) return;
          setDashboards([defaultDashboard]);
          activeId = defaultDashboard.id;
        }
        setActiveDashboardId(activeId);
      } catch (err) {
        console.error("Failed to init database:", err);
      } finally {
        if (!cancelled) setIsDbReady(true);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [setDb, setIsDbReady, setDashboards, setActiveDashboardId]);

  if (!isDbReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />

      <main className="flex flex-col flex-1 min-w-0 h-full bg-base-100 overflow-hidden">
        <Topbar />
        <div className="flex-1 min-h-0 overflow-hidden">
          <Dashboard />
        </div>
      </main>

      <Toast />
    </div>
  );
}

export default App;

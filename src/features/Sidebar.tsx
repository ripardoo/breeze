import { useAtomValue, useAtom, useSetAtom } from "jotai";
import BreezeLogo from "@/components/BreezeLogo";
import { dashboardsAtom, activeDashboardIdAtom } from "@/atoms";
import { createDashboard } from "@/lib/db";

function Sidebar() {
  const dashboards = useAtomValue(dashboardsAtom);
  const [activeDashboardId, setActiveDashboardId] = useAtom(activeDashboardIdAtom);
  const setDashboards = useSetAtom(dashboardsAtom);

  const handleSelectDashboard = (id: string) => {
    setActiveDashboardId(id);
  };

  const handleAddView = async () => {
    try {
      const dashboard = await createDashboard(`Dashboard ${dashboards.length + 1}`);
      setDashboards((prev) => [...prev, dashboard]);
      setActiveDashboardId(dashboard.id);
    } catch (err) {
      console.error("Failed to create dashboard:", err);
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
          <ul className="menu menu-sm p-0 gap-2 w-full">
            {dashboards.map((d) => (
              <li key={d.id} className="w-full">
                <button
                  className={`w-full justify-start gap-3 px-4 py-3 ${activeDashboardId === d.id ? "menu-active" : ""}`}
                  onClick={() => handleSelectDashboard(d.id)}
                >
                  <svg
                    className="w-4.5 h-4.5 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span className="truncate">{d.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2 border-t border-base-300 shrink-0">
        <button
          className="btn btn-dash btn-block btn-sm btn-ghost gap-2"
          onClick={handleAddView}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
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

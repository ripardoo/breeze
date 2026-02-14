import { useAtomValue } from "jotai";
import { editViewAtom } from "@/atoms";

interface WidgetProps {
  id: string;
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

function Widget({ id, title = "Widget", onClose, children }: WidgetProps) {
  const isEditView = useAtomValue(editViewAtom);

  return (
    <div
      className="card h-full w-full rounded-lg border border-base-300 bg-base-200/50 overflow-hidden flex flex-col"
      data-widget-id={id}
    >
      <div className="card-body p-2 flex-1 min-h-0 flex flex-col">
        <div
          className="widget-drag-handle flex items-center gap-2 shrink-0 cursor-grab active:cursor-grabbing border-b border-base-content/30"
          aria-label="Drag to move"
        >
          <span className="shrink-0 text-base-content/50 p-0.5 -m-0.5 rounded" aria-hidden>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 2a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h2zm6 0a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V4a2 2 0 012-2h2z" />
            </svg>
          </span>
          <h3 className="card-title text-sm font-medium text-base-content truncate flex-1 min-w-0">
            {title}
          </h3>
          {isEditView && onClose && (
            <button
              type="button"
              className="widget-close-btn btn btn-ghost btn-sm btn-square shrink-0 text-base-content/60 hover:text-error hover:bg-error/10"
              aria-label="Close widget"
              onClick={onClose}
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export default Widget;

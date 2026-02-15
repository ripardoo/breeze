import { useEffect, useRef } from "react";
import { Link, StickyNote } from "lucide-react";
import type { WidgetType } from "@/atoms";
import { WIDGET_TYPES } from "@/lib/widgetTypes";

const iconMap: Record<WidgetType, React.ReactNode> = {
  link: <Link className="w-5 h-5" />,
  notes: <StickyNote className="w-5 h-5" />,
};

interface AddWidgetsModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: WidgetType) => void;
}

function AddWidgetsModal({ open, onClose, onSelect }: AddWidgetsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (open) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [open]);

  const handleSelect = (type: WidgetType) => {
    onSelect(type);
    onClose();
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose} tabIndex={0}>
      <div className="modal-box">
        <h3 className="font-semibold text-lg mb-4">Add widget</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {WIDGET_TYPES.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              className="btn btn-ghost btn-block justify-start gap-3"
              onClick={() => handleSelect(type)}
            >
              {iconMap[type]}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
}

export default AddWidgetsModal;

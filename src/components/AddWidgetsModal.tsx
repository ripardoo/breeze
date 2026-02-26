import { useEffect, useRef } from "react";
import { getAllEntries } from "@/lib/widgetRegistry";

interface AddWidgetsModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
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

  const handleSelect = (type: string) => {
    onSelect(type);
    onClose();
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose} tabIndex={0}>
      <div className="modal-box">
        <h3 className="font-semibold text-lg mb-4">Add widget</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {getAllEntries().map(({ type, label, icon }) => (
            <button
              key={type}
              type="button"
              className="btn btn-ghost btn-block justify-start gap-3"
              onClick={() => handleSelect(type)}
            >
              {icon}
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

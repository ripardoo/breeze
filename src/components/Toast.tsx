import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { toastMessageAtom } from "@/atoms";

const TOAST_DURATION_MS = 4000;

function Toast() {
  const message = useAtomValue(toastMessageAtom);
  const setToastMessage = useSetAtom(toastMessageAtom);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, setToastMessage]);

  if (!message) return null;

  return (
    <div className="toast toast-bottom toast-end z-50">
      <div className="alert alert-warning">
        <span>{message}</span>
      </div>
    </div>
  );
}

export default Toast;

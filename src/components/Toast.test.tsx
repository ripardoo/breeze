import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { toastMessageAtom } from "@/atoms";
import Toast from "./Toast";

function renderWithStore(store: ReturnType<typeof createStore>) {
  return render(
    <Provider store={store}>
      <Toast />
    </Provider>,
  );
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when there is no message", () => {
    const store = createStore();
    const { container } = renderWithStore(store);
    expect(container.innerHTML).toBe("");
  });

  it("renders the toast message when set", () => {
    const store = createStore();
    store.set(toastMessageAtom, "Something happened");
    renderWithStore(store);
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("auto-dismisses after 4 seconds", () => {
    const store = createStore();
    store.set(toastMessageAtom, "Temporary message");
    renderWithStore(store);

    expect(screen.getByText("Temporary message")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(store.get(toastMessageAtom)).toBeNull();
  });
});

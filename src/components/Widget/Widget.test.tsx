import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { editViewAtom } from "@/atoms";
import Widget from "./Widget";

function renderWidget(
  store: ReturnType<typeof createStore>,
  props: { id: string; title?: string; onClose?: () => void },
) {
  return render(
    <Provider store={store}>
      <Widget id={props.id} title={props.title} onClose={props.onClose}>
        <span>child content</span>
      </Widget>
    </Provider>,
  );
}

describe("Widget", () => {
  it("renders the title and children", () => {
    const store = createStore();
    renderWidget(store, { id: "w1", title: "My Widget" });

    expect(screen.getByText("My Widget")).toBeInTheDocument();
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("uses 'Widget' as default title", () => {
    const store = createStore();
    renderWidget(store, { id: "w1" });

    expect(screen.getByText("Widget")).toBeInTheDocument();
  });

  it("does not show close button when edit mode is off", () => {
    const store = createStore();
    store.set(editViewAtom, false);
    const onClose = vi.fn();
    renderWidget(store, { id: "w1", onClose });

    expect(screen.queryByLabelText("Close widget")).not.toBeInTheDocument();
  });

  it("shows close button in edit mode", () => {
    const store = createStore();
    store.set(editViewAtom, true);
    const onClose = vi.fn();
    renderWidget(store, { id: "w1", onClose });

    expect(screen.getByLabelText("Close widget")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(editViewAtom, true);
    const onClose = vi.fn();
    renderWidget(store, { id: "w1", onClose });

    await user.click(screen.getByLabelText("Close widget"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("sets data-widget-id attribute", () => {
    const store = createStore();
    const { container } = renderWidget(store, { id: "test-widget" });
    const el = container.querySelector("[data-widget-id='test-widget']");
    expect(el).toBeInTheDocument();
  });
});

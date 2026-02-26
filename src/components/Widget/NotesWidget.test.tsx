import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { widgetMetadataAtom } from "@/atoms";
import NotesWidget from "./NotesWidget";

function renderNotesWidget(
  store: ReturnType<typeof createStore>,
  id: string,
) {
  const metadata = store.get(widgetMetadataAtom)[id] ?? {
    type: "notes" as const,
    title: "Notes",
    data: { content: "" },
  };
  return render(
    <Provider store={store}>
      <NotesWidget id={id} metadata={metadata} />
    </Provider>,
  );
}

describe("NotesWidget", () => {
  it("renders a textarea with placeholder", () => {
    const store = createStore();
    renderNotesWidget(store, "n1");
    expect(screen.getByPlaceholderText("Write your notes...")).toBeInTheDocument();
  });

  it("displays existing content from metadata", () => {
    const store = createStore();
    store.set(widgetMetadataAtom, {
      n1: { type: "notes", title: "Notes", data: { content: "Hello world" } },
    });
    renderNotesWidget(store, "n1");

    const textarea = screen.getByPlaceholderText("Write your notes...");
    expect(textarea).toHaveValue("Hello world");
  });

  it("updates atom when user types", async () => {
    const user = userEvent.setup();
    const store = createStore();
    store.set(widgetMetadataAtom, {
      n1: { type: "notes", title: "Notes", data: { content: "" } },
    });
    renderNotesWidget(store, "n1");

    const textarea = screen.getByPlaceholderText("Write your notes...");
    await user.type(textarea, "New note");

    const updatedMeta = store.get(widgetMetadataAtom);
    expect(updatedMeta.n1.data?.content).toBe("New note");
  });
});

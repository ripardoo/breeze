import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { widgetMetadataAtom } from "@/atoms";
import LinkWidget from "./LinkWidget";

function renderLinkWidget(
  store: ReturnType<typeof createStore>,
  id: string,
) {
  const metadata = store.get(widgetMetadataAtom)[id] ?? {
    type: "link" as const,
    title: "Link",
    data: { url: "" },
  };
  return render(
    <Provider store={store}>
      <LinkWidget id={id} metadata={metadata} />
    </Provider>,
  );
}

describe("LinkWidget", () => {
  it("renders placeholder text when URL is empty", () => {
    const store = createStore();
    renderLinkWidget(store, "l1");

    expect(screen.getByText("Link")).toBeInTheDocument();
  });

  it("renders a link with the URL when provided", () => {
    const store = createStore();
    store.set(widgetMetadataAtom, {
      l1: {
        type: "link",
        title: "My Site",
        data: { url: "https://example.com" },
      },
    });
    renderLinkWidget(store, "l1");

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("My Site")).toBeInTheDocument();
  });

  it("shows placeholder styling when URL is empty", () => {
    const store = createStore();
    renderLinkWidget(store, "l1");

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#");
    expect(link.className).toContain("cursor-default");
  });

  it("shows the URL as label when title matches default but URL is set", () => {
    const store = createStore();
    store.set(widgetMetadataAtom, {
      l1: {
        type: "link",
        title: "",
        data: { url: "https://example.com" },
      },
    });
    renderLinkWidget(store, "l1");

    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });
});

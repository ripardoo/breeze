import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddWidgetsModal from "./AddWidgetsModal";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal || vi.fn();
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close || vi.fn();
});

describe("AddWidgetsModal", () => {
  it("renders widget type buttons when open", () => {
    render(
      <AddWidgetsModal open={true} onClose={vi.fn()} onSelect={vi.fn()} />,
    );
    expect(screen.getByText("Link")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByText("Add widget")).toBeInTheDocument();
  });

  it("calls onSelect with 'link' when Link is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <AddWidgetsModal open={true} onClose={onClose} onSelect={onSelect} />,
    );

    await user.click(screen.getByText("Link"));
    expect(onSelect).toHaveBeenCalledWith("link");
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onSelect with 'notes' when Notes is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <AddWidgetsModal open={true} onClose={onClose} onSelect={onSelect} />,
    );

    await user.click(screen.getByText("Notes"));
    expect(onSelect).toHaveBeenCalledWith("notes");
    expect(onClose).toHaveBeenCalled();
  });
});

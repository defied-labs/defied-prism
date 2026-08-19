import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Home from "../app/page";

describe("Interactive Demo App", () => {
  it("renders Button State Machine demo and responds to focus/blur events", () => {
    render(<Home />);

    const buttonSection = screen
      .getByText("Button State Machine")
      .closest("section")!;
    expect(buttonSection).toBeInTheDocument();

    const button = within(buttonSection).getByRole("button", {
      name: /Interactive Button/i,
    });
    expect(button).toBeInTheDocument();

    // Check initial state - find the strong element inside the status span
    const statusStrong = within(buttonSection).getByText("idle");
    expect(statusStrong).toBeInTheDocument();

    fireEvent.focus(button);
    // The state should update to focused
    const focusedStrong = within(buttonSection).getByText("focused");
    expect(focusedStrong).toBeInTheDocument();

    fireEvent.blur(button);
    const idleStrong = within(buttonSection).getByText("idle");
    expect(idleStrong).toBeInTheDocument();
  });

  it("renders Input State Machine demo and responds to text changes", () => {
    render(<Home />);

    const inputSection = screen
      .getByText("Input State Machine")
      .closest("section")!;
    expect(inputSection).toBeInTheDocument();

    const input = within(inputSection).getByPlaceholderText(
      "Type something here...",
    );

    fireEvent.change(input, { target: { value: "Hello Prism" } });
    expect(input).toHaveValue("Hello Prism");
  });
});

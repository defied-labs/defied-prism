// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "alert";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("alert", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

function renderAlert(props: Record<string, unknown> = {}) {
  return render(
    h(
      m.Alert,
      props,
      h(m.AlertIcon, {}, "!"),
      h(m.AlertContent, {}, h(m.AlertTitle, {}, "Heads up"), h(m.AlertDescription, {}, "Details")),
      h(m.AlertAction, {}, h("button", { type: "button" }, "Retry")),
    ),
  );
}

describe("Alert", () => {
  it("is a polite status by default and an assertive alert when urgent", () => {
    renderAlert();
    expect(screen.getByRole("status")).toHaveTextContent("Heads up");
    expect(screen.queryByRole("alert")).toBeNull();
    cleanup();
    renderAlert({ urgent: true, status: "danger" });
    expect(screen.getByRole("alert").getAttribute("data-status")).toBe("danger");
  });

  it("lets consumers override the role", () => {
    renderAlert({ role: "note" });
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("propagates the status to every slot and hides the icon", () => {
    renderAlert({ status: "warning" });
    for (const slot of ["alert", "alert-icon", "alert-content", "alert-title", "alert-description", "alert-action"]) {
      expect(document.querySelector(`[data-slot="${slot}"]`)?.getAttribute("data-status"), slot).toBe("warning");
    }
    expect(document.querySelector('[data-slot="alert-icon"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders no dismiss button without onDismiss", () => {
    renderAlert();
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
  });

  it("dismiss button is named, focusable and calls onDismiss", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderAlert({ onDismiss, dismissLabel: "Close message" });
    const button = screen.getByRole("button", { name: "Close message" });
    expect(button.getAttribute("data-slot")).toBe("alert-close");
    // A Prism IconButton, ghost and small
    expect(button.getAttribute("data-variant")).toBe("ghost");
    expect(button.getAttribute("data-size")).toBe("sm");
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard("[Enter]");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

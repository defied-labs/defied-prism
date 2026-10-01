// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, useState, type FormEvent } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "form";
let m: Record<string, any>;
let f: Record<string, any>;
let input: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("form", "tailwind", NAMESPACE);
  f = await loadGenerated("field", "tailwind", NAMESPACE);
  input = await loadGenerated("input", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

function SignUp({ focusInvalid, onValid }: { focusInvalid?: boolean; onValid?: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Record<string, string> = {};
    if (!data.get("name")) next.name = "Name is required";
    if (!data.get("email")) next.email = "Email is required";
    setErrors(next);
    if (Object.keys(next).length === 0) onValid?.();
  };
  return h(
    m.Form,
    { "aria-label": "Sign up", noValidate: true, onSubmit, focusInvalid },
    h(f.Field, null, h(f.FieldLabel, null, "Name"), h(input.Input, { name: "name" }), h(f.FieldError, null, errors.name)),
    h(f.Field, null, h(f.FieldLabel, null, "Email"), h(input.Input, { name: "email" }), h(f.FieldError, null, errors.email)),
    h("button", { type: "submit" }, "Submit"),
  );
}

describe("Form", () => {
  it("is a named form that forwards props and composes onSubmit", async () => {
    const onSubmit = vi.fn((e: FormEvent) => e.preventDefault());
    render(h(m.Form, { "aria-label": "F", noValidate: true, onSubmit }, h("button", { type: "submit" }, "Go")));
    const form = screen.getByRole("form", { name: "F" }) as HTMLFormElement;
    expect(form.noValidate).toBe(true);
    await userEvent.setup().click(screen.getByText("Go"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("moves focus to the first invalid control after submit", async () => {
    const user = userEvent.setup();
    render(h(SignUp));
    await user.click(screen.getByText("Submit"));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Name" })));
    expect(screen.getByText("Name is required")).toBeTruthy();

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.click(screen.getByText("Submit"));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Email" })));
  });

  it("leaves focus alone when everything is valid", async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(h(SignUp, { onValid }));
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.type(screen.getByRole("textbox", { name: "Email" }), "a@b.c");
    await user.click(screen.getByText("Submit"));
    expect(onValid).toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 10));
    expect(document.activeElement).toBe(screen.getByText("Submit"));
  });

  it("focusInvalid={false} opts out", async () => {
    const user = userEvent.setup();
    render(h(SignUp, { focusInvalid: false }));
    await user.click(screen.getByText("Submit"));
    await new Promise((r) => setTimeout(r, 10));
    expect(document.activeElement).toBe(screen.getByText("Submit"));
  });

  it("with noValidate, natively invalid controls are focused too", async () => {
    const user = userEvent.setup();
    render(
      h(
        m.Form,
        { "aria-label": "F", noValidate: true, onSubmit: (e: FormEvent) => e.preventDefault() },
        h("input", { "aria-label": "ok" }),
        h("input", { "aria-label": "req", required: true }),
        h("button", { type: "submit" }, "Go"),
      ),
    );
    await user.click(screen.getByText("Go"));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("req")));
  });
});

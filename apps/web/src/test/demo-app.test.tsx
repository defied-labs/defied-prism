import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("Interactive Demo App", () => {
  it("renders without crashing", () => {
    const { container } = render(<Home />);
    expect(container).toBeInTheDocument();
  });
});

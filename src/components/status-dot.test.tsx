import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusDot, StockBar } from "./status-dot";

describe("StatusDot", () => {
  it("renders the default Healthy label for ok tone", () => {
    render(<StatusDot status="ok" />);
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("renders the default Critical label for crit tone", () => {
    render(<StatusDot status="crit" />);
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("renders a custom label when provided", () => {
    render(<StatusDot status="low" label="Almost gone" />);
    expect(screen.getByText("Almost gone")).toBeInTheDocument();
  });
});

describe("StockBar", () => {
  it("does not throw when threshold is null", () => {
    const { container } = render(<StockBar current={5} threshold={null} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders a div container regardless of values", () => {
    const { container } = render(<StockBar current={0} threshold={10} />);
    expect(container.querySelector("div")).not.toBeNull();
  });
});

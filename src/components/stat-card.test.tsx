import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatCard } from "./stat-card";

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Total stock value" value="289,819" prefix="A$" />);
    expect(screen.getByText("Total stock value")).toBeInTheDocument();
    expect(screen.getByText("289,819")).toBeInTheDocument();
    expect(screen.getByText("A$")).toBeInTheDocument();
  });

  it("renders the delta text when provided", () => {
    render(
      <StatCard
        label="Expiring in 30 days"
        value="6"
        delta={{ tone: "warn", text: "A$8,420 at risk" }}
      />
    );
    expect(screen.getByText("A$8,420 at risk")).toBeInTheDocument();
  });

  it("hides the delta block when not provided", () => {
    render(<StatCard label="Active items" value="45" />);
    expect(screen.queryByText(/at risk/)).toBeNull();
  });
});

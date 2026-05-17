import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryPill } from "./category-pill";

describe("CategoryPill", () => {
  it("renders the supplied category name", () => {
    render(<CategoryPill name="Medication" />);
    expect(screen.getByText("Medication")).toBeInTheDocument();
  });

  it("renders nothing when name is undefined", () => {
    const { container } = render(<CategoryPill name={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("falls back to the neutral tone for unknown categories", () => {
    render(<CategoryPill name="ExoticVertical" />);
    expect(screen.getByText("ExoticVertical")).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Skills } from "../../components/Skills";
import { skills } from "../../data";

const data = { ...skills, items: [...skills.items, { name: "Rust", category: "Backend" }] };

describe("Skills", () => {
  it("renders the heading, a filter per category and every skill", () => {
    render(<Skills data={data} />);
    expect(screen.getByRole("heading", { name: skills.eyebrow })).toBeInTheDocument();
    expect(screen.getByText(skills.subheading)).toBeInTheDocument();
    for (const cat of ["All", ...skills.categories]) {
      expect(screen.getByRole("button", { name: cat })).toBeInTheDocument();
    }
    for (const skill of data.items) {
      expect(screen.getAllByText(skill.name).length).toBeGreaterThan(0);
    }
  });

  it("filters by category and back to All", async () => {
    const user = userEvent.setup();
    render(<Skills data={data} />);

    await user.click(screen.getByRole("button", { name: "Frontend" }));
    expect(screen.getByRole("img", { name: "React" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Python" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByRole("img", { name: "Python" })).toBeInTheDocument();
  });

  it("shows the fallback badge for skills without a logo", () => {
    render(<Skills data={data} />);
    expect(screen.queryByRole("img", { name: "Pydantic" })).not.toBeInTheDocument();
    expect(screen.getByText("Pyd")).toBeInTheDocument();
    // No logo and no fallback: the first two letters, uppercased.
    expect(screen.getByText("RU")).toBeInTheDocument();
  });

  it("falls back to initials when a logo fails to load", () => {
    render(<Skills data={data} />);
    fireEvent.error(screen.getByRole("img", { name: "Python" }));
    expect(screen.queryByRole("img", { name: "Python" })).not.toBeInTheDocument();
    expect(screen.getByText("PY")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Chip } from "../../components/Chip";
import { EntityCard } from "../../components/EntityCard";
import { Icon } from "../../components/Icon";
import { SectionHeading } from "../../components/SectionHeading";

describe("Icon", () => {
  it("renders a decorative svg at the default size", () => {
    const { container } = render(<Icon name="github" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("width", "18");
    expect(svg).toHaveAttribute("height", "18");
  });

  it("accepts a size and class", () => {
    const { container } = render(<Icon name="mail" size={24} className="text-red" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "24");
    expect(container.querySelector("svg")).toHaveClass("text-red");
  });

  it("renders nothing for an unknown name", () => {
    const { container } = render(<Icon name="does-not-exist" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Chip", () => {
  it("renders its label", () => {
    render(<Chip>TypeScript</Chip>);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });
});

describe("SectionHeading", () => {
  it("renders an h2", () => {
    render(<SectionHeading>About me</SectionHeading>);
    expect(screen.getByRole("heading", { level: 2, name: "About me" })).toBeInTheDocument();
  });
});

describe("EntityCard", () => {
  it("renders its children", () => {
    render(<EntityCard>inside</EntityCard>);
    expect(screen.getByText("inside")).toBeInTheDocument();
    expect(screen.getByText("inside")).not.toHaveClass("undefined");
  });

  it("appends a custom class", () => {
    render(<EntityCard className="flex-1">inside</EntityCard>);
    expect(screen.getByText("inside")).toHaveClass("flex-1");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Reveal } from "../../components/Reveal";
import { SectionDivider } from "../../components/SectionDivider";
import { MockIntersectionObserver, revealAll } from "../helpers";

describe("Reveal", () => {
  it("hides its children until they scroll into view", () => {
    render(
      <Reveal>
        <p>content</p>
      </Reveal>,
    );
    const wrapper = screen.getByText("content").parentElement!;
    expect(wrapper).toHaveClass("opacity-0");

    revealAll(false);
    expect(wrapper).toHaveClass("opacity-0");

    revealAll();
    expect(wrapper).toHaveClass("opacity-100");
  });

  it("stops observing once revealed and disconnects on unmount", () => {
    const { unmount } = render(<Reveal>content</Reveal>);
    const [observer] = MockIntersectionObserver.instances;
    expect(observer.thresholds).toEqual([0.15]);

    revealAll();
    expect(observer.unobserve).toHaveBeenCalledTimes(1);

    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});

describe("SectionDivider", () => {
  it("draws its lines once it scrolls into view", () => {
    const { container } = render(<SectionDivider />);
    const divider = container.querySelector("[data-divider]")!;
    expect(divider).toHaveAttribute("aria-hidden", "true");
    expect(divider.querySelectorAll(".scale-x-0")).toHaveLength(2);

    revealAll();
    expect(divider.querySelectorAll(".scale-x-100")).toHaveLength(2);
    expect(divider.querySelector(".scale-100")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Hero } from "../../components/Hero";
import { profile } from "../../data";

// framer-motion reads the reduced-motion preference once at load, so stub the
// hook to exercise both the animated and the static render.
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => motion.reduce,
}));

const { hero, headshot, socials } = profile;

describe("Hero", () => {
  afterEach(() => {
    motion.reduce = false;
  });

  it("renders the pitch, calls to action and headshot", () => {
    render(<Hero hero={hero} headshot={headshot} socials={socials} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(hero.headline);
    // Screen readers get the rotating roles as plain text.
    expect(screen.getByText(`${hero.rotatingRoles.join(", ")}.`)).toHaveClass("sr-only");
    expect(screen.getByText(hero.subheadline)).toBeInTheDocument();
    expect(screen.getByText(hero.availability)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: hero.primaryCta.label })).toHaveAttribute("href", hero.primaryCta.href);
    expect(screen.getByRole("link", { name: hero.secondaryCta.label })).toHaveAttribute("href", hero.secondaryCta.href);
    expect(screen.getByRole("img", { name: headshot.alt })).toHaveAttribute("src", headshot.src);
  });

  it("opens socials in a new tab, except email", () => {
    render(<Hero hero={hero} headshot={headshot} socials={socials} />);
    for (const social of socials) {
      const link = screen.getByRole("link", { name: `${social.label}: ${social.handle}` });
      expect(link).toHaveAttribute("href", social.href);
      if (social.icon === "mail") expect(link).not.toHaveAttribute("target");
      else expect(link).toHaveAttribute("target", "_blank");
    }
  });

  it("still renders everything with reduced motion", () => {
    motion.reduce = true;
    render(<Hero hero={hero} headshot={headshot} socials={socials} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(hero.headline);
    expect(screen.getByRole("img", { name: headshot.alt })).toBeInTheDocument();
  });
});

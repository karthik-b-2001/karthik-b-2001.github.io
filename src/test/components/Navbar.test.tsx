import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Navbar } from "../../components/Navbar";
import { site } from "../../data";

const { navigation } = site;
const external = navigation.links.find((l) => l.type === "external")!;
const section = navigation.links.find((l) => l.type === "section")!;

function setup() {
  const user = userEvent.setup();
  render(<Navbar navigation={navigation} />);
  return user;
}

const mobileNav = () => screen.queryByRole("navigation", { name: "Mobile" });

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Open menu" }));
  return within(mobileNav()!);
}

describe("Navbar", () => {
  it("renders the brand, links, resume and theme picker", () => {
    setup();
    expect(screen.getByRole("link", { name: navigation.brand })).toHaveAttribute("href", "#home");

    const primary = within(screen.getByRole("navigation", { name: "Primary" }));
    expect(primary.getAllByRole("link")).toHaveLength(navigation.links.length);
    expect(primary.getByRole("link", { name: section.label })).toHaveAttribute("href", section.href);
    expect(primary.getByRole("link", { name: section.label })).not.toHaveAttribute("target");
    expect(primary.getByRole("link", { name: external.label })).toHaveAttribute("target", "_blank");

    expect(screen.getByRole("link", { name: navigation.resume.label })).toHaveAttribute("href", navigation.resume.href);
    expect(screen.getByRole("radiogroup", { name: "Choose theme" })).toBeInTheDocument();
    expect(mobileNav()).not.toBeInTheDocument();
  });

  it("opens and closes the mobile menu with the toggle", async () => {
    const user = setup();
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    const menu = await openMenu(user);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(menu.getAllByRole("link")).toHaveLength(navigation.links.length + 1);
    expect(menu.getByRole("link", { name: external.label })).toHaveAttribute("target", "_blank");

    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(mobileNav()).not.toBeInTheDocument();
  });

  it.each([section.label, external.label, navigation.resume.label])(
    "closes the mobile menu when %s is tapped",
    async (label) => {
      const user = setup();
      const menu = await openMenu(user);
      await user.click(menu.getByRole("link", { name: label }));
      expect(mobileNav()).not.toBeInTheDocument();
    },
  );

  it.each([section.label, external.label])("closes the mobile menu when desktop link %s is clicked", async (label) => {
    const user = setup();
    await openMenu(user);
    const primary = within(screen.getByRole("navigation", { name: "Primary" }));
    await user.click(primary.getByRole("link", { name: label }));
    expect(mobileNav()).not.toBeInTheDocument();
  });
});

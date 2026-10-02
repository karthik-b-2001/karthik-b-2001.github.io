import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { profile, site } from "../data";

function addMeta(name: string) {
  const meta = document.createElement("meta");
  meta.name = name;
  document.head.appendChild(meta);
  return meta;
}

describe("App", () => {
  afterEach(() => {
    document.head.innerHTML = "";
  });

  it("renders every section", () => {
    const { container } = render(<App />);
    for (const id of ["home", "about", "experience", "projects", "skills", "education", "contact", "gallery"]) {
      expect(container.querySelector(`section#${id}`)).toBeInTheDocument();
    }
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("sets the page title and meta tags from site data", () => {
    const description = addMeta("description");
    const themeColor = addMeta("theme-color");
    render(<App />);

    expect(document.title).toBe(`${site.meta.siteTitle} — ${site.meta.tagline}`);
    expect(description).toHaveAttribute("content", site.meta.description);
    expect(themeColor).toHaveAttribute("content", site.meta.themeColorMeta);
  });

  it("wires the terminal to the site's sections and resume", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const user = userEvent.setup();
    render(<App />);

    const username = profile.name.split(" ")[0].toLowerCase();
    await user.click(screen.getAllByRole("button", { name: "Expand terminal" })[0]);
    const input = screen.getByRole("textbox", { name: "Terminal command input" });

    await user.type(input, "ls{Enter}");
    const sections = site.navigation.links.filter((l) => l.type === "section").map((l) => `${l.href.slice(1)}/`);
    // getByText collapses the double-space separator ls prints.
    expect(screen.getByText(sections.join(" "))).toBeInTheDocument();

    await user.type(input, "whoami{Enter}");
    expect(screen.getAllByText(username).length).toBeGreaterThan(0);

    await user.type(input, "resume{Enter}");
    expect(open).toHaveBeenCalledWith(site.navigation.resume.href, "_blank", "noopener,noreferrer");
  });
});

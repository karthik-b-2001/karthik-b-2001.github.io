import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeSelect } from "../../components/ThemeSelect";

describe("ThemeSelect", () => {
  it("defaults to dark when nothing is stored", () => {
    render(<ThemeSelect />);
    expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("restores a stored theme", () => {
    window.localStorage.setItem("theme", "sunset");
    render(<ThemeSelect />);
    expect(screen.getByRole("radio", { name: "Sunset" })).toHaveAttribute("aria-checked", "true");
  });

  it("ignores an invalid stored theme", () => {
    window.localStorage.setItem("theme", "neon");
    render(<ThemeSelect />);
    expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
  });

  it("switches theme on click and persists it", async () => {
    render(<ThemeSelect />);
    await userEvent.click(screen.getByRole("radio", { name: "Cyberpunk" }));

    expect(screen.getByRole("radio", { name: "Cyberpunk" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement).toHaveAttribute("data-theme", "cyberpunk");
    expect(window.localStorage.getItem("theme")).toBe("cyberpunk");
  });
});

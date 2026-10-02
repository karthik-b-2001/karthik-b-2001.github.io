import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTheme } from "../../hooks/useTheme";
import { mockMatchMedia } from "../helpers";

describe("useTheme", () => {
  it("follows a light system preference when nothing is stored", () => {
    mockMatchMedia((q) => q === "(prefers-color-scheme: light)");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("prefers a stored theme over the system preference", () => {
    mockMatchMedia(() => true);
    window.localStorage.setItem("theme", "cyberpunk");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("cyberpunk");
  });

  it("applies and saves a new theme", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("sunset"));
    expect(result.current.theme).toBe("sunset");
    expect(document.documentElement).toHaveAttribute("data-theme", "sunset");
    expect(window.localStorage.getItem("theme")).toBe("sunset");
  });
});

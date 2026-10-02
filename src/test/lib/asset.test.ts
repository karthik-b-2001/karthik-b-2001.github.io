import { describe, expect, it } from "vitest";
import { asset } from "../../lib/asset";

// BASE_URL is "/" here because vite.config.ts sets base: '/'.
describe("asset", () => {
  it("prefixes relative paths with the base", () => {
    expect(asset("images/me.jpg")).toBe("/images/me.jpg");
  });

  it("does not double the leading slash", () => {
    expect(asset("/images/me.jpg")).toBe("/images/me.jpg");
  });

  it.each([
    "https://example.com/a.png",
    "http://example.com/a.png",
    "//cdn.example.com/a.png",
    "mailto:me@example.com",
    "tel:+15555555555",
  ])("leaves %s untouched", (url) => {
    expect(asset(url)).toBe(url);
  });
});

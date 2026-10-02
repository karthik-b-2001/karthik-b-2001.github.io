import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";
import { MockIntersectionObserver, createMediaQueryList } from "./helpers";

// TypeAnimation's typing loop isn't cancelled on unmount, so it outlives the
// test and crashes once jsdom is torn down. Render its first string statically.
vi.mock("react-type-animation", () => ({
  TypeAnimation: ({ sequence }: { sequence: unknown[] }) => createElement("span", null, String(sequence[0])),
}));

// Browser APIs jsdom doesn't implement.
window.matchMedia = (query: string) => createMediaQueryList(query, false);
globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
Element.prototype.scrollTo ??= function () {};
Element.prototype.scrollIntoView ??= function () {};

// jsdom can't navigate; stop link clicks from logging "Not implemented: navigation".
document.addEventListener("click", (event) => {
  if ((event.target as Element).closest?.("a")) event.preventDefault();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  MockIntersectionObserver.instances.length = 0;
  window.localStorage.clear();
});

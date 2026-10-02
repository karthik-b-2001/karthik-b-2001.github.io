import { act } from "@testing-library/react";
import { vi } from "vitest";

/**
 * jsdom has no IntersectionObserver. This fake records every instance so tests
 * can decide when elements "scroll into view" via revealAll().
 */
export class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds: number[];
  readonly elements = new Set<Element>();
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? "";
    this.thresholds = [options?.threshold ?? 0].flat();
    MockIntersectionObserver.instances.push(this);
  }

  observe = vi.fn((el: Element) => {
    this.elements.add(el);
  });
  unobserve = vi.fn((el: Element) => {
    this.elements.delete(el);
  });
  disconnect = vi.fn(() => {
    this.elements.clear();
  });
  takeRecords = () => [];

  trigger(isIntersecting: boolean) {
    const entries = [...this.elements].map((target) => ({ isIntersecting, target }) as IntersectionObserverEntry);
    if (entries.length > 0) this.callback(entries, this as unknown as IntersectionObserver);
  }
}

/** Fire an intersection change on every observed element. */
export function revealAll(isIntersecting = true) {
  act(() => {
    for (const observer of MockIntersectionObserver.instances) observer.trigger(isIntersecting);
  });
}

export function createMediaQueryList(query: string, matches: boolean): MediaQueryList {
  return {
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  } as MediaQueryList;
}

/** Make window.matchMedia report a match for the queries `matches` accepts. */
export function mockMatchMedia(matches: (query: string) => boolean) {
  return vi
    .spyOn(window, "matchMedia")
    .mockImplementation((query: string) => createMediaQueryList(query, matches(query)));
}

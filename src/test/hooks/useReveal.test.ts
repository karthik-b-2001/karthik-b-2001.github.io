import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useReveal } from "../../hooks/useReveal";
import { MockIntersectionObserver } from "../helpers";

describe("useReveal", () => {
  it("does nothing when the ref is never attached", () => {
    const { result } = renderHook(() => useReveal<HTMLDivElement>());
    expect(result.current.visible).toBe(false);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });
});

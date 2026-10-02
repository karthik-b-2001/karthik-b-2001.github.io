import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScrollProgress } from "../../components/ScrollProgress";

const root = document.documentElement;

function setScroll(values: { scrollTop: number; scrollHeight: number; clientHeight: number }) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(root, key, { value, configurable: true });
  }
}

describe("ScrollProgress", () => {
  afterEach(() => {
    for (const key of ["scrollTop", "scrollHeight", "clientHeight"]) Reflect.deleteProperty(root, key);
  });

  it("starts at 0% when the page can't scroll", () => {
    const { container } = render(<ScrollProgress />);
    expect(container.firstChild).toHaveStyle({ width: "0%" });
  });

  it("tracks how far the page has scrolled", () => {
    const { container } = render(<ScrollProgress />);
    setScroll({ scrollTop: 500, scrollHeight: 2000, clientHeight: 1000 });
    fireEvent.scroll(window);
    expect(container.firstChild).toHaveStyle({ width: "50%" });

    setScroll({ scrollTop: 1000, scrollHeight: 2000, clientHeight: 1000 });
    fireEvent.scroll(window);
    expect(container.firstChild).toHaveStyle({ width: "100%" });
  });

  it("stops listening when unmounted", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ScrollProgress />);
    unmount();
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});

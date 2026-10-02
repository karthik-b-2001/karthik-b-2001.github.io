import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("main", () => {
  it("mounts the app into #root", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await import("../main.tsx");
    await waitFor(() => expect(screen.getByRole("main")).toBeInTheDocument());
    expect(document.getElementById("root")).not.toBeEmptyDOMElement();
  });
});

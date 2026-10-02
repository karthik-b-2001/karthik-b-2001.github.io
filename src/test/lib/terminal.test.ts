import { describe, expect, it } from "vitest";
import { runCommand, type TerminalContext } from "../../lib/terminal";

const ctx: TerminalContext = {
  username: "karthik",
  role: "Software Engineer",
  sectionIds: ["home", "about", "projects", "contact"],
  highlights: [{ label: "location", value: "Boston" }],
  resumeHref: "/resume.pdf",
};

describe("runCommand", () => {
  it("returns nothing for blank input", () => {
    expect(runCommand("   ", ctx)).toEqual({ lines: [] });
  });

  it("prints help", () => {
    expect(runCommand("help", ctx).lines[0]).toBe("Available commands:");
  });

  it("prints the username for whoami", () => {
    expect(runCommand("whoami", ctx).lines).toEqual(["karthik"]);
  });

  it("prints a neofetch summary with an underline matching the header", () => {
    const { lines } = runCommand("neofetch", ctx);
    expect(lines).toEqual([
      "karthik@portfolio",
      "-".repeat("karthik@portfolio".length),
      "role: Software Engineer",
      "location: Boston",
    ]);
  });

  it("treats fetch as an alias of neofetch", () => {
    expect(runCommand("fetch", ctx)).toEqual(runCommand("neofetch", ctx));
  });

  it("lists sections except home", () => {
    expect(runCommand("ls", ctx).lines).toEqual(["about/  projects/  contact/"]);
  });

  it("navigates with cd, case-insensitively", () => {
    expect(runCommand("cd Projects", ctx)).toEqual({
      lines: ["→ projects"],
      action: { type: "navigate", id: "projects" },
    });
  });

  it("navigates with the / shortcut", () => {
    expect(runCommand("/about", ctx).action).toEqual({ type: "navigate", id: "about" });
  });

  it("prints /home for a bare cd", () => {
    expect(runCommand("cd", ctx)).toEqual({ lines: ["/home"] });
  });

  it("errors on an unknown section", () => {
    const result = runCommand("cd nowhere", ctx);
    expect(result.lines).toEqual(["bash: cd: nowhere: No such file or directory"]);
    expect(result.action).toBeUndefined();
  });

  it("opens the resume", () => {
    expect(runCommand("resume", ctx).action).toEqual({ type: "open", href: "/resume.pdf" });
  });

  it("jumps to contact", () => {
    expect(runCommand("contact", ctx).action).toEqual({ type: "navigate", id: "contact" });
  });

  it("clears the terminal", () => {
    expect(runCommand("clear", ctx)).toEqual({ lines: [], action: { type: "clear" } });
  });

  it("denies sudo", () => {
    expect(runCommand("sudo rm -rf /", ctx).lines).toEqual(["Permission denied: nice try."]);
  });

  it("reports unknown commands", () => {
    expect(runCommand("  vim  ", ctx).lines).toEqual(["bash: vim: command not found"]);
  });
});

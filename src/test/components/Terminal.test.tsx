import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Terminal } from "../../components/Terminal";
import { mockMatchMedia } from "../helpers";

function setup() {
  const user = userEvent.setup();
  render(
    <Terminal
      username="karthik"
      role="Software Engineer"
      sectionIds={["home", "about", "projects"]}
      highlights={[{ label: "experience", value: "3 yrs" }]}
      resumeHref="/resume.pdf"
    />,
  );
  const input = screen.getByRole("textbox", { name: "Terminal command input" });
  return { user, input };
}

const titlebar = () => screen.getAllByRole("button", { name: "Expand terminal" })[0];

async function setupExpanded() {
  const ctx = setup();
  await ctx.user.click(titlebar());
  return ctx;
}

describe("Terminal", () => {
  afterEach(() => {
    document.getElementById("projects")?.remove();
  });

  describe("window", () => {
    it("starts minimized with the boot screen already printed", () => {
      const { input } = setup();
      // The titlebar and the chevron button both offer to expand.
      expect(screen.getAllByRole("button", { name: "Expand terminal" })).toHaveLength(2);
      expect(screen.getByText("karthik")).toBeInTheDocument();
      expect(screen.getByText("Welcome. Type 'help' to see available commands.")).toBeInTheDocument();
      expect(screen.getByText("role: Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("experience: 3 yrs")).toBeInTheDocument();
      expect(input).toHaveAttribute("tabindex", "-1");
    });

    it("expands and focuses the input when the titlebar is clicked", async () => {
      const { input } = await setupExpanded();
      expect(screen.getByRole("button", { name: "Minimize terminal" })).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("karthik@portfolio: ~")).toBeInTheDocument();
      expect(input).toHaveFocus();
      expect(input).toHaveAttribute("tabindex", "0");
    });

    it("stays open when the titlebar is clicked while expanded", async () => {
      const { user } = await setupExpanded();
      await user.click(screen.getByText("karthik@portfolio: ~"));
      expect(screen.getByRole("button", { name: "Minimize terminal" })).toBeInTheDocument();
    });

    it("toggles with the chevron button", async () => {
      const { user } = await setupExpanded();
      await user.click(screen.getByRole("button", { name: "Minimize terminal" }));
      expect(screen.getAllByRole("button", { name: "Expand terminal" })).toHaveLength(2);

      await user.click(screen.getAllByRole("button", { name: "Expand terminal" })[1]);
      expect(screen.getByRole("button", { name: "Minimize terminal" })).toBeInTheDocument();
    });

    it.each(["Enter", " "])("expands from the keyboard with %j", (key) => {
      setup();
      fireEvent.keyDown(titlebar(), { key });
      expect(screen.getByRole("button", { name: "Minimize terminal" })).toBeInTheDocument();
    });

    it("ignores other keys on the titlebar", () => {
      setup();
      const bar = titlebar();
      fireEvent.keyDown(bar, { key: "a" });
      expect(screen.queryByRole("button", { name: "Minimize terminal" })).not.toBeInTheDocument();

      fireEvent.keyDown(bar, { key: "Enter" });
      fireEvent.keyDown(bar, { key: "Enter" }); // already open: no-op
      expect(screen.getByRole("button", { name: "Minimize terminal" })).toBeInTheDocument();
    });

    it("focuses the input when the body is clicked", async () => {
      const { user, input } = await setupExpanded();
      act(() => input.blur());
      await user.click(screen.getByText("Welcome. Type 'help' to see available commands."));
      expect(input).toHaveFocus();
    });
  });

  describe("commands", () => {
    it("echoes the command and prints its output", async () => {
      const { user, input } = await setupExpanded();
      await user.type(input, "whoami{Enter}");
      expect(screen.getByText("whoami")).toBeInTheDocument();
      expect(screen.getByText("karthik")).toBeInTheDocument();
      expect(input).toHaveValue("");
    });

    it("reports unknown commands", async () => {
      const { user, input } = await setupExpanded();
      await user.type(input, "vim{Enter}");
      expect(screen.getByText("bash: vim: command not found")).toBeInTheDocument();
    });

    it("clears the screen", async () => {
      const { user, input } = await setupExpanded();
      await user.type(input, "clear{Enter}");
      expect(screen.queryByText("Welcome. Type 'help' to see available commands.")).not.toBeInTheDocument();
      expect(screen.queryByText("clear")).not.toBeInTheDocument();
    });

    it("scrolls smoothly to a section on cd", async () => {
      const section = document.createElement("section");
      section.id = "projects";
      document.body.appendChild(section);
      const scroll = vi.spyOn(Element.prototype, "scrollIntoView");

      const { user, input } = await setupExpanded();
      await user.type(input, "cd projects{Enter}");

      expect(screen.getByText("→ projects")).toBeInTheDocument();
      expect(scroll).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
      expect(scroll.mock.contexts[0]).toBe(section);
    });

    it("jumps without animation when reduced motion is preferred", async () => {
      const section = document.createElement("section");
      section.id = "projects";
      document.body.appendChild(section);
      mockMatchMedia((q) => q.includes("reduced-motion"));
      const scroll = vi.spyOn(Element.prototype, "scrollIntoView");

      const { user, input } = await setupExpanded();
      await user.type(input, "/projects{Enter}");

      expect(scroll).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    });

    it("does not crash when the section isn't on the page", async () => {
      const { user, input } = await setupExpanded();
      await user.type(input, "cd about{Enter}");
      expect(screen.getByText("→ about")).toBeInTheDocument();
    });

    it("opens the resume in a new tab", async () => {
      const open = vi.spyOn(window, "open").mockImplementation(() => null);
      const { user, input } = await setupExpanded();
      await user.type(input, "resume{Enter}");
      expect(open).toHaveBeenCalledWith("/resume.pdf", "_blank", "noopener,noreferrer");
    });
  });

  describe("history", () => {
    it("walks back and forward through previous commands", async () => {
      const { user, input } = await setupExpanded();
      await user.type(input, "help{Enter}");
      await user.type(input, "ls{Enter}");

      await user.keyboard("{ArrowUp}");
      expect(input).toHaveValue("ls");
      await user.keyboard("{ArrowUp}");
      expect(input).toHaveValue("help");
      await user.keyboard("{ArrowUp}"); // stops at the oldest entry
      expect(input).toHaveValue("help");

      await user.keyboard("{ArrowDown}");
      expect(input).toHaveValue("ls");
      await user.keyboard("{ArrowDown}"); // past the newest entry: back to an empty prompt
      expect(input).toHaveValue("");
      await user.keyboard("{ArrowDown}"); // nothing selected: no-op
      expect(input).toHaveValue("");
    });

    it("does nothing on ArrowUp with no history", async () => {
      const { user, input } = await setupExpanded();
      await user.keyboard("{ArrowUp}");
      expect(input).toHaveValue("");
    });

    it("prints an empty prompt for a blank command but doesn't record it", async () => {
      const { user, input } = await setupExpanded();
      await user.keyboard("{Enter}");
      // One prompt on the input row, one for the blank command line.
      expect(screen.getAllByText("karthik@portfolio:~$")).toHaveLength(2);

      await user.keyboard("{ArrowUp}");
      expect(input).toHaveValue("");
    });
  });
});

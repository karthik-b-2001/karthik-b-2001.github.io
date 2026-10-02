import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Gallery } from "../../components/Gallery";
import { gallery } from "../../data";

const [first, second, , last] = gallery.photos;

function openFirst() {
  const user = userEvent.setup();
  render(<Gallery data={gallery} />);
  return user.click(screen.getByRole("button", { name: `View ${first.alt}` })).then(() => user);
}

const dialog = () => screen.getByRole("dialog");

describe("Gallery", () => {
  it("renders the heading and a tile per photo", () => {
    render(<Gallery data={gallery} />);
    expect(screen.getByRole("heading", { name: gallery.eyebrow })).toBeInTheDocument();
    expect(screen.getByText(gallery.subheading)).toBeInTheDocument();
    for (const photo of gallery.photos) {
      expect(screen.getByRole("img", { name: photo.alt })).toHaveAttribute("src", photo.src);
      expect(screen.getByText(photo.caption)).toBeInTheDocument();
    }
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a lightbox for the clicked photo", async () => {
    await openFirst();
    expect(dialog()).toHaveAccessibleName(first.alt);
    expect(within(dialog()).getByRole("img")).toHaveAttribute("src", first.src);
    expect(within(dialog()).getByText(first.caption)).toBeInTheDocument();
  });

  it("moves between photos with the arrow buttons, wrapping at the ends", async () => {
    const user = await openFirst();
    await user.click(screen.getByRole("button", { name: "Next photo" }));
    expect(dialog()).toHaveAccessibleName(second.alt);

    await user.click(screen.getByRole("button", { name: "Previous photo" }));
    await user.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(dialog()).toHaveAccessibleName(last.alt);

    await user.click(screen.getByRole("button", { name: "Next photo" }));
    expect(dialog()).toHaveAccessibleName(first.alt);
  });

  it("moves between photos with the arrow keys", async () => {
    await openFirst();
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(dialog()).toHaveAccessibleName(last.alt);
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(dialog()).toHaveAccessibleName(first.alt);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(dialog()).toHaveAccessibleName(first.alt);
  });

  it("closes on Escape", async () => {
    await openFirst();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closes with the close button", async () => {
    const user = await openFirst();
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closes when the backdrop is clicked but not the photo", async () => {
    const user = await openFirst();
    await user.click(within(dialog()).getByRole("img"));
    expect(dialog()).toBeInTheDocument();

    await user.click(dialog());
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("hides the arrows and caption for a single uncaptioned photo", async () => {
    const user = userEvent.setup();
    render(<Gallery data={{ ...gallery, photos: [{ src: "/gallery/solo.jpg", alt: "Solo shot" }] }} />);
    await user.click(screen.getByRole("button", { name: "View Solo shot" }));

    expect(dialog()).toHaveAccessibleName("Solo shot");
    expect(screen.queryByRole("button", { name: "Next photo" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous photo" })).not.toBeInTheDocument();
    expect(within(dialog()).queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("shows a placeholder and disables the tile when an image fails to load", () => {
    render(<Gallery data={gallery} />);
    fireEvent.error(screen.getByRole("img", { name: first.alt }));

    expect(screen.queryByRole("img", { name: first.alt })).not.toBeInTheDocument();
    expect(screen.getByText("Add photo-1.jpg to /public/gallery")).toBeInTheDocument();
    expect(screen.getByText("Add photo-1.jpg to /public/gallery").closest("button")).toBeDisabled();
  });
});

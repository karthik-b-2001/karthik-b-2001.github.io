import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { About } from "../../components/About";
import { Contact } from "../../components/Contact";
import { Education } from "../../components/Education";
import { Experience } from "../../components/Experience";
import { Footer } from "../../components/Footer";
import { Projects } from "../../components/Projects";
import { education, experience, profile, projects, site } from "../../data";

const email = profile.socials.find((s) => s.icon === "mail")!;
const github = profile.socials.find((s) => s.icon === "github")!;
const socialName = (s: { label: string; handle: string }) => `${s.label}: ${s.handle}`;

describe("About", () => {
  it("renders the paragraphs, highlights and location", () => {
    render(<About about={profile.about} highlights={profile.hero.highlights} location={profile.contact.location} />);

    expect(screen.getByRole("heading", { name: profile.about.eyebrow })).toBeInTheDocument();
    profile.about.paragraphs.forEach((text, i) => {
      const p = screen.getByText(text);
      // The last paragraph is dimmed.
      if (i === profile.about.paragraphs.length - 1) expect(p).toHaveStyle({ opacity: "0.75" });
      else expect(p).not.toHaveStyle({ opacity: "0.75" });
    });
    for (const h of profile.hero.highlights) {
      expect(screen.getByText(h.value)).toBeInTheDocument();
      expect(screen.getByText(h.label)).toBeInTheDocument();
    }
    expect(screen.getByText(profile.contact.location)).toBeInTheDocument();
  });
});

describe("Contact", () => {
  it("renders the pitch and email links", () => {
    render(<Contact contact={profile.contact} socials={profile.socials} />);

    expect(screen.getByRole("heading", { name: profile.contact.eyebrow })).toBeInTheDocument();
    expect(screen.getByText(profile.contact.availability)).toBeInTheDocument();
    expect(screen.getByText(profile.contact.blurb)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: profile.contact.email })).toHaveAttribute("href", `mailto:${profile.contact.email}`);
    expect(screen.getByRole("link", { name: "Say hello" })).toHaveAttribute("href", `mailto:${profile.contact.email}`);
    expect(screen.getByText(profile.contact.location)).toBeInTheDocument();
  });

  it("links every social except email, which already has its own button", () => {
    render(<Contact contact={profile.contact} socials={profile.socials} />);

    expect(screen.getByRole("link", { name: socialName(github) })).toHaveAttribute("href", github.href);
    expect(screen.getByRole("link", { name: socialName(github) })).toHaveAttribute("target", "_blank");
    expect(screen.queryByRole("link", { name: socialName(email) })).not.toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("renders the brand, socials and current year", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2031-06-01"));
    render(<Footer brand={site.navigation.brand} name={profile.name} tagline={site.meta.tagline} socials={profile.socials} />);

    expect(screen.getByText(site.navigation.brand)).toBeInTheDocument();
    expect(screen.getByText(`© 2031 ${profile.name} · ${site.meta.tagline}`)).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(profile.socials.length);
    // Email opens the mail client in place; everything else opens a new tab.
    expect(screen.getByRole("link", { name: socialName(email) })).not.toHaveAttribute("target");
    expect(screen.getByRole("link", { name: socialName(github) })).toHaveAttribute("target", "_blank");
  });
});

describe("Experience", () => {
  it("renders every role with its details", () => {
    render(<Experience data={experience} />);

    expect(screen.getByRole("heading", { name: experience.eyebrow })).toBeInTheDocument();
    expect(screen.getByText(experience.subheading)).toBeInTheDocument();
    for (const item of experience.items) {
      expect(screen.getAllByText(item.role).length).toBeGreaterThan(0);
      expect(screen.getByText(item.summary)).toBeInTheDocument();
      for (const h of item.highlights) expect(screen.getByText(h)).toBeInTheDocument();
      for (const s of item.stack) expect(screen.getAllByText(s).length).toBeGreaterThan(0);
    }
  });

  it("appends the client to the company when there is one", () => {
    render(<Experience data={experience} />);
    for (const item of experience.items) {
      const label = item.client ? `${item.company} · ${item.client}` : item.company;
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});

describe("Education", () => {
  it("renders each degree and shows a GPA only where one is set", () => {
    render(<Education data={education} />);

    expect(screen.getByRole("heading", { name: education.eyebrow })).toBeInTheDocument();
    for (const item of education.items) {
      expect(screen.getByText(item.degree)).toBeInTheDocument();
      expect(screen.getByText(item.institution)).toBeInTheDocument();
      for (const h of item.highlights) expect(screen.getByText(h)).toBeInTheDocument();
    }
    const withGpa = education.items.filter((i) => i.gpa);
    expect(screen.getAllByText(/^GPA /)).toHaveLength(withGpa.length);
  });

  it("lists certifications with links", () => {
    render(<Education data={education} />);

    expect(screen.getByText("Certifications")).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: "Link ↗" });
    expect(links.map((a) => a.getAttribute("href"))).toEqual(education.certifications.map((c) => c.href));
    for (const cert of education.certifications) {
      expect(screen.getByText(cert.name)).toBeInTheDocument();
      expect(screen.getByText(`${cert.issuer} · ${cert.date}`)).toBeInTheDocument();
    }
  });

  it("omits the certifications block when there are none", () => {
    render(<Education data={{ ...education, certifications: [] }} />);
    expect(screen.queryByText("Certifications")).not.toBeInTheDocument();
  });
});

describe("Projects", () => {
  it("renders every project with its details, chips and links", () => {
    render(<Projects data={projects} />);

    expect(screen.getByRole("heading", { name: projects.eyebrow })).toBeInTheDocument();
    expect(screen.getByText(projects.subheading)).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      ...projects.items.filter((p) => p.featured).map((p) => p.title),
      ...projects.items.filter((p) => !p.featured).map((p) => p.title),
    ]);

    for (const project of projects.items) {
      const card = within(screen.getByRole("heading", { name: project.title }).closest("div.relative") as HTMLElement);
      expect(card.getByText(project.subtitle)).toBeInTheDocument();
      expect(card.getByText(project.blurb)).toBeInTheDocument();
      for (const d of project.details) expect(card.getByText(d)).toBeInTheDocument();
      for (const chip of [...project.tags, ...project.stack]) expect(card.getAllByText(chip).length).toBeGreaterThan(0);
      for (const link of project.links) {
        expect(card.getByRole("link", { name: link.label })).toHaveAttribute("href", link.href);
      }
    }
  });

  it("handles projects with no details or links", () => {
    const bare = { ...projects.items[0], details: [], links: [] };
    render(<Projects data={{ ...projects, items: [bare] }} />);

    expect(screen.getByRole("heading", { name: bare.title })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders when nothing is featured", () => {
    const items = projects.items.map((p) => ({ ...p, featured: false }));
    render(<Projects data={{ ...projects, items }} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(items.length);
  });
});

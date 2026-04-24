"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PortfolioEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const indicator = document.getElementById("navIndicator");
    const nav = document.getElementById("mainNav");

    const reveals = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), 50);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    reveals.forEach((el) => revealObserver.observe(el));

    const navLinks =
      document.querySelectorAll<HTMLAnchorElement>("nav a[data-section]");

    const updateIndicator = (activeLink: HTMLAnchorElement) => {
      if (!nav || !indicator) return;
      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      indicator.style.top = linkRect.top - navRect.top + "px";
      indicator.style.height = linkRect.height + "px";
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("active"));
            const link = document.querySelector<HTMLAnchorElement>(
              `nav a[data-section="${entry.target.id}"]`
            );
            if (link) {
              link.classList.add("active");
              updateIndicator(link);
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => sectionObserver.observe(s));

    const onNavClick = (e: Event) => {
      e.preventDefault();
      const link = e.currentTarget as HTMLAnchorElement;
      const href = link.getAttribute("href");
      if (!href) return;
      const target = document.querySelector(href);
      if (target)
        (target as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    };
    navLinks.forEach((l) => l.addEventListener("click", onNavClick));

    const firstActive = document.querySelector<HTMLAnchorElement>(
      "nav a.active"
    );
    if (firstActive) {
      const id = setTimeout(() => updateIndicator(firstActive), 100);
      return () => {
        clearTimeout(id);
        navLinks.forEach((l) => l.removeEventListener("click", onNavClick));
        revealObserver.disconnect();
        sectionObserver.disconnect();
      };
    }

    return () => {
      navLinks.forEach((l) => l.removeEventListener("click", onNavClick));
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, [pathname]);

  return null;
}

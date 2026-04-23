"use client";

import { useEffect } from "react";

export default function PortfolioEffects() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursorRing");

    let mx = -100,
      my = -100,
      rx = -100,
      ry = -100;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursor) {
        cursor.style.left = mx + "px";
        cursor.style.top = my + "px";
      }
    };

    const animateRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring) {
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
      }
      rafId = requestAnimationFrame(animateRing);
    };

    document.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(animateRing);

    const hoverTargets = document.querySelectorAll(
      "a, button, .skill-list li, .post-item, .run-item, .book-thumb, .book-current, .project-row, .work-item"
    );
    const addExpanded = () => cursor?.classList.add("expanded");
    const removeExpanded = () => cursor?.classList.remove("expanded");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", addExpanded);
      el.addEventListener("mouseleave", removeExpanded);
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      hoverTargets.forEach((el) => {
        el.removeEventListener("mouseenter", addExpanded);
        el.removeEventListener("mouseleave", removeExpanded);
      });
    };
  }, []);

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
  }, []);

  return (
    <>
      <div className="cursor" id="cursor" />
      <div className="cursor-ring" id="cursorRing" />
    </>
  );
}

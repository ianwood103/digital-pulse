"use client";

import { ReactNode, useState } from "react";

interface Props {
  children: ReactNode;
}

export default function SidebarShell({ children }: Props) {
  const [open, setOpen] = useState(false);
  const contentId = "sidebar-collapsible-content";

  return (
    <aside
      className={`sidebar ${open ? "sidebar-is-open" : "sidebar-is-closed"}`}
    >
      <button
        type="button"
        className="sidebar-mobile-bar"
        aria-expanded={open}
        aria-controls={contentId}
        aria-label={open ? "Collapse menu" : "Expand menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sidebar-mobile-name">Ian Wood</span>
        <span className="sidebar-mobile-sub">Software Engineer</span>
        <span className="sidebar-mobile-icon" aria-hidden="true">
          <span className="sidebar-mobile-icon-bar sidebar-mobile-icon-bar--h" />
          <span className="sidebar-mobile-icon-bar sidebar-mobile-icon-bar--v" />
        </span>
      </button>
      <div id={contentId} className="sidebar-collapsible">
        <div className="sidebar-collapsible-inner">{children}</div>
      </div>
    </aside>
  );
}

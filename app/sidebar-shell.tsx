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
        <span className="sidebar-mobile-sub">Senior Software Engineer</span>
        <span className="sidebar-mobile-icon" aria-hidden="true">
          <svg
            viewBox="0 0 12 12"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3,4.5 6,7.5 9,4.5" />
          </svg>
        </span>
      </button>
      <div id={contentId} className="sidebar-collapsible">
        <div className="sidebar-collapsible-inner">{children}</div>
      </div>
    </aside>
  );
}

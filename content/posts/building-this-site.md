---
slug: building-this-site
title: Building This Site with Claude Code
date: 2026-04-15
readTime: 4 min
excerpt: How I set up a deployment pipeline that lets me ship changes from my phone — no laptop required.
---

A few months ago I decided I wanted a portfolio site that I could actually maintain. Not just write once and forget, but genuinely update — new posts, new projects, tweaked copy — without opening a laptop.

The constraint shaped everything.

## The Stack

Next.js on Vercel was an obvious starting point. Static generation for most pages, server components where I need live data. The deployment model is clean: push to main, Vercel picks it up, site updates in about a minute.

What's less obvious is the authoring side. I wanted to write in Markdown, keep posts in the repo, and have the build handle the rest. No CMS, no admin panel, no database. Just files.

```
content/
  posts/
    building-this-site.md
    on-running.md
```

Each post is a `.md` file with YAML frontmatter. `gray-matter` parses the frontmatter at build time. `marked` converts the body to HTML. The result is statically generated at build time — no runtime rendering, no API calls.

## The Pipeline

Here's where it gets interesting. The whole thing is driven by Claude Code and GitHub Actions.

When I file a GitHub issue describing what I want — "add a blog", "update the bio", "fix the nav" — Claude Code picks it up, creates a branch, implements the change, and opens a PR. I review it on my phone, merge it, and Vercel deploys.

I haven't opened a code editor for most of the changes on this site.

The Claude Code action runs on `ubuntu-latest`. It has write access to the repo and can push branches. The prompts come from issue bodies and comments. The implementation comes from Claude.

## What Works

The read-only integrations — Strava for running data, Goodreads for books — are pulled at build time with an hourly revalidation. They're fast, they don't require authentication at runtime, and they degrade gracefully if the upstream is down.

The blog is fully static. `generateStaticParams` prerenders every post at build time. Adding a new post is a commit.

## What I'd Do Differently

The one thing I'd reconsider is the CSS approach. I went with plain CSS in `globals.css` — no Tailwind utilities, no CSS modules — because the mockup was plain CSS and I wanted fidelity. It's fine at this scale. It would not scale past this.

But for a single-person portfolio that I'm maintaining via AI-generated PRs? It's fine. Fidelity to the design matters more than abstraction purity.

## Takeaway

The best infrastructure is the kind you stop thinking about. This pipeline isn't perfect, but it's invisible enough that I can focus on what I'm actually writing rather than how to publish it.

That's the goal.

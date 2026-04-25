---
name: new-post
description: Publish a new blog post to the digital-pulse site from a paragraph or rough draft. Trigger this whenever the user says they want to write/publish/ship/draft a post, blog entry, or piece of writing for the site, or hands you prose that's clearly meant to go on the writing section. Handles the full pipeline end-to-end: writes the markdown file, verifies the build, commits on a fresh branch, and opens a PR into main. Use this even when the user phrases it casually ("turn this into a post", "put this on the site", "let's get this published") — they almost never want to do the git/PR steps by hand.
---

# new-post

End-to-end pipeline for publishing a blog post to digital-pulse from prose input. The user gives you a paragraph (or several); you give them a PR link.

## Why this skill exists

The post loader at `app/lib/posts.ts` already does smart fallbacks:
- **slug** ← filename
- **title** ← first `# heading` in the body (stripped from rendered output) or title-cased filename
- **excerpt** ← first paragraph (markdown stripped)
- **readTime** ← computed from word count
- **date** ← today (UTC), unless overridden in frontmatter

Because of that, the *content* part of publishing is just "write a markdown file with an H1 and some prose." Everything humans usually fuss over (frontmatter, computing read time, writing excerpts) is automatic.

What's *not* automatic is the surrounding plumbing: picking a slug, branching, building, committing, pushing, opening the PR. That's what this skill does.

## The workflow

Run through these steps in order. Don't skip the verification — the whole point of this pipeline is shipping with confidence.

### 1. Understand the input

The user has handed you prose. Figure out which shape it's in:

- **Already has a `# Title` line** → use it as the title. Body stays as-is.
- **Just a paragraph or untitled prose** → propose a title yourself based on the content and confirm with the user before writing the file. Keep titles short, declarative, lowercase-friendly (the homepage renders them in a serif heading style — see existing posts for tone).

Don't pad the post. If the user gave you one paragraph, ship one paragraph. The site already handles short posts gracefully.

### 2. Derive the slug

The slug is the filename (sans `.md`) and becomes the URL: `/posts/<slug>`.

Rules:
- lowercase
- alphanumerics and hyphens only
- 2–6 words is the sweet spot (matches existing posts like `welcome-to-my-digital-pulse`)
- derive from the title, not the content

Before writing, check that `content/posts/<slug>.md` doesn't already exist. If it does, append `-2`, `-3`, etc., or pick a different slug — don't overwrite.

### 3. Verify the working tree is clean

Run `git status`. If there are uncommitted changes the user didn't mention, **stop and ask** — they may have in-progress work you'd be sweeping into the post branch. Don't `git stash` or `git reset` to clear it; that's destructive.

If the working tree is clean, continue.

### 4. Branch from main

Always start from a fresh branch off the latest `main`:

```bash
git checkout main
git pull
git checkout -b post/<slug>
```

Branch naming convention: `post/<slug>`. This matches the project's existing convention of topical branch prefixes.

### 5. Write the file

Create `content/posts/<slug>.md`. The minimum content is:

```md
# Post Title

First paragraph (becomes the excerpt automatically).

Rest of the body...
```

**Light editing pass.** Before writing, do two small touch-ups on the user's prose — nothing that changes their voice:

- **Excerpt.** The homepage shows the first paragraph as the card summary. If the user's first paragraph is more than ~40 words, write a 1–2 sentence abstract (≤40 words) and put it in frontmatter as `excerpt:`. Pull the framing directly from the post; don't editorialize. Leave the body untouched.
- **Headings.** If the post is a single wall of text (one giant paragraph, or two+ paragraphs with no structure), insert 1–3 H2 (`##`) section headings at natural topic breaks. Don't invent content, don't reorder, don't rewrite — just label sections that already exist. If the prose already has structure, skip this.

Both touch-ups are optional. Short, well-formed posts need neither. When in doubt, leave it alone.

Other frontmatter is **only** needed when overriding a default. The most common reason is backdating:

```md
---
date: 2026-04-15
excerpt: One- or two-sentence abstract.
---

# Post Title

Body...
```

Don't add `slug`, `title`, or `readTime` to frontmatter unless the user explicitly wants to override them.

If the user's prose is straight markdown (headings, lists, links, code fences), preserve it. The page renderer uses `marked` with GFM enabled, so standard GitHub-flavored markdown works.

### 6. Verify the build

Run `npm run build` from the repo root. This is the real verification: `generateStaticParams` in `app/posts/[slug]/page.tsx` calls `getAllPosts()`, which parses every markdown file. If the new file has malformed frontmatter or anything else that breaks parsing, the build fails here.

If the build fails:
- read the error
- fix it (usually it's a frontmatter typo or an unclosed code fence)
- rerun the build

Don't skip the build to save time. The whole pipeline is built around shipping with the green light from the actual build that Vercel will run.

If `npm run build` is too slow for a tight loop while debugging, a faster sanity check is `node --experimental-strip-types -e "import('./app/lib/posts.ts').then(m => console.log(m.getAllPosts()))"` — but always finish with the real build before committing.

### 7. Commit

Stage just the new file (avoid `git add -A` — it can sweep in unrelated dotfiles):

```bash
git add content/posts/<slug>.md
```

Commit message style (look at recent commits with `git log --oneline -10` to match the project's voice). Existing commits are short, imperative, lowercase-style branch names but Title Case commit subjects, e.g. "Add in-progress placeholder and prune shipped projects". Aim for the same: a short subject line, no period, no body unless the post itself is unusually large or notable.

Use a HEREDOC for the commit message to preserve formatting and append the standard Claude attribution trailer the project uses elsewhere.

### 8. Push and open the PR

```bash
git push -u origin post/<slug>
```

Then open the PR with `gh pr create` against `main`. Title: the post title. Body: a short summary (1–2 sentences) of what the post is about, plus a link/path to the new file. Keep it minimal — the post itself is the artifact under review.

Use a HEREDOC for the body so it renders correctly:

```bash
gh pr create --title "<Post Title>" --base main --body "$(cat <<'EOF'
## Summary
New post: `content/posts/<slug>.md`. <one-line description of what the post is about>.

## Test plan
- [ ] `npm run build` passes locally
- [ ] Post renders at `/posts/<slug>` on the preview deployment
- [ ] Excerpt and read time look right on the homepage
EOF
)"
```

### 9. Hand the PR URL back to the user

Print the PR URL. They review and merge from their phone — that's the design intent of the whole site.

## Things to avoid

- **Don't auto-merge.** Always stop at "PR opened." The user wants to review on their phone.
- **Don't write a long post out of a short one.** If the user gave you one paragraph, that's the post. Embellishment on someone else's writing is rarely welcome.
- **Don't add unnecessary frontmatter.** The whole architecture is "write less, derive more." Adding `title:`/`excerpt:`/`readTime:` when the loader already handles them is pure clutter.
- **Don't skip the build.** A typo in frontmatter or a stray backtick will break the build, and you'd rather catch it locally than after the PR is opened.
- **Don't commit to main directly.** Even though this is a personal site, the pipeline is "branch → PR → review → merge." Bypassing the review step removes the user's chance to read on their phone before publishing.
- **Don't push if the user only asked you to draft.** If the user phrases it like "draft a post about X" without asking for the full pipeline, write the file but stop before committing. Confirm before continuing.

## Edge cases

- **Repo has uncommitted changes.** Stop and surface them — don't try to be helpful by stashing.
- **`gh` not authenticated.** `gh pr create` will fail with an auth message. Surface it; tell the user to run `gh auth login` and rerun.
- **Slug collision.** Append `-2`, `-3`, etc., or ask the user for a different slug.
- **Build fails.** Don't push. Fix locally, rebuild, then push.
- **User explicitly wants to override defaults** (custom excerpt, custom read time, etc.). Honor it — add the relevant frontmatter field. The defaults are a fallback, not a constraint.

## A worked example

User: *"can you turn this into a post: I've been thinking lately about how every productivity system I've tried eventually collapses under its own weight..."*

Steps:

1. The prose has no `# heading`. Propose a title: "On Productivity System Collapse" → confirm with the user.
2. Slug: `on-productivity-system-collapse`. No collision.
3. `git status` clean. `git checkout main && git pull && git checkout -b post/on-productivity-system-collapse`.
4. Write `content/posts/on-productivity-system-collapse.md`:
   ```md
   # On Productivity System Collapse

   I've been thinking lately about how every productivity system I've tried eventually collapses under its own weight...
   ```
5. `npm run build` → passes.
6. `git add content/posts/on-productivity-system-collapse.md && git commit -m "Add post on productivity system collapse"`.
7. `git push -u origin post/on-productivity-system-collapse`.
8. `gh pr create --title "On Productivity System Collapse" --base main --body "..."`.
9. Print the PR URL.

That's the whole loop.

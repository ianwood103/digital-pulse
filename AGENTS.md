<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Publishing posts

When the user hands you prose meant for the writing section of the site (phrases like "turn this into a post", "publish this", "ship this") use the `new-post` skill at `.claude/skills/new-post/SKILL.md`. It owns the full pipeline: write the markdown file, verify with `npm run build`, commit on a fresh branch, and open a PR into `main`. Don't run those steps by hand — the skill exists so the workflow stays consistent and the user can review on their phone.

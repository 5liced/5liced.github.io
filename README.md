# root@writeups — a dark Jekyll theme for HTB writeups

Terminal-inspired dark theme with an amber phosphor accent, a signature
"attack-chain rail" that scrollspies your writeup's `##` headings, and a
homepage styled as a literal `ls -la` directory listing.

## Quick start

1. **Rename your repo** to `yourusername.github.io` (or keep any name and
   enable Pages on it — subpath just changes the URL).
2. Edit `_config.yml` — set `title`, `author`, `email`, `url`,
   `github_username`, `twitter_username`.
3. Push to GitHub, then in **Settings → Pages** set the source to
   your `main` branch (or GitHub Actions, whichever you prefer).
4. Delete `_posts/2026-07-18-htb-example-forest.md` once you've read it,
   and write your own.

## Writing a writeup

Every post needs this frontmatter — it drives the badges and the homepage
listing automatically:

```yaml
---
layout: post
title: "Forest — HTB Writeup"
box_name: Forest
os: Windows            # Windows / Linux
difficulty: Easy       # Easy / Medium / Hard / Insane
points: 20
retired: "2026-07-01"
tags: [active-directory, kerberoasting]
---
```

Use `## Heading` (h2) for each stage of the attack chain (Recon, Foothold,
Privilege Escalation, Root, etc.) — the sidebar rail auto-builds itself
from these headings, so name them however your writeup is actually
structured.

Use `<div class="flag">user.txt captured</div>` inline in markdown to drop
in a flag-capture callout.

## Local preview

```bash
bundle install
bundle exec jekyll serve
```

Visit `http://localhost:4000`.

## SEO checklist (already wired in)

- `jekyll-seo-tag` + `jekyll-sitemap` + `jekyll-feed` are enabled in
  `_config.yml` — sitemap.xml and feed.xml generate automatically.
- Fill in `_config.yml`'s `title`/`description` — these become your
  meta tags.
- Once live, submit your sitemap (`https://yourdomain/sitemap.xml`) to
  [Google Search Console](https://search.google.com/search-console).
- Keep post titles in the "BoxName — HTB Writeup" pattern — that's what
  people actually search.

## File map

```
_config.yml         site settings
_layouts/
  default.html       base shell
  home.html           the ls -la directory listing
  post.html            box meta bar + attack rail + content
_includes/
  head.html, header.html, footer.html
assets/
  css/main.css         all design tokens + styles
  js/rail.js            builds + scrollspies the attack rail
_posts/                your writeups go here
```

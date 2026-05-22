# Portfolio Website (GitHub Projects + Local Projects)

A lightweight portfolio website that displays your GitHub repositories (via the GitHub API) plus a few hardcoded/local projects from `projects.json`, with search and a **Load More / Show less** mechanism to keep the page uncluttered.

## Features

- **Hero profile section** with avatar, role, tags
- **Education & Experience** shown as readable cards
- **GitHub Projects grid**
  - Fetches repositories from the GitHub API
  - Filters out forks
  - Sorts by last update date
  - **Search** by name or language
  - **Load more / Show less** when there are more than 6 projects
- **Local projects**
  - Reads `projects.json` and merges entries with GitHub projects
  - Local projects can include `stargazers_count` to show ⭐ like GitHub cards
- **Offline-friendly fallback**
  - If GitHub is unavailable (offline / rate limit), the site still shows local projects

## Tech Stack

- **HTML5**
- **CSS3** (custom properties / CSS variables)
- **JavaScript (Vanilla)**
- **GitHub REST API** (`https://api.github.com/users/<username>/repos`)

## Project Structure

- `index.html` — layout + sections
- `style.css` — styling (palette, layout, cards, buttons)
- `script.js` — GitHub fetch, merge with local projects, search, pagination (Load more / Show less)
- `projects.json` — 3 hardcoded/local projects
- `assets/` — images (background + profile avatar)

## Run Locally

This project is a static site. You can open it directly, but using a local server is recommended.

### Option A — VS Code Live Server (recommended)

1. Install the **Live Server** extension in VS Code.
2. Right-click `index.html` → **Open with Live Server**.


### Option B — Direct file open

You can also open `index.html` directly in the browser:

- `file:///.../index.html`

Note: some browsers have stricter rules around local `fetch()`; if anything doesn’t load, use Option A or B.

## Configuration

### GitHub username

In `script.js`:

- Set `const username = "Bencheaa";` to your GitHub username.

### Local projects (`projects.json`)

Each entry supports:

```json
{
  "name": "Project name",
  "description": "Short description",
  "language": "JavaScript",
  "url": "https://...",
  "updated_at": "2026-05-21T12:00:00.000Z",
  "stargazers_count": 10
}
```

Only the fields you need are required, but `name` is strongly recommended.

## Pagination / Load More Requirement

To prevent clutter when there are many projects:

- If total projects **> 6**, the page renders **5** projects initially.
- Clicking **Load more** shows 5 more.
- Clicking **Show less** collapses back to the first 5.

## Known Limitations / Notes

- **GitHub API rate limit**: unauthenticated requests can be limited. If you hit the limit, the UI shows a message and falls back to local projects.
- **Network/offline**: if you’re offline, the UI shows a message and displays local projects.
- The avatar image path is `assets/profile.jpg`.
- The background image path is `assets/background.png`.

## Customization

- Replace the background image: put your file in `assets/` and update the path in `style.css` if needed.
- Replace the profile picture: save a photo as `assets/profile.jpg` (square crops look best).



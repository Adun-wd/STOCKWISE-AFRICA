# STOCKWISE-AFRICA
# Inventory Management System: Web App (Frontend)

Frontend web app for the Group 3 Inventory Management System: a mobile-first, offline-capable stock and sales tool for small shop owners in Nigeria and Africa.

> Group 3 | TechCrush Capstone Project | Frontend Team

## About the Project

Many small business owners track stock in notebooks, spreadsheets or WhatsApp, and lose sales because they find out too late that an item is running out. This project gives them a simple tool they can run from their phone, even without internet.

This repository contains the **web app (frontend)** only. The backend API and the Android/iOS apps are built by other teams in the group.

### What the app must be

- **Mobile-first:** designed for small screens and low-end Android phones first.
- **Fast and light:** it must stay quick on slow networks.
- **Offline-capable:** sales and stock updates should keep working without internet and sync when the connection returns.
- **Simple:** big buttons, clear labels and minimal typing, for non-technical shop owners.

## Frontend Deliverables

We are building a **responsive web app**. These are the frontend team's deliverables:

- [ ] **Authentication UI:** login and related screens
- [ ] **Product pages:** list, details, and add/edit forms
- [ ] **Supplier pages:** list, details, and add/edit forms
- [ ] **Stock movement form:** record stock coming in and going out
- [ ] **Sales recording pages:** a fast way to record a sale
- [ ] **Reports and charts:** sales and stock reports with visual charts
- [ ] **Alert banners:** low-stock and system alerts, including offline/syncing/synced status

Tick each box when the deliverable is merged into `main`.

## Tech Stack

- **Markup:** HTML
- **Styling:** Tailwind CSS
- **Logic:** JavaScript (no framework)
- **Tailwind setup:** Tailwind Play CDN (a script tag in each page, no install needed)
- **Version control:** Git and GitHub

## Getting Started

### Prerequisites

- [Git](https://git-scm.com)
- [VS Code](https://code.visualstudio.com) (recommended)
- The **Live Server** extension for VS Code, to preview pages in the browser

### Set up the project

1. Accept your invitation to this repository (check your email or github.com/notifications).
2. Clone the project:
```bash
   git clone https://github.com/Adun-wd/STOCKWISE-AFRICA.git
   cd STOCKWISE-AFRICA
```
3. Open the project folder in VS Code.
4. Right-click `index.html` and choose **Open with Live Server** to preview the app in your browser.

The repo is private, so Git will ask you to sign in to GitHub the first time. Your GitHub password will not work in the terminal; sign in through the browser prompt or use a personal access token.

## Using Tailwind (CDN)

We load Tailwind with its Play CDN. There is nothing to install. Every HTML page must include the same script tag inside `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

Rules:

- Everyone uses this exact tag. Do not mix versions or different Tailwind setups across pages.
- Check the current tag on the Play CDN page at tailwindcss.com before the first page is created, and update this line if it has changed.
- Put the tag in the shared page template so it is never forgotten.

**Important:** Tailwind says the Play CDN is meant for development, not production. It also needs an internet connection to load, but our app must work offline. Before release, we will replace the CDN with a compiled CSS file (using the Tailwind CLI) that is saved on the device. Until then, keep all custom styles in `css/` so the switch is easy.

## Project Structure (proposed)

Because we are not using a framework, we keep the code organised by agreeing on one structure and sticking to it:

```
STOCKWISE-AFRICA/
  index.html
  pages/
    auth/          login and related screens
    products/
    suppliers/
    stock/         stock movement form
    sales/
    reports/       reports and charts
  js/
    shared/        code used on many pages (navbar, alerts, API calls, storage)
  css/
  data/            mock data (JSON) until the backend API is ready
  assets/          images and icons
```

Rules for this structure:

- Anything used on more than one page (navbar, buttons, alert banners) lives in one shared file. **Never copy and paste it into each page.**
- Each person works mainly in their own pages and files to avoid merge conflicts.
- All API calls and offline storage code go in `js/shared/`, not scattered across pages.

## How We Work

### Branches

- **Never push directly to `main`.** Always work on your own branch.
- Name branches by type and task: `feature/login-page`, `fix/sales-form-bug`, `docs/update-readme`.

### Daily workflow

```bash
git pull                                   # get the latest code
git checkout -b feature/login-page         # create your branch
git add .                                  # stage your changes
git commit -m "add login page"             # save your changes
git push origin feature/login-page         # upload your branch
```

Then open a **Pull Request** on GitHub.

### Pull requests

1. Give the pull request a clear title and a short description of what changed.
2. Ask at least one teammate to review it.
3. Resolve all review comments before merging.
4. **Nobody merges their own work without a review.**
5. Review pull requests promptly, ideally within a day.

### Commit messages

Write short, clear messages in the present tense, for example:

- `add login page`
- `fix stock quantity validation`
- `update README with setup steps`

### Team rules

These rules are enforced by the team (GitHub branch protection is not available on our plan):

1. No direct pushes to `main`.
2. Every change goes through a pull request.
3. Someone else reviews every pull request before it is merged.
4. No force pushing, and never delete `main`.
5. Never commit passwords, API keys or `.env` files.
6. Keep branches small and short-lived, and pull often to avoid merge conflicts.
7. Reuse shared components (buttons, inputs, tables, offline/syncing/synced badges) instead of rebuilding them.
8. Use mock data until the backend API is ready.

## Tasks and Communication

- **Task board:** [Frontend Tasks](https://github.com/users/Adun-wd/projects/1). Pick a task, put your name on it and move your card as you work: Todo, In Progress, In Review, Done.
- **Group chat:** [group link]. Use it for questions and updates.
- **Updates:** every [day / Monday and Thursday], send a short update: Done, Doing, Blocked.
- **Weekly call:** [day/time].
- If you are stuck for more than an hour, post in the group with a screenshot or the error message.

## Useful Links

- Designs (Figma): [Group 3 SME Inventory Management System](https://www.figma.com/design/TWit4TkQUtOPPaeszyMzfC/Group-3-SME-Inventory-Management-System?node-id=218-474)
- API documentation: [link, when available]
- Project roadmap: [link]

## Contributors

| Name | GitHub username | Role |
|------|-----------------|------|
| Bukola | [@Adun-wd](https://github.com/Adun-wd) | Frontend Lead |
| [Name] | [@cheeenway-ux](https://github.com/cheeenway-ux) | Frontend Developer |
| [Name] | [@elijahonyes-cpu](https://github.com/elijahonyes-cpu) | Frontend Developer |
| [Name] | [@F-rook](https://github.com/F-rook) | Frontend Developer |
| [Name] | [@oladepoisrael913-crypto](https://github.com/oladepoisrael913-crypto) | Frontend Developer |
| [Name] | [@immanuelwalker](https://github.com/immanuelwalker) | Frontend Developer |

## License

No license has been added yet. Until one is chosen, all rights are reserved by the authors.
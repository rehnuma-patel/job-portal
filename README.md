# HireWave – Job Portal

A job portal built with React where you can browse jobs, search and filter them, read job details, apply with your resume and track every application.

**Live demo:** https://rehnuma-patel.github.io/job-portal/

## Features
- **Faceted search**: filter by workplace (Remote / Hybrid / On-site), minimum salary, experience level, job type, category and date posted. Each option shows how many jobs it would give you, and the counts update as you filter.
- **Keyword + location search**: every word must match (title, skills, company, category or description), and title matches rank highest.
- **Shareable searches**: all filters, sorting and the page number are kept in the URL, so you can bookmark a search and use the browser's Back and Forward buttons.
- **Active filter chips**, "Clear all", sorting (relevance, newest, salary) and pagination
- **Job detail pages** with responsibilities, requirements, skills, benefits, a job overview, a company card and similar jobs
- **Resume submission modal**: drag-and-drop or choose a resume (PDF, DOC or DOCX up to 5 MB), cover letter, portfolio link and form validation with clear error messages. Your details are filled in again next time.
- **Application status tracker**: Applied → In review → Interview → Offer (or Not selected), with a timeline, interview date, a countdown to the next update and Withdraw. In this demo the employer replies within a few minutes.
- **Saved jobs** with bookmarks
- **React Context + useReducer** for saved jobs, applications and your profile, saved in localStorage
- Responsive layout: the filters become a slide-in drawer and "Apply now" becomes a sticky bar on phones
- Accessible: native `<dialog>` modal, labelled form fields, keyboard support and reduced-motion support

## Technologies
React 19 · React Router (HashRouter) · Vite · JavaScript (ES6+) · CSS (Grid, Flexbox, custom properties) · Vitest

## Project structure
```
src/
  data/          Fictional companies and 60 generated jobs
  lib/           Search & filter logic, application tracker and form validation (with tests)
  context/       JobBoardContext: saved jobs, applications and profile
  components/    Header, search bar, filters, job cards, apply modal, status tracker
  pages/         Home, Jobs, Job details, Saved jobs, My applications, 404
```

## Run locally
```bash
npm install
npm run dev      # start at http://localhost:5173
npm test         # run the unit tests
npm run build    # production build in dist/
```

## Deployment
The site deploys to GitHub Pages with the workflow in `.github/workflows/deploy.yml` (Settings → Pages → Source: **GitHub Actions**).

## Note
All companies, jobs and employer replies are fictional demo data. Resume files stay in your browser and are never uploaded.

## Author
Rehnuma Patel – [GitHub](https://github.com/rehnuma-patel)

# Django + Vite Event Manager

Lightweight event management app with a Django REST backend and a Vite + React frontend.

## Features

- API for events, categories, registrations, users
- Frontend SPA built with Vite and React
- Image uploads, RSVP management, admin dashboard

## Tech Stack

- Backend: Python, Django, Django REST Framework
- Frontend: React, Vite, Tailwind CSS
- Database: SQLite (development)

## Quickstart

Prerequisites:

- Python 3.10+
- Node 16+ / npm or yarn
- Git

Backend (development):

1. Create virtualenv and activate it (Windows PowerShell):

```powershell
python -m venv .venv
. .venv\Scripts\Activate.ps1
```

2. Install Python dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Apply migrations and seed sample data (optional):

```bash
python backend/manage.py migrate
python backend/manage.py loaddata initial_data  # if provided
python backend/manage.py seed_events            # seeds demo events
```

4. Run the development server:

```bash
cd backend
python manage.py runserver
```

Frontend (development):

1. Install Node dependencies and run dev server:

```bash
cd frontend
npm install
npm run dev
```

2. The frontend expects the backend API at `/api/` by default. Update `frontend/src/services/axiosInstance.js` if needed.

Running tests:

- Backend: from the repository root run `pytest -q` (uses `pytest.ini` in `backend/`).
- Frontend: no tests configured by default.

Environment variables

- For production, set at least `DJANGO_SECRET_KEY`, `DEBUG=false`, and a proper `DATABASE_URL` or production DB settings.

Deployment notes

- Backend: serve with Gunicorn / uWSGI + reverse proxy (nginx). Collect static files if using Django staticfiles.
- Frontend: build with `npm run build` and host the generated assets (Vercel, Netlify, or static hosting).

Project layout

- `backend/` — Django project and apps (`accounts`, `events`, `registrations`, etc.)
- `frontend/` — React app using Vite

Contributing

1. Fork the repo, create a branch, open a PR.
2. Run linters and tests before submitting.

License

This project does not include a license file. Add one if you plan to publish.

Contact

If you need help, open an issue or contact the maintainers.

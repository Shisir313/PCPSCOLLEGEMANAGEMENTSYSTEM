# Django + Vite Event Manager

Lightweight event management app with a Django REST backend and a Vite + React frontend.

## Features

- API for events, categories, registrations, users
- Frontend SPA built with Vite and React
- Image uploads, RSVP management, admin dashboard
- SQLite database with Django ORM

## Tech Stack

- Backend: Python, Django, Django REST Framework
- Frontend: React, Vite, Tailwind CSS
- Database: SQLite

## Database Architecture

This project uses SQLite as the primary database for Django models.

- **SQLite** — primary app database for events, users, registrations, categories, and settings
  - Configured in [backend/config/settings.py](backend/config/settings.py)
  - Uses Django's built-in `django.db.backends.sqlite3` engine
  - Database file: `backend/db.sqlite3`

## Quickstart

Prerequisites:

- Python 3.10+
- Node 16+ / npm or yarn
- Git

Backend (development):

1. Create and activate a virtual environment (Windows PowerShell):

```powershell
python -m venv .venv
. .venv\Scripts\Activate.ps1
```

2. Install Python dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Apply migrations to set up the SQLite database:

```bash
cd backend
python manage.py migrate
```

4. (Optional) Seed sample data:

```bash
python manage.py seed_events
```

5. Run the development server:

```bash
python manage.py runserver
```

The backend API will be available at `http://127.0.0.1:8000/`

Frontend (development):

1. Install Node dependencies and run the dev server:

```bash
cd frontend
npm install
npm run dev
```

2. The frontend expects the backend API at `/api/` by default. Update `frontend/src/services/axiosInstance.js` if needed.

Running tests:

- Backend: from the repository root run `pytest -q` (uses `pytest.ini` in `backend/`)
- Frontend: no tests configured by default

## Environment variables

Optional `.env` file for Django configuration:

```env
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key
```

For production, also set:

- `DEBUG=false`
- secure `DJANGO_SECRET_KEY`
- `ALLOWED_HOSTS` in the Django settings if needed

Deployment notes

- Backend: serve with Gunicorn behind a reverse proxy such as Nginx
- Frontend: build with `npm run build` and host the output on Vercel, Netlify, or another static host
- SQLite database file must be included or recreated during deployment

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

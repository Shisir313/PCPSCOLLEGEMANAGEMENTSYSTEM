# Django + Vite Event Manager

Lightweight event management app with a Django REST backend and a Vite + React frontend.

## Features

- API for events, categories, registrations, users
- Frontend SPA built with Vite and React
- Image uploads, RSVP management, admin dashboard
- MongoDB-backed Django configuration for the primary app database

## Tech Stack

- Backend: Python, Django, Django REST Framework
- Frontend: React, Vite, Tailwind CSS
- Database: MongoDB via `django-mongodb-backend`

## Database Architecture

This project now uses MongoDB as the primary database for Django models.

- **MongoDB** — primary app database for events, users, registrations, categories, and settings
  - Configured in [backend/config/settings.py](backend/config/settings.py)
  - Uses `django_mongodb_backend`
  - Controlled by `MONGODB_URI` and optional `MONGODB_DB_NAME`

This project no longer uses SQLite as the application database.

## Quickstart

Prerequisites:

- Python 3.10+
- Node 16+ / npm or yarn
- MongoDB running locally or a MongoDB Atlas connection string
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

3. Create a `.env` file in the project root or `backend/` with your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/django_finalproject
# optional
MONGODB_DB_NAME=django_finalproject
```

For MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/django_finalproject
```

4. Apply migrations and seed sample data (optional):

```bash
cd backend
python manage.py migrate
python manage.py seed_events
```

5. Run the development server:

```bash
cd backend
python manage.py runserver
```

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

Environment variables

Create a `.env` file in the project root or the `backend/` folder with:

```env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
MONGODB_URI=mongodb://localhost:27017/django_finalproject
MONGODB_DB_NAME=django_finalproject
```

For production, also set:

- `DEBUG=false`
- secure `DJANGO_SECRET_KEY`
- `ALLOWED_HOSTS` in the Django settings if needed

Deployment notes

- Backend: serve with Gunicorn behind a reverse proxy such as Nginx
- Frontend: build with `npm run build` and host the output on Vercel, Netlify, or another static host
- MongoDB should be reachable from the deployment environment

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

# Django + Vite Event Manager

Lightweight event management app with a Django REST backend and a Vite + React frontend.

## Features

- API for events, categories, registrations, users
- Frontend SPA built with Vite and React
- Image uploads, RSVP management, admin dashboard

## Tech Stack

- Backend: Python, Django, Django REST Framework
- Frontend: React, Vite, Tailwind CSS
- Databases: SQLite (Django ORM, development), MongoDB Atlas (MongoEngine, optional)

## Database Architecture

This project supports a **hybrid database setup**:

- **SQLite / PostgreSQL** — Primary relational database for Django ORM models (Users, Events, Registrations, Categories)
  - Used for structured data with relationships
  - Managed via Django migrations
  
- **MongoDB** (optional) — Document database for flexible/scalable data storage via MongoEngine
  - Optional; only connects if `MONGODB_URI` environment variable is set
  - Can be used for logs, analytics, or document-based features
  - Requires MongoDB Atlas account for production

By default, the project runs with **SQLite only** and works without MongoDB. Enable MongoDB by setting the `MONGODB_URI` environment variable.

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

3. (Optional) Set up MongoDB Atlas for document storage:

   a. Create a free MongoDB Atlas account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   
   b. Create a cluster and database user
   
   c. Create a `.env` file in the project root with your MongoDB connection string:
   
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   ```
   
   d. Verify the connection in Django shell:
   
   ```powershell
   cd backend
   python manage.py shell
   >>> from django.conf import settings
   >>> import mongoengine
   >>> mongoengine.connect(host=settings.MONGODB_URI)
   ```

4. Apply migrations and seed sample data (optional):

```bash
python backend/manage.py migrate
python backend/manage.py loaddata initial_data  # if provided
python backend/manage.py seed_events            # seeds demo events
```

5. Run the development server:

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

Create a `.env` file in the project root with:

```
# Django settings
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True  # Set to False in production

# MongoDB (optional - only needed for MongoEngine features)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```

For production, also set:
- `DEBUG=false`
- `ALLOWED_HOSTS` (in `settings.py`)
- A proper `DATABASE_URL` for PostgreSQL or other SQL database
- Secure `DJANGO_SECRET_KEY` (use a strong random value)

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

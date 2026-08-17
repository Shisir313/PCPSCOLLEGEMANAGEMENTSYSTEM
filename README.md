# PCPS College Event Management System

A comprehensive event management application with QR code-based check-in system, built with Django REST backend and React frontend. Perfect for managing college events, registrations, and attendee tracking.

## ✨ Features

### Core Event Management
- 📅 **Event Management** — Create, edit, delete, and list events
- 👥 **User Registration** — Attendee sign-up and role-based access
- 🏷️ **Event Categories** — Organize events by type
- 📸 **Image Uploads** — Add event images and posters
- 📋 **RSVP Management** — Track event registrations
- 🔐 **JWT Authentication** — Secure token-based auth with auto-refresh

### QR Code Check-In System ⭐
- **QR Code Generation** — Generate unique QR codes for each event
- **QR Code Scanner** — Real-time camera-based QR scanning (HTML5)
- **Check-in Tracking** — Track attendee check-ins with timestamps
- **Organizer Dashboard** — View check-in history and statistics
- **Manual Fallback** — Input token manually if camera unavailable

### Admin & Organizer Features
- 👨‍💼 **User Management** — Admin can manage user roles and accounts
- 📊 **Organizer Dashboard** — Event statistics and attendee tracking
- 👀 **Attendee List** — View and manage event attendees with check-in status
- 🔐 **Role-Based Access** — Admin, Organizer, and Attendee roles

## 🛠️ Tech Stack

**Backend:**
- Python 3.10+
- Django 6.0 & Django REST Framework 3.15
- SQLite Database
- JWT Authentication (djangorestframework-simplejwt)
- CORS support (django-cors-headers)
- Image handling (Pillow)

**Frontend:**
- React 18.3
- Vite 5.4 (lightning-fast build tool)
- React Router 6.30 (SPA routing)
- Tailwind CSS 3.4 (utility-first styling)
- Axios (HTTP client with JWT interceptors)
- **QR Code Libraries:**
  - `qrcode` — QR code generation
  - `html5-qrcode` — Camera-based QR scanning

**Database:**
- SQLite (primary database for all models)

## 📦 Project Structure

```
DjangoFinalproject/
├── backend/                          # Django API server
│   ├── config/                      # Django settings & URLs
│   │   ├── settings.py              # Main configuration
│   │   ├── urls.py                  # API routes
│   │   └── wsgi.py
│   ├── accounts/                    # User authentication & management
│   │   ├── models.py                # CustomUser model
│   │   ├── views.py                 # Auth endpoints
│   │   ├── serializers.py
│   │   └── permissions.py           # Role-based access
│   ├── events/                      # Event CRUD
│   │   ├── models.py                # Event model
│   │   ├── views.py                 # Event endpoints
│   │   ├── filters.py               # Event filtering
│   │   └── serializers.py
│   ├── registrations/               # RSVP & Check-in
│   │   ├── models.py                # RSVP & CheckIn models
│   │   ├── views.py                 # Registration endpoints
│   │   ├── dashboard_urls.py        # Organizer dashboard
│   │   └── serializers.py
│   ├── categories/                  # Event categories
│   ├── siteconfig/                  # Feature flags
│   ├── manage.py
│   ├── db.sqlite3                   # SQLite database
│   ├── requirements.txt             # Python dependencies
│   ├── create_categories.py         # Seed categories
│   ├── create_events.py             # Seed sample events
│   ├── create_attendees_and_register.py  # Seed attendees & RSVPs
│   └── set_alex_password.py         # Setup organizer account
│
├── frontend/                         # React Vite SPA
│   ├── src/
│   │   ├── pages/                   # Route pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── EventListPage.jsx
│   │   │   ├── EventDetailPage.jsx
│   │   │   ├── EventFormPage.jsx
│   │   │   ├── MyEventsPage.jsx
│   │   │   ├── CheckInQRPage.jsx    # Generate QR codes
│   │   │   ├── CheckInScannerPage.jsx # Scan QR codes
│   │   │   ├── OrganizerDashboardPage.jsx
│   │   │   ├── AttendeeListPage.jsx
│   │   │   └── AdminUsersPage.jsx
│   │   ├── components/              # React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── RSVPButton.jsx
│   │   │   ├── EventQRModal.jsx     # QR display modal
│   │   │   ├── QRCodeModal.jsx      # Generic QR modal
│   │   │   ├── ProtectedRoute.jsx   # Role-based routing
│   │   │   └── ErrorBoundary.jsx
│   │   ├── context/                 # State management
│   │   │   ├── AuthContext.jsx
│   │   │   ├── EventsContext.jsx
│   │   │   ├── FlagsContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── services/                # API calls
│   │   │   ├── axiosInstance.js     # Axios with JWT
│   │   │   ├── authService.js
│   │   │   ├── eventService.js
│   │   │   ├── rsvpService.js
│   │   │   └── categoryService.js
│   │   ├── App.jsx                  # Main router
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node 16+ / npm or yarn
- Git

### Backend Setup

1. **Create and activate virtual environment** (Windows PowerShell):
```powershell
python -m venv .venv
. .venv\Scripts\Activate.ps1
```

2. **Install dependencies:**
```bash
pip install -r backend/requirements.txt
```

3. **Apply migrations:**
```bash
cd backend
python manage.py migrate
```

4. **Seed sample data** (optional):
```bash
python create_categories.py
python create_events.py
python create_attendees_and_register.py
python set_alex_password.py
```

5. **Run development server:**
```bash
python manage.py runserver
```
Backend available at: **http://127.0.0.1:8000/**

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Run dev server:**
```bash
npm run dev
```
Frontend available at: **http://localhost:5174/**

## 📝 Sample Data

The repository includes helper scripts to populate sample data:

### Credentials:
```
Organizer Account:
  Username: alex
  Password: alex123
  Email: alex@pcps.edu
  Role: organizer
  Events: 10 sample tech events

Attendee Accounts:
  Username: attendee1 - attendee20
  Password: attendee123
  Email: attendee1@pcps.edu, etc.
  Role: attendee
  Status: Registered to 3-7 random events each
```

### Sample Data Includes:
- ✅ 6 Event Categories (Academic, Sports, Cultural, Technology, Competition, Networking)
- ✅ 10 Events by organizer "alex"
- ✅ 20 Attendee accounts with random registrations
- ✅ 96 RSVP registrations (attendees registered to events)

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register/` — Register new user
- `POST /api/auth/login/` — Login (get JWT tokens)
- `POST /api/auth/token/refresh/` — Refresh access token
- `GET /api/auth/me/` — Get current user profile

### Events
- `GET /api/events/` — List events (paginated, filterable)
- `POST /api/events/` — Create event (organizers only)
- `GET /api/events/<id>/` — Event details
- `PATCH /api/events/<id>/` — Update event (owner/admin)
- `DELETE /api/events/<id>/` — Delete event (owner/admin)

### Registrations (RSVP)
- `GET /api/rsvps/` — List user's RSVPs
- `POST /api/rsvps/` — Register for event
- `DELETE /api/rsvps/<id>/` — Cancel RSVP

### Check-in (QR)
- `POST /api/registrations/check-in/` — Check in via QR token
- `GET /api/dashboard/` — Organizer dashboard stats

### Admin
- `GET /api/users/` — List users
- `PATCH /api/users/<id>/` — Update user role
- `DELETE /api/users/<id>/` — Deactivate user

### Categories
- `GET /api/categories/` — List categories
- `POST /api/categories/` — Create category (admin)

## 🔒 User Roles

| Role | Can Create Events | Can Check In | Can Manage Users | Can Edit Events |
|------|---|---|---|---|
| **Admin** | ✅ | ✅ | ✅ | ✅ All |
| **Organizer** | ✅ | ✅ | ❌ | ✅ Own |
| **Attendee** | ❌ | ❌ | ❌ | ❌ |
| **Pending** | ❌ | ❌ | ❌ | ❌ |

## 🧪 Testing

**Backend:**
```bash
pytest -q
```

**Frontend:**
Currently no automated tests. Manual testing recommended.

## 📱 QR Code Check-In Workflow

1. **Organizer creates event** → Event gets auto-assigned QR token
2. **View Event Details** → Click "Generate QR Code" button
3. **Display QR Code** → Show on projector/screen
4. **Attendees scan** → Use phone camera or dedicated scanner
5. **Check-in recorded** → Attendee marked as checked in with timestamp
6. **View check-ins** → Organizer dashboard shows attendance statistics

## 🌐 Environment Variables

Optional `.env` file in project root:
```env
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-here
VITE_API_BASE_URL=http://localhost:8000
```

**Production:**
```env
DEBUG=False
DJANGO_SECRET_KEY=secure-random-key-here
ALLOWED_HOSTS=yourdomain.com
```

## 🏗️ Build & Deployment

**Frontend Production Build:**
```bash
cd frontend
npm run build
```
Output: `frontend/dist/`

**Backend Production:**
Use Gunicorn or similar WSGI server:
```bash
gunicorn config.wsgi
```

## 📚 Documentation

- [Django REST Framework Docs](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [html5-qrcode](https://github.com/mebjas/html5-qrcode)

## 🤝 Contributing

Feel free to fork, modify, and improve!

## 📄 License

This project is open source and available under the MIT License.
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

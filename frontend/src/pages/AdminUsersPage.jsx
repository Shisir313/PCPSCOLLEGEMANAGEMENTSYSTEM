import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../services/axiosInstance';

const ROLE_COLORS = {
  admin:     'bg-purple-100 text-purple-700 ring-purple-200',
  organizer: 'bg-blue-100 text-pcps-blue ring-pcps-blue/20',
  attendee:  'bg-green-100 text-green-700 ring-green-200',
  pending:   'bg-amber-100 text-amber-700 ring-amber-200',
};
const ROLE_ICONS = {
  admin:     '👑',
  organizer: '🗓',
  attendee:  '🎟',
  pending:   '⏳',
};

function Avatar({ username, role }) {
  const gradients = {
    admin:     'from-purple-500 to-violet-600',
    organizer: 'from-pcps-blue to-pcps-blue-mid',
    attendee:  'from-green-500 to-emerald-600',
    pending:   'from-amber-400 to-orange-500',
  };
  return (
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradients[role] ?? 'from-gray-400 to-gray-500'}
                     flex items-center justify-center text-white font-black text-sm shrink-0`}>
      {username?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    axiosInstance.get('/api/users/')
      .then(({ data }) => setUsers(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = (id, role) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));

  const handleSave = async (id) => {
    const user = users.find(u => u.id === id);
    setSavingId(id);
    try {
      const { data } = await axiosInstance.patch(`/api/users/${id}/`, { role: user.role });
      setUsers(prev => prev.map(u => u.id === id ? data : u));
      showToast(`${user.username}'s role updated to ${data.role}`);
    } catch {
      showToast('Failed to update role.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeactivate = async (id) => {
    const user = users.find(u => u.id === id);
    if (!window.confirm(`Deactivate ${user?.username}? They will be logged out immediately.`)) return;
    try {
      await axiosInstance.delete(`/api/users/${id}/`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: false } : u));
      showToast(`${user?.username} has been deactivated.`);
    } catch {
      showToast('Failed to deactivate.', 'error');
    }
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !search ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === 'all' || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  const stats = useMemo(() => ({
    total:     users.length,
    active:    users.filter(u => u.is_active).length,
    pending:   users.filter(u => u.role === 'pending').length,
    organizers:users.filter(u => u.role === 'organizer').length,
  }), [users]);

  return (
    <div className="min-h-full">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 animate-slide-in-right px-5 py-3 rounded-xl shadow-xl
                         text-sm font-semibold border flex items-center gap-2 ${
          toast.type === 'error'
            ? 'bg-red-50 text-pcps-red border-red-200'
            : 'bg-green-50 text-green-800 border-green-200'
        }`}>
          {toast.type === 'error'
            ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-br from-pcps-blue-dark via-pcps-blue to-pcps-blue-mid relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-pcps-red/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-pcps-red rounded-full" />
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-6">Manage Users</h1>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Total',      value: stats.total,      color: 'bg-white/20 text-white' },
              { label: 'Active',     value: stats.active,     color: 'bg-green-500/30 text-green-200' },
              { label: 'Pending',    value: stats.pending,    color: 'bg-amber-400/30 text-amber-200' },
              { label: 'Organizers', value: stats.organizers, color: 'bg-blue-400/30 text-blue-200' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`${color} backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2`}>
                <span className="text-xl font-black">{value}</span>
                <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-1 bg-pcps-red" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Search + filter bar */}
        <div className="card p-4 mb-6 animate-fade-up">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by username or email…"
                className="form-input pl-11"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pcps-red transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="form-input w-full sm:w-44"
            >
              <option value="all">All Roles</option>
              <option value="pending">Pending</option>
              <option value="attendee">Attendee</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {(search || filterRole !== 'all') && (
            <p className="text-xs text-pcps-muted mt-2">
              Showing <span className="font-bold text-pcps-blue">{filtered.length}</span> of {users.length} users
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-pcps-blue/20 border-t-pcps-blue rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card p-5 border-l-4 border-pcps-red bg-red-50">
            <p className="text-pcps-red font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="card overflow-hidden animate-fade-up">
            <div className="bg-gradient-to-r from-pcps-blue to-pcps-blue-mid px-5 py-3.5 flex items-center justify-between">
              <p className="text-white text-sm font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                User Accounts
              </p>
              <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full">
                {filtered.length} shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-pcps-blue-light text-pcps-blue text-[11px] uppercase tracking-wider border-b border-pcps-blue/10">
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user, i) => (
                    <tr key={user.id}
                      className={`transition-colors group animate-fade-up ${
                        user.is_active ? 'hover:bg-blue-50/40' : 'opacity-50 bg-gray-50/80'
                      }`}
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar username={user.username} role={user.role} />
                          <div>
                            <p className="font-bold text-pcps-blue text-sm">{user.username}</p>
                            <p className="text-[11px] text-pcps-muted font-mono">#{user.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 text-pcps-muted text-sm">{user.email || '—'}</td>

                      {/* Role selector */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm`}>{ROLE_ICONS[user.role]}</span>
                          <select
                            value={user.role}
                            onChange={e => handleRoleChange(user.id, e.target.value)}
                            disabled={!user.is_active}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg ring-1 border-0
                                        focus:outline-none focus:ring-2 focus:ring-pcps-blue
                                        disabled:cursor-not-allowed transition-colors
                                        ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="attendee">Attendee</option>
                            <option value="organizer">Organizer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ring-1 ${
                          user.is_active
                            ? 'bg-green-50 text-green-700 ring-green-200'
                            : 'bg-red-50 text-pcps-red ring-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-pcps-red'}`} />
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5 text-pcps-muted text-xs whitespace-nowrap">
                        {user.date_joined
                          ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(user.id)}
                            disabled={savingId === user.id || !user.is_active}
                            className="btn-blue px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {savingId === user.id
                              ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : 'Save'}
                          </button>
                          {user.is_active && (
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              className="btn-outline-red px-3 py-1.5 text-xs"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                        </svg>
                        <p className="text-pcps-muted font-semibold text-sm">No users match your search</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

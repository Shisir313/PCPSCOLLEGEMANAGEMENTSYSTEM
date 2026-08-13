import { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    axiosInstance.get('/api/users/')
      .then(({ data }) => setUsers(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = (id, role) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));

  const handleSave = async (id) => {
    const user = users.find((u) => u.id === id);
    setSavingId(id);
    try {
      const { data } = await axiosInstance.patch(`/api/users/${id}/`, { role: user.role });
      setUsers((prev) => prev.map((u) => u.id === id ? data : u));
    } catch { alert('Failed to update role.'); }
    finally { setSavingId(null); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await axiosInstance.delete(`/api/users/${id}/`);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_active: false } : u));
    } catch { alert('Failed to deactivate.'); }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-pcps-blue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-pcps-red translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 bg-pcps-red rounded-full" />
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Admin Panel</p>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Manage Users</h1>
            <p className="text-blue-200 text-sm mt-1">{users.length} registered accounts</p>
          </div>
        </div>
      </div>
      <div className="h-1.5 bg-pcps-red" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-pcps-blue/20 border-t-pcps-blue rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-pcps-red rounded-xl px-5 py-4 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="card">
            {/* Table header */}
            <div className="bg-pcps-blue px-5 py-3 flex items-center justify-between">
              <p className="text-white text-sm font-semibold">User Accounts</p>
              <span className="badge-red text-xs">{users.filter(u => u.is_active).length} active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-pcps-blue-light text-pcps-blue text-xs uppercase tracking-wider">
                    {['#', 'Username', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id}
                      className={`transition-colors ${user.is_active ? 'hover:bg-pcps-blue-light/30' : 'opacity-50 bg-gray-50'}`}>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{user.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-pcps-blue">{user.username}</p>
                      </td>
                      <td className="px-4 py-3 text-pcps-muted">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={!user.is_active}
                          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-pcps-blue disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          <option value="attendee">Attendee</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.is_active
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                            : 'bg-red-50 text-pcps-red ring-1 ring-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-pcps-red'}`} />
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(user.id)}
                            disabled={savingId === user.id || !user.is_active}
                            className="btn-blue px-3 py-1.5 text-xs disabled:opacity-40"
                          >
                            {savingId === user.id ? '…' : 'Save'}
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
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-pcps-muted py-12 text-sm">No users found.</td>
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

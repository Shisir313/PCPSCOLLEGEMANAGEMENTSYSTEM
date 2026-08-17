import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEvent, updateEvent, getEvent } from '../services/eventService';
import { getCategories } from '../services/categoryService';
import { FlagsContext } from '../context/FlagsContext';

const EMPTY = { title:'', description:'', date:'', time:'', location:'', capacity:'', category_id:'', image:null };

export default function EventFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm]           = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [categories, setCategories]     = useState([]);
  const [catLoading, setCatLoading]     = useState(true);
  const { flags, loading: flagsLoading } = useContext(FlagsContext);

  useEffect(() => {
    if (!isEdit) return;
    getEvent(id).then(evt => {
      setForm({
        title:       evt.title,
        description: evt.description,
        date:        evt.date,
        time:        evt.time?.slice(0,5) ?? '',
        location:    evt.location,
        capacity:    evt.capacity ?? '',
        category_id: evt.category?.id ?? '',
        image:       null,
      });
      setImagePreview(evt.image_url ?? evt.image ?? '');
      setFetchLoading(false);
    }).catch(() => setFetchLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    getCategories()
      .then(list => setCategories(list))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const handleChange = e => {
    if (e.target.type === 'file') {
      const file = e.target.files[0] || null;
      setImageFile(file);
      setImagePreview(file ? URL.createObjectURL(file) : '');
      return;
    }
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    const todayStr = new Date().toISOString().split('T')[0];
    if (form.date && form.date < todayStr) {
      setErrors({ date: 'Event date cannot be in the past.' });
      return;
    }
    setLoading(true);
    const payload = { ...form };
    if (payload.capacity === '') delete payload.capacity;
    else payload.capacity = parseInt(payload.capacity, 10);
    try {
      let toSend = payload;
      if (imageFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k,v]) => { if (v != null) fd.append(k, v); });
        fd.append('image', imageFile);
        toSend = fd;
      }
      if (isEdit) {
        await updateEvent(id, toSend);
        navigate(`/events/${id}`);
      } else {
        const created = await createEvent(toSend);
        navigate(`/events/${created.id}`);
      }
    } catch (err) {
      setErrors(err?.data || { non_field_errors: 'Failed to save event.' });
    } finally {
      setLoading(false);
    }
  };

  const fe = name => errors[name]?.[0] || errors[name] || null;
  const requireImage = flagsLoading ? true : Boolean(flags?.require_event_image);
  const canSubmit = !catLoading && (isEdit || !requireImage || imageFile);
  const today = new Date().toISOString().split('T')[0];

  if (fetchLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-pcps-blue/20 border-t-pcps-blue rounded-full animate-spin" />
        <p className="text-pcps-muted text-sm">Loading event…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-full">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-pcps-blue-dark via-pcps-blue to-pcps-blue-mid py-10 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-pcps-red/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white text-sm font-medium mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-pcps-red/20 border border-pcps-red/30
                            flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-pcps-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isEdit
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />}
              </svg>
            </div>
            <div>
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">
                {isEdit ? 'Editing Event' : 'New Event'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {isEdit ? 'Edit Event Details' : 'Create an Event'}
              </h1>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 30 Q360 5 720 15 Q1080 25 1440 5 L1440 30 Z" fill="#F7F8FA" />
          </svg>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {errors.non_field_errors && (
          <div className="flex items-start gap-2.5 bg-red-50 border-l-4 border-pcps-red text-pcps-red
                          text-sm rounded-xl px-4 py-3 mb-6 animate-scale-in">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
            </svg>
            {errors.non_field_errors}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: main fields ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Title */}
              <div className="card p-6 animate-fade-up">
                <h2 className="text-sm font-bold text-pcps-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Info
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Event Title <span className="text-pcps-red">*</span>
                    </label>
                    <input name="title" value={form.title} onChange={handleChange} required
                      placeholder="e.g. Annual Sports Day 2026"
                      className={fe('title') ? 'form-input-error' : 'form-input'} />
                    {fe('title') && <p className="text-pcps-red text-xs mt-1">{fe('title')}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Description <span className="text-pcps-red">*</span>
                    </label>
                    <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                      placeholder="Describe what attendees can expect…"
                      className={fe('description') ? 'form-input-error' : 'form-input'} />
                    {fe('description') && <p className="text-pcps-red text-xs mt-1">{fe('description')}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Location <span className="text-pcps-red">*</span>
                    </label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input name="location" value={form.location} onChange={handleChange} required
                        placeholder="e.g. PCPS Main Hall, Block A"
                        className={`${fe('location') ? 'form-input-error' : 'form-input'} pl-11`} />
                    </div>
                    {fe('location') && <p className="text-pcps-red text-xs mt-1">{fe('location')}</p>}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="card p-6 animate-fade-up stagger-1">
                <h2 className="text-sm font-bold text-pcps-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date &amp; Time
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Date <span className="text-pcps-red">*</span>
                    </label>
                    <input name="date" type="date" value={form.date} onChange={handleChange}
                      required min={today}
                      className={fe('date') ? 'form-input-error' : 'form-input'} />
                    {fe('date') && <p className="text-pcps-red text-xs mt-1">{fe('date')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Time <span className="text-pcps-red">*</span>
                    </label>
                    <input name="time" type="time" value={form.time} onChange={handleChange} required
                      className={fe('time') ? 'form-input-error' : 'form-input'} />
                    {fe('time') && <p className="text-pcps-red text-xs mt-1">{fe('time')}</p>}
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="card p-6 animate-fade-up stagger-2">
                <h2 className="text-sm font-bold text-pcps-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Event Image
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {flagsLoading ? 'loading…' : requireImage ? '(required)' : '(optional)'}
                  </span>
                </h2>

                {imagePreview ? (
                  <div className="relative mb-4 rounded-xl overflow-hidden group">
                    <img src={imagePreview} alt="preview"
                      className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                                    transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer btn-blue text-xs">
                        Change Image
                        <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2
                                    border-dashed border-gray-200 rounded-xl cursor-pointer
                                    hover:border-pcps-blue hover:bg-pcps-blue-light/30 transition-all group">
                    <svg className="w-10 h-10 text-gray-300 group-hover:text-pcps-blue transition-colors mb-2"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 group-hover:text-pcps-blue transition-colors font-medium">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                    <input name="image" type="file" accept="image/*" onChange={handleChange} className="hidden" />
                  </label>
                )}
                {fe('image') && <p className="text-pcps-red text-xs mt-2">{fe('image')}</p>}
              </div>
            </div>

            {/* ── Right: options + submit ── */}
            <div className="space-y-5">

              {/* Category */}
              <div className="card p-5 animate-fade-up stagger-1">
                <h2 className="text-sm font-bold text-pcps-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Category
                </h2>
                {catLoading ? (
                  <div className="skeleton h-10 w-full rounded-xl" />
                ) : (
                  <select name="category_id" value={form.category_id} onChange={handleChange}
                    className="form-input">
                    <option value="">No category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Capacity */}
              <div className="card p-5 animate-fade-up stagger-2">
                <h2 className="text-sm font-bold text-pcps-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Capacity
                  <span className="ml-auto text-[10px] font-semibold text-gray-400">optional</span>
                </h2>
                <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange}
                  placeholder="Leave blank for unlimited"
                  className={fe('capacity') ? 'form-input-error' : 'form-input'} />
                {fe('capacity') && <p className="text-pcps-red text-xs mt-1">{fe('capacity')}</p>}
                <p className="text-xs text-pcps-muted mt-2">
                  Leave blank to allow unlimited registrations.
                </p>
              </div>

              {/* Submit card */}
              <div className="card p-5 animate-fade-up stagger-3 border-t-4 border-pcps-blue">
                <button type="submit" disabled={loading || !canSubmit}
                  className="btn-blue w-full py-3 text-base justify-center shadow-lg
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {isEdit
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />}
                      </svg>
                      {isEdit ? 'Save Changes' : 'Create Event'}
                    </>
                  )}
                </button>

                {!isEdit && requireImage && !imageFile && (
                  <p className="text-xs text-amber-600 text-center mt-3 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                    </svg>
                    An event image is required
                  </p>
                )}

                <button type="button" onClick={() => navigate(-1)}
                  className="btn-ghost w-full mt-2 justify-center">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

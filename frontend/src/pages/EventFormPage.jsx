import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEvent, updateEvent, getEvent } from '../services/eventService';
import { getCategories } from '../services/categoryService';
import { FlagsContext } from '../context/FlagsContext';

const EMPTY_FORM = { title: '', description: '', date: '', time: '', location: '', capacity: '', category_id: '', image: null };

export default function EventFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { flags, loading: flagsLoading } = useContext(FlagsContext);

  useEffect(() => {
    if (!isEdit) return;
    getEvent(id).then((evt) => {
      setForm({
        title: evt.title,
        description: evt.description,
        date: evt.date,
        time: evt.time?.slice(0, 5) ?? '',
        location: evt.location,
        capacity: evt.capacity ?? '',
        category_id: evt.category?.id ?? '',
        image: null,
      });
      setImagePreview(evt.image ?? '');
      setFetchLoading(false);
    }).catch(() => setFetchLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    setCategoriesLoading(true);
    getCategories().then((list) => setCategories(list)).catch(() => setCategories([])).finally(() => setCategoriesLoading(false));
  }, []);

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      const file = e.target.files[0];
      setImageFile(file || null);
      setImagePreview(file ? URL.createObjectURL(file) : '');
      setForm({ ...form, image: file ? file.name : null });
      return;
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    if (form.date && form.date < todayString) {
      setErrors({ date: 'Event date cannot be in the past.' });
      setLoading(false);
      return;
    }

    setLoading(true);
    const payload = { ...form };
    if (payload.capacity === '') delete payload.capacity;
    else payload.capacity = parseInt(payload.capacity, 10);
    try {
      // If an image file is present, send as multipart/form-data
      let toSend = payload;
      if (imageFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
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

  const fieldError = (name) => errors[name]?.[0] || errors[name] || null;

  const canSubmit = () => {
    if (categoriesLoading) return false;
    // If flags are still loading, be conservative and require image when creating
    const requireImage = flagsLoading ? true : Boolean(flags?.require_event_image);
    if (!isEdit && requireImage && !imageFile) return false;
    return true;
  };

  if (fetchLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Event' : 'Create Event'}</h1>
      {errors.non_field_errors && <p className="text-red-600 text-sm mb-4">{errors.non_field_errors}</p>}
      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl shadow p-6">
        {[['title','Title','text'],['location','Location','text']].map(([name, label, type]) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input name={name} type={type} value={form[name]} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {fieldError(name) && <p className="text-red-500 text-xs mt-1">{fieldError(name)}</p>}
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {fieldError('description') && <p className="text-red-500 text-xs mt-1">{fieldError('description')}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {fieldError('date') && <p className="text-red-500 text-xs mt-1">{fieldError('date')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input name="time" type="time" value={form.time} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {fieldError('time') && <p className="text-red-500 text-xs mt-1">{fieldError('time')}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacity <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {fieldError('capacity') && <p className="text-red-500 text-xs mt-1">{fieldError('capacity')}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-gray-400 font-normal">(optional)</span></label>
          {categoriesLoading ? (
            <div className="text-sm text-gray-500">Loading categories…</div>
          ) : (
            <select name="category_id" value={form.category_id} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          {fieldError('category_id') && <p className="text-red-500 text-xs mt-1">{fieldError('category_id')}</p>}
        </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Image <span className="text-gray-400 font-normal">{(flagsLoading ? '(loading rules...)' : (flags?.require_event_image ? '(required)' : '(optional)'))}</span></label>
                <input name="image" type="file" accept="image/*" onChange={handleChange}
                  className="block w-full text-sm text-gray-700" />
                {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="preview" className="w-40 h-24 object-cover rounded" />
                  </div>
                )}
                {fieldError('image') && <p className="text-red-500 text-xs mt-1">{fieldError('image')}</p>}
              </div>
        <button type="submit" disabled={loading || !canSubmit()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

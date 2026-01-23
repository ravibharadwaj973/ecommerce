'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function EditCategory() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    image: '',
    isActive: true,
  });

  if (!user || user.role !== 'admin') return <p>Access denied</p>;

  // -----------------------------------
  // FETCH SINGLE CATEGORY
  // -----------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      const res = await fetch(`/api/categories/${id}`);
      const json = await res.json();

      if (!res.ok) {
        alert(json.message || 'Failed to load category');
        return;
      }

      // ✅ CORRECT DATA PATH
      setForm(json.data.category);
    };

    fetchCategory();
  }, [id]);

  // -----------------------------------
  // UPDATE CATEGORY
  // -----------------------------------
  const update = async () => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT', // ✅ MUST BE PUT (backend uses PUT)
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        image: form.image,
        isActive: form.isActive,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.message || 'Update failed');
      return;
    }

    router.push('/admin/categories');
  };

  return (
    <div className="max-w-xl p-6 text-black">
      <h1 className="text-xl mb-4">Edit Category</h1>

      <input
        className="input"
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <textarea
        className="input"
        placeholder="Description"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
      />

      <label className="block text-sm font-medium mb-1">Category Image</label>

<input
  type="file"
  accept="image/*"
  className="input"
  onChange={(e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  }}
/>

{/* Image Preview */}
{(imageFile || form.image) && (
  <img
    src={imageFile ? URL.createObjectURL(imageFile) : form.image}
    alt="Preview"
    className="mt-3 h-32 rounded border object-cover"
  />
)}

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={e => setForm({ ...form, isActive: e.target.checked })}
        />
        Active
      </label>

      <button onClick={update} className="btn">
        Update
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          padding: 8px;
          margin-bottom: 10px;
        }
        .btn {
          background: black;
          color: white;
          padding: 8px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

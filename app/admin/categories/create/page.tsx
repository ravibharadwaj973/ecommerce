'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

type Category = {
  _id: string;
  name: string;
};

export default function CreateCategoryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 🔑 hierarchical state
  const [categoryLevels, setCategoryLevels] = useState<Category[][]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'admin') return <p>Access denied</p>;

  // ---------------- FETCH ROOT CATEGORIES ----------------
  useEffect(() => {
    fetchChildren(null, 0);
  }, []);

  // ---------------- FETCH CHILDREN ----------------
  const fetchChildren = async (
    parentId: string | null,
    level: number
  ) => {
    const url = parentId
      ? `/api/categories/children?parent=${parentId}`
      : `/api/categories/children`;

    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok) return;

    setCategoryLevels(prev => {
      const updated = prev.slice(0, level);
      updated[level] = json.data || [];
      return updated;
    });
  };

  // ---------------- HANDLE SELECT ----------------
  const handleSelect = (level: number, value: string) => {
    const newPath = selectedPath.slice(0, level);
    if (value) newPath[level] = value;

    setSelectedPath(newPath);

    // fetch next level
    fetchChildren(value, level + 1);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!name.trim()) {
      alert('Category name required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append(
        'name',
        name.charAt(0).toUpperCase() + name.slice(1)
      );
      formData.append('description', description);

      // ✅ last selected category is the parent
      const parentCategory =
        selectedPath.length > 0
          ? selectedPath[selectedPath.length - 1]
          : null;

      if (parentCategory) {
        formData.append('parentCategory', parentCategory);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/categories', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      router.push('/admin/categories');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="max-w-xl p-6 text-black">
      <h1 className="text-xl font-semibold mb-4">
        Create Category
      </h1>

      <input
        className="input"
        placeholder="Category name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <textarea
        className="input"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        className="input"
        onChange={e =>
          e.target.files && setImageFile(e.target.files[0])
        }
      />

      {imageFile && (
        <img
          src={URL.createObjectURL(imageFile)}
          className="h-32 rounded border object-cover mb-3"
        />
      )}

      {/* 🔥 CASCADING CATEGORY SELECTORS */}
      {categoryLevels.map((levelCats, level) => (
        <select
          key={level}
          className="input"
          value={selectedPath[level] || ''}
          onChange={e =>
            handleSelect(level, e.target.value)
          }
        >
          <option value="">
            Select category level {level + 1}
          </option>
          {levelCats.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      ))}

      <button
        onClick={submit}
        disabled={loading}
        className="btn"
      >
        {loading ? 'Creating...' : 'Create Category'}
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

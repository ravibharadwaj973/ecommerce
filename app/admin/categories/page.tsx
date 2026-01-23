'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function AdminCategories() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'admin') return <p>Access denied</p>;

  // ---------------- FETCH CATEGORIES ----------------
  const fetchCategories = async (parent?: string | null) => {
    setLoading(true);

    const url = parent
      ? `/api/categories?parent=${parent}`
      : `/api/categories`;

    const res = await fetch(url);
    const json = await res.json();

    if (Array.isArray(json.data)) {
      setCategories(json.data);
    } else {
      setCategories([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories(null); // load top-level (Men / Women)
  }, []);

  // ---------------- DELETE ----------------
  const deleteCategory = async (id: string) => {
    if (!confirm('Delete category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories(parentId);
  };

  // ---------------- UI ----------------
  return (
    <div className="p-6 text-black max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
          {parentId && (
            <button
              onClick={() => {
                setParentId(null);
                fetchCategories(null);
              }}
              className="text-sm underline text-gray-600"
            >
              ← Back to top-level
            </button>
          )}
        </div>

        <Link href="/admin/categories/create" className="underline">
          + Create
        </Link>
      </div>

      {/* LOADING */}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {/* LIST */}
      <ul className="space-y-3">
        {categories.map(cat => (
          <li
            key={cat._id}
            className="flex items-center justify-between gap-4 border rounded p-3"
          >
            {/* LEFT */}
            <div className="flex items-center gap-4">
              {/* IMAGE */}
              {cat.image?.url ? (
                <img
                  src={cat.image.url}
                  alt={cat.name}
                  className="h-14 w-14 rounded object-cover border"
                />
              ) : (
                <div className="h-14 w-14 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  No Image
                </div>
              )}

              {/* INFO */}
              <div>
                <p className="font-medium">{cat.name}</p>

                {typeof cat.productCount === 'number' && (
                  <p className="text-xs text-gray-500">
                    Products: {cat.productCount}
                  </p>
                )}

                {/* VIEW SUBCATEGORIES */}
                <button
                  onClick={() => {
                    setParentId(cat._id);
                    fetchCategories(cat._id);
                  }}
                  className="text-xs underline text-blue-600"
                >
                  View sub-categories
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/categories/${cat._id}`}
                className="text-sm underline"
              >
                Edit
              </Link>

              <button
                onClick={() => deleteCategory(cat._id)}
                className="text-sm text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}

        {!loading && categories.length === 0 && (
          <p className="text-sm text-gray-500">
            No categories found.
          </p>
        )}
      </ul>
    </div>
  );
}

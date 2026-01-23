'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

type Attribute = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export default function AttributeAdminPage() {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------- ACCESS GUARD ----------
  if (!user || user.role !== 'admin') {
    return <p>Access denied</p>;
  }

  // ---------- FETCH ATTRIBUTES ----------
  const fetchAttributes = async () => {
    try {
      const res = await fetch('/api/newproducts/attributes', {
        credentials: 'include',
        cache: 'no-store',
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      // backend should return: { success, data: [...] }
      setAttributes(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      console.error('Failed to fetch attributes', error);
      setAttributes([]);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  // ---------- CREATE ATTRIBUTE ----------
  const createAttribute = async () => {
    if (!name.trim()) {
      toast.error('Attribute name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/newproducts/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('Attribute created');
      setName('');
      fetchAttributes(); // refresh list
    } catch (err: any) {
      toast.error(err.message || 'Failed to create attribute');
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="mx-auto max-w-lg p-6 text-black">
      <h1 className="mb-4 text-xl font-semibold">Attributes</h1>

      {/* CREATE */}
      <div className="mb-6 space-y-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Attribute name (e.g. Size, Color)"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <button
          onClick={createAttribute}
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create Attribute'}
        </button>
      </div>

      {/* LIST */}
      <h2 className="mb-2 text-sm font-medium text-gray-600">
        Existing Attributes
      </h2>

      {attributes.length === 0 ? (
        <p className="text-sm text-gray-500">No attributes found.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Slug</th>
              <th className="py-2 text-left">Active</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map(attr => (
              <tr key={attr._id} className="border-b">
                <td className="py-2">{attr.name}</td>
                <td className="py-2 text-gray-500">{attr.slug}</td>
                <td className="py-2">
                  {attr.isActive ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

type Variant = {
  _id: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  product?: {
    name?: string;
  };
  attributes: {
    attribute: { name: string };
    value: { value: string };
  }[];
};

export default function AdminVariantsPage() {
  const { user } = useAuth();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------- ACCESS ----------
  if (!user || !['admin', 'vendor'].includes(user.role)) {
    return <p className="p-6">Access denied</p>;
  }

  // ---------- FETCH ALL VARIANTS ----------
  const fetchVariants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/newproducts/allvarient');
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setVariants(json.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load variants');
    } finally {
      setLoading(false);
    }
  };
console.log(variants)
  useEffect(() => {
    fetchVariants();
  }, []);

  // ---------- UPDATE ----------
  const updateVariant = async (id: string, data: Partial<Variant>) => {
    try {
      const res = await fetch(`/api/newproducts/variants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('Variant updated');
      fetchVariants();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  // ---------- DELETE ----------
  const deleteVariant = async (id: string) => {
    if (!confirm('Delete this variant?')) return;

    try {
      const res = await fetch(`/api/newproducts/variants/${id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
if(res.ok){
  toast.success(json.message)
}
     
      setVariants(prev => prev.filter(v => v._id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // ---------- UI ----------
  return (
    <div className="p-6 max-w-6xl mx-auto text-black">
      <h1 className="text-2xl font-semibold mb-6">Product Variants</h1>

      {loading && <p>Loading...</p>}

      <div className="space-y-4">
        {variants.map(variant => (
          <div
            key={variant._id}
            className="border rounded-lg p-4 flex flex-col gap-3 bg-white shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">SKU: {variant.sku}</p>
                <p className="text-sm text-gray-600">
                  Product: {variant.product?.name || '—'}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  variant.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {variant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* ATTRIBUTES */}
            <div className="flex flex-wrap gap-2 text-sm">
              {variant.attributes.map((a, i) => (
                <span
                  key={i}
                  className="bg-gray-100 px-2 py-1 rounded"
                >
                  {a.attribute.name}: {a.value.value}
                </span>
              ))}
            </div>

            {/* EDIT FIELDS */}
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                defaultValue={variant.price}
                className="border rounded px-2 py-1"
                onBlur={e =>
                  updateVariant(variant._id, {
                    price: Number(e.target.value),
                  })
                }
              />

              <input
                type="number"
                defaultValue={variant.stock}
                className="border rounded px-2 py-1"
                onBlur={e =>
                  updateVariant(variant._id, {
                    stock: Number(e.target.value),
                  })
                }
              />

              <select
                defaultValue={String(variant.isActive)}
                className="border rounded px-2 py-1"
                onChange={e =>
                  updateVariant(variant._id, {
                    isActive: e.target.value === 'true',
                  })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end">
              <button
                onClick={() => deleteVariant(variant._id)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

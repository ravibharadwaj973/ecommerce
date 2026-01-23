'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';

type Attribute = {
  _id: string;
  name: string;
};

export default function CreateAttributeValuePage() {
  const { user } = useAuth();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeId, setAttributeId] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'admin') {
    return <p>Access denied</p>;
  }

  useEffect(() => {
    fetch('/api/newproducts/attributes', { cache: 'no-store' })
      .then(res => res.json())
      .then(json => setAttributes(json.data || []));
  }, []);

  const submit = async () => {
    if (!attributeId || !value.trim()) {
      toast.error('Attribute and value required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/newproducts/attribute-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attribute: attributeId,
          value,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('Value added');
      setValue('');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md p-6">
      <h1 className="text-xl font-semibold mb-4">Add Attribute Value</h1>

      <select
        className="w-full border px-3 py-2 mb-3"
        value={attributeId}
        onChange={e => setAttributeId(e.target.value)}
      >
        <option value="">Select attribute</option>
        {attributes.map(a => (
          <option key={a._id} value={a._id}>
            {a.name}
          </option>
        ))}
      </select>

      <input
        className="w-full border px-3 py-2 mb-3"
        placeholder="Value (e.g. Blue)"
        value={value}
        onChange={e => setValue(e.target.value)}
      />

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-black text-white py-2"
      >
        {loading ? 'Saving...' : 'Add Value'}
      </button>
    </div>
  );
}

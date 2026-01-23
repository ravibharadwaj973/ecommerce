'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
type Category = {
  _id: string;
  name: string;
};
export default function CreateProductPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
 const [categoryLevels, setCategoryLevels] = useState<any[][]>([]);
const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    brand: '',
    features: [] as string[],
    tags: [] as string[],
    isPublished: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [tempFeature, setTempFeature] = useState('');
  const [tempTag, setTempTag] = useState('');

  // ---------- ACCESS GUARD ----------
  if (!user || !['admin', 'vendor'].includes(user.role)) {
    return <p>Access denied</p>;
  }

  // ---------- HELPERS ----------
  const addFeature = () => {
    if (tempFeature && !formData.features.includes(tempFeature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, tempFeature],
      }));
      setTempFeature('');
    }
  };

  const removeFeature = (f: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(x => x !== f),
    }));
  };

  const addTag = () => {
    if (tempTag && !formData.tags.includes(tempTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tempTag],
      }));
      setTempTag('');
    }
  };

  const removeTag = (t: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(x => x !== t),
    }));
  };
useEffect(() => {
  fetchCategoryChildren(null, 0);
}, []);

const fetchCategoryChildren = async (
  parentId: string | null,
  level: number
) => {
  const url = parentId
    ? `/api/categories/children?parent=${parentId}`
    : `/api/categories/children`;

  const res = await fetch(url);
  const json = await res.json();

  if (!json.success || !json.data.length) return;

  setCategoryLevels((prev) => {
    const copy = [...prev];
    copy[level] = json.data;
    return copy;
  });
};

const handleCategorySelect = async (
  level: number,
  categoryId: string
) => {
  // update selected path
  setSelectedCategoryIds((prev) => {
    const updated = prev.slice(0, level);
    updated[level] = categoryId;

    // ✅ SET FINAL CATEGORY ID (always last selected)
    setFormData((f) => ({
      ...f,
      categoryId,
    }));

    return updated;
  });

  // remove deeper dropdowns
  setCategoryLevels((prev) => prev.slice(0, level + 1));

  // load next level
  await fetchCategoryChildren(categoryId, level + 1);
};

  // ---------- SUBMIT ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
if (!formData.categoryId) {
  alert("Please select a final category");
  setLoading(false);
  return;
}
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('categoryId', formData.categoryId);
      fd.append('brand', formData.brand);
      fd.append('features', JSON.stringify(formData.features));
      fd.append('tags', JSON.stringify(formData.tags));
      fd.append('isPublished', String(formData.isPublished));

      images.forEach(img => fd.append('images', img));

      const res = await fetch('/api/newproducts', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('Product created');
      router.push(`/admin/products/${data.data._id}/variants`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="containe text-black">
      <h2  className=" text-black">Create Product</h2>

      <form onSubmit={handleSubmit} className=" text-black">
        <input
          placeholder="Product name"
          value={formData.name}
          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
          required
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={e =>
            setFormData(p => ({ ...p, description: e.target.value }))
          }
        />

     {/* CATEGORY SELECTION */}
<div className="space-y-2">
  {categoryLevels.map((cats, level) => (
    <select
      key={level}
      className="input"
      value={selectedCategoryIds[level] || ""}
      onChange={(e) =>
        handleCategorySelect(level, e.target.value)
      }
     
    >
      <option value="">Select category</option>
      {cats.map((cat) => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
    </select>
  ))}
</div>


        <input
          placeholder="Brand"
          value={formData.brand}
          onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}
        />

        {/* FEATURES */}
        <div>
          <input
            placeholder="Feature"
            value={tempFeature}
            onChange={e => setTempFeature(e.target.value)}
          />
          <button type="button" onClick={addFeature}>
            Add
          </button>
        </div>

        {formData.features.map(f => (
          <div key={f}>
            {f}
            <button type="button" onClick={() => removeFeature(f)}>
              x
            </button>
          </div>
        ))}

        {/* TAGS */}
        <div>
          <input
            placeholder="Tag"
            value={tempTag}
            onChange={e => setTempTag(e.target.value)}
          />
          <button type="button" onClick={addTag}>
            Add
          </button>
        </div>

        {formData.tags.map(t => (
          <div key={t}>
            {t}
            <button type="button" onClick={() => removeTag(t)}>
              x
            </button>
          </div>
        ))}

        {/* IMAGES */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={e =>
            e.target.files && setImages(Array.from(e.target.files))
          }
        />

        <label>
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={e =>
              setFormData(p => ({ ...p, isPublished: e.target.checked }))
            }
          />
          Publish
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>

      {/* SIMPLE CSS */}
      <style jsx>{`
        .container {
          max-width: 500px;
          margin: 20px auto;
          
        }
        input,
        textarea,
        button {
          display: block;
          width: 100%;
          margin-bottom: 10px;
          padding: 6px;
        }
        button {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

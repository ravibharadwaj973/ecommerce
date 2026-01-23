"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";

export default function EditProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    brand: "",
    features: [] as string[],
    tags: [] as string[],
    isPublished: true,
  });

  const [tempFeature, setTempFeature] = useState("");
  const [tempTag, setTempTag] = useState("");

  if (!user || !["admin", "vendor"].includes(user.role)) {
    return <p>Access denied</p>;
  }

  // Load product
  useEffect(() => {
    const loadProduct = async () => {
      const res = await fetch(`/api/newproducts/${id}`);
      const json = await res.json();
      if (json.success) {
        setFormData({
          name: json.data.name,
          description: json.data.description || "",
          categoryId: json.data.category || "",
          brand: json.data.brand || "",
          features: json.data.features || [],
          tags: json.data.tags || [],
          isPublished: json.data.isPublished ?? true,
        });
      }
    };

    loadProduct();
  }, [id]);

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(json => setCategories(json.data?.categories || json.data || []));
  }, []);

  const addFeature = () => {
    if (tempFeature && !formData.features.includes(tempFeature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, tempFeature],
      }));
      setTempFeature("");
    }
  };

  const addTag = () => {
    if (tempTag && !formData.tags.includes(tempTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tempTag],
      }));
      setTempTag("");
    }
  };

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("categoryId", formData.categoryId);
      fd.append("brand", formData.brand);
      fd.append("features", JSON.stringify(formData.features));
      fd.append("tags", JSON.stringify(formData.tags));
      fd.append("isPublished", String(formData.isPublished));

      images.forEach(img => fd.append("images", img));

      const res = await fetch(`/api/newproducts/${id}`, {
        method: "PATCH",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      alert("Product updated");
      router.push("/admin/products");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-black">
      <h1 className="text-xl font-semibold mb-4">Edit Product</h1>

      <form onSubmit={submit} className="space-y-3">
        <input
          placeholder="Name"
          value={formData.name}
          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
          required
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
        />

        <select
          value={formData.categoryId}
          onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))}
          required
        >
          <option value="">Select category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Brand"
          value={formData.brand}
          onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}
        />

        {/* FEATURES */}
        <div>
          <input
            placeholder="Add feature"
            value={tempFeature}
            onChange={e => setTempFeature(e.target.value)}
          />
          <button type="button" onClick={addFeature}>Add</button>
        </div>

        {formData.features.map((f, i) => (
          <div key={i}>{f}</div>
        ))}

        {/* TAGS */}
        <div>
          <input
            placeholder="Add tag"
            value={tempTag}
            onChange={e => setTempTag(e.target.value)}
          />
          <button type="button" onClick={addTag}>Add</button>
        </div>

        {formData.tags.map((t, i) => (
          <div key={i}>{t}</div>
        ))}

        {/* IMAGES */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={e => e.target.files && setImages(Array.from(e.target.files))}
        />

        <label>
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={e => setFormData(p => ({ ...p, isPublished: e.target.checked }))}
          />
          Published
        </label>

        <button disabled={loading}>
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}

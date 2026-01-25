'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type Category = {
  _id: string;
  name: string;
  children?: Category[];
};

interface Props {
  value: string | null;
  onChange: (categoryId: string) => void;
  label?: string;
}

export default function CategorySelect({ value, onChange, label }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load top-level categories (Men / Women)
  useEffect(() => {
    fetchChildren(null);
  }, []);

  const fetchChildren = async (parentId: string | null) => {
    setLoading(true);
    alert(parentId)
    try {
      const url = parentId
        ? `/api/categories/children?parent=${parentId}`
        : `/api/categories/children`;

      const res = await fetch(url);
      const json = await res.json();

      if (!json.success) return;

      if (!parentId) {
        setCategories(json.data);
      } else {
        setCategories(prev => insertChildren(prev, parentId, json.data));
      }
    } finally {
      setLoading(false);
    }
  };

  const insertChildren = (
    list: Category[],
    parentId: string,
    children: Category[]
  ): Category[] => {
    return list.map(cat => {
      if (cat._id === parentId) {
        return { ...cat, children };
      }
      if (cat.children) {
        return {
          ...cat,
          children: insertChildren(cat.children, parentId, children),
        };
      }
      return cat;
    });
  };

  const toggleExpand = async (cat: Category) => {
    if (expanded.has(cat._id)) {
      setExpanded(prev => {
        const next = new Set(prev);
        next.delete(cat._id);
        return next;
      });
      return;
    }

    setExpanded(prev => new Set(prev).add(cat._id));

    if (!cat.children) {
      await fetchChildren(cat._id);
    }
  };

  const renderCategory = (cat: Category, depth = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isOpen = expanded.has(cat._id);

    return (
      <div key={cat._id} style={{ paddingLeft: depth * 16 }}>
        <div className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded">

          {/* Expand Button */}
          <button onClick={() => toggleExpand(cat)}>
            {hasChildren || expanded.has(cat._id) ? (
              isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : (
              <span className="w-4" />
            )}
          </button>

          {/* Radio Select */}
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="radio"
              checked={value === cat._id}
              onChange={() => onChange(cat._id)}
            />
            <span className={value === cat._id ? "font-semibold text-blue-600" : ""}>
              {cat.name}
            </span>
          </label>
        </div>

        {/* Children */}
        {isOpen && cat.children && (
          <div className="ml-3 border-l pl-2">
            {cat.children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {label && <p className="text-sm font-medium mb-2">{label}</p>}

      <div className="border rounded max-h-72 overflow-auto bg-white">
        {loading && <p className="p-3 text-sm text-gray-500">Loading...</p>}

        {!loading && categories.map(cat => renderCategory(cat))}
      </div>
    </div>
  );
}

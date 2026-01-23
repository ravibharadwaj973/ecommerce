"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "../../../../context/AuthContext";
import { toast } from "sonner";
import { Router } from "lucide-react";

type Attribute = {
  _id: string;
  name: string;
  values: {
    _id: string;
    value: string;
  }[];
};

export default function CreateVariants() {
  const { user } = useAuth();
  const { id: productId } = useParams();
const router=useRouter()
  const [attributes, setAttributes] = useState<Attribute[]>([]);
const [selected, setSelected] = useState<
  Record<string, string[]>
>({});
const [tempSelected, setTempSelected] = useState<Record<string, string>>({});
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------- ACCESS GUARD ----------------
  if (!user || !["admin", "vendor"].includes(user.role)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-600">Access denied</p>
      </div>
    );
  }
const generateCombinations = (
  selected: Record<string, string[]>
) => {
  const entries = Object.entries(selected);

  if (entries.length === 0) return [];

  const combine = (index: number, current: any[]): any[] => {
    if (index === entries.length) return [current];

    const [attributeId, values] = entries[index];

    let result: any[] = [];
    for (const valueId of values) {
      result = result.concat(
        combine(index + 1, [
          ...current,
          { attribute: attributeId, value: valueId },
        ])
      );
    }
    return result;
  };

  return combine(0, []);
};

  // ---------------- FETCH ATTRIBUTES ----------------
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await fetch("/api/newproducts/attribute-values");
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);

        const grouped: Record<string, any> = {};

        json.data.forEach((item: any) => {
          const attrId = item.attribute._id;

          if (!grouped[attrId]) {
            grouped[attrId] = {
              _id: attrId,
              name: item.attribute.name,
              slug: item.attribute.slug,
              values: [],
            };
          }

          grouped[attrId].values.push({
            _id: item._id,
            value: item.value,
            slug: item.slug,
          });
        });

        const attributesArray = Object.values(grouped);
        setAttributes(attributesArray);
      } catch (err: any) {
        toast.error(err.message || "Failed to load attributes");
      }
    };

    fetchAttributes();
  }, []);
  const addAttributeValue = (attributeId: string) => {
  const valueId = tempSelected[attributeId];
  if (!valueId) return;

  setSelected(prev => {
    const existing = prev[attributeId] || [];
    if (existing.includes(valueId)) return prev;

    return {
      ...prev,
      [attributeId]: [...existing, valueId],
    };
  });

  setTempSelected(prev => ({
    ...prev,
    [attributeId]: "",
  }));
};

const removeAttributeValue = (attributeId: string, valueId: string) => {
  setSelected(prev => ({
    ...prev,
    [attributeId]: prev[attributeId].filter(v => v !== valueId),
  }));
};
console.log(productId)
  // ---------------- CREATE VARIANT ----------------
const createVariant = async () => {
  if (!sku.trim() || !price || !stock) {
    toast.error("SKU, price and stock are required");
    return;
  }

  const combinations = generateCombinations(selected);

  if (combinations.length === 0) {
    toast.error("Select at least one attribute value");
    return;
  }

  setLoading(true);

  try {
    for (let i = 0; i < combinations.length; i++) {
      const variantSku = `${sku}-${i + 1}`;

      const res = await fetch("/api/newproducts/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: productId,
          sku: variantSku,
          price: Number(price),
          stock: Number(stock),
          attributes: combinations[i], // ✅ SINGLE VALUES
        }),
      });

      const json = await res.json();
    
      if (!res.ok) throw new Error(json.message);
      if(res.ok){
        router.push('/admin/products')
      }
    }

    toast.success("Variants created successfully");

    setSku("");
    setPrice("");
    setStock("");
    setSelected({});
  } catch (err: any) {
    toast.error(err.message || "Failed to create variants");
  } finally {
    setLoading(false);
  }
};


  // ---------------- UI ----------------
  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">
        Create Variant
      </h1>

      {/* ATTRIBUTES */}
      <div className="space-y-4 text-black">
     {attributes.map(attr => (
  <div key={attr._id} className="space-y-2">
    <label className="text-sm font-medium">{attr.name}</label>

    <div className="flex gap-2">
      <select
        value={tempSelected[attr._id] || ""}
        onChange={e =>
          setTempSelected(p => ({
            ...p,
            [attr._id]: e.target.value,
          }))
        }
        className="flex-1 border rounded px-2 py-1"
      >
        <option value="">Select {attr.name}</option>
        {attr.values.map(v => (
          <option key={v._id} value={v._id}>
            {v.value}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => addAttributeValue(attr._id)}
        className="px-3 rounded bg-black text-white"
      >
        +
      </button>
    </div>

    {/* Selected values */}
    <div className="flex flex-wrap gap-2">
      {(selected[attr._id] || []).map(vId => {
        const val = attr.values.find(v => v._id === vId);
        return (
          <span
            key={vId}
            className="flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-sm"
          >
            {val?.value}
            <button
              onClick={() => removeAttributeValue(attr._id, vId)}
              className="text-red-600"
            >
              ×
            </button>
          </span>
        );
      })}
    </div>
  </div>
))}

      </div>

      {/* SKU / PRICE / STOCK */}
      <div className="mt-6 space-y-3 text-black">
        <input
          type="text"
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm focus:border-black focus:outline-none"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm focus:border-black focus:outline-none"
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </div>

      {/* SUBMIT */}
      <button
        onClick={createVariant}
        disabled={loading}
        className="mt-6 w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create Variant"}
      </button>
    </div>
  );
}

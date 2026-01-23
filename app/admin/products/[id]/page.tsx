"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    const res = await fetch(`/api/newproducts/${id}`);
    const json = await res.json();
    setProduct(json.data);
  };

  const fetchVariants = async () => {
    const res = await fetch(`/api/newproducts/variants?product=${id}`);
    const json = await res.json();
    setVariants(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProduct();
    fetchVariants();
  }, []);

  const deleteVariant = async (variantId: string) => {
    if (!confirm("Delete this variant?")) return;

    await fetch(`/api/newproducts/variants/${variantId}`, {
      method: "DELETE",
    });

    fetchVariants();
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 text-black max-w-5xl mx-auto">
      {/* PRODUCT INFO */}
      <div className="mb-6 border p-4 rounded">
        <h1 className="text-xl font-semibold">{product?.name}</h1>

        <p className="text-sm text-gray-600 mt-1">
          Category: {product?.category?.name || "Unassigned"}
        </p>

        <p className="text-sm mt-2">{product?.description}</p>

        <button
          onClick={() => router.push(`/admin/products/${id}/edit`)}
          className="mt-3 underline text-sm"
        >
          Edit Product
        </button>
      </div>

      {/* VARIANTS */}
      <div className="flex justify-between mb-3">
        <h2 className="text-lg font-semibold">Variants</h2>

        <button
          onClick={() => router.push(`/admin/products/${id}/variants/create`)}
          className="underline text-sm"
        >
          + Add Variant
        </button>
      </div>

      <ul className="space-y-3">
        {variants.map((v) => (
          <li key={v._id} className="border rounded p-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">SKU: {v.sku}</p>

                <p className="text-sm">Price: ₹{v.price}</p>
                <p className="text-sm">Stock: {v.stock}</p>

                {/* ATTRIBUTES */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {v.attributes.map((a: any) => (
                    <span
                      key={a._id}
                      className="bg-gray-200 text-xs px-2 py-1 rounded"
                    >
                      {a.attribute?.name}: {a.value?.value}
                    </span>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-2 text-sm">
                <button
                  onClick={() =>
                    router.push(`/admin/variants/${v._id}/edit`)
                  }
                  className="underline"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteVariant(v._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

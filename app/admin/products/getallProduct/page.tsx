"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  if (!user || !["admin", "vendor"].includes(user.role)) {
    return <p>Access denied</p>;
  }

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/newproducts");
    const json = await res.json();
    setProducts(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    await fetch(`/api/newproducts/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="p-6 text-black max-w-6xl mx-auto">
      <div className="flex justify-between mb-5">
        <h1 className="text-xl font-semibold">Products</h1>

        <Link href="/admin/products/create" className="underline">
          + Create Product
        </Link>
      </div>

      {loading && <p>Loading...</p>}

      <ul className="space-y-3">
        {products.map((p) => (
          <li
            key={p._id}
            className="flex justify-between border rounded p-3 gap-4"
          >
            {/* LEFT */}
            <div className="flex gap-4">
              {/* IMAGE */}
              {p.images?.[0]?.url ? (
                <img
                  src={p.images[0].url}
                  className="h-16 w-16 object-cover rounded border"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-200 flex items-center justify-center text-xs">
                  No Image
                </div>
              )}

              {/* INFO */}
              <div>
                <p className="font-medium">{p.name}</p>

                <p className="text-xs text-gray-500">
                  Category: {p.category?.name || "Unassigned"}
                </p>

                <p className="text-xs text-gray-500">
                  Variants: {p.variantCount || 0}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 items-center">
              <Link
                href={`/admin/products/${p._id}`}
                className="underline text-sm"
              >
                View / Edit
              </Link>

              <button
                onClick={() => deleteProduct(p._id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

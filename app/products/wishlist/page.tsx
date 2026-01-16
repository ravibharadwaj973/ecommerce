'use client';

import Link from 'next/link';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../context/wishlist';
import { useCart } from '../../context/CartContext';
import { useWishlistStore } from '@/app/store/wishlist.store';

export default function WishlistPage() {
  const {  loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

const {items}=useWishlistStore();
const handleremovewish=(id)=>{

removeFromWishlist(id);
}


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading wishlist...</p>
      </div>
    );
  }
 

  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-6">
          Save products you love and come back later.
        </p>
        <Link
          href="/products"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl text-black font-bold mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-black">
          {items.map(({ product }) => (
            <div
              key={product._id}
              className="bg-white rounded-lg border p-4 flex flex-col"
            >
              <Link href={`/products/${product._id}`}>
                <img
                  src={product.images?.[0] || '/placeholder.png'}
                  alt={product.name}
                  className="h-48 w-full object-cover rounded mb-4"
                />
              </Link>

              <h3 className="font-semibold text-lg mb-1">
                {product.name}
              </h3>

              <p className="text-gray-600 mb-3">
                ${product.price}
              </p>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => addToCart(product._id, 'M', 1)}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>

                <button
                  onClick={() => handleremovewish(product._id)}
                  className="p-2 border rounded-lg hover:bg-red-50 text-red-600"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

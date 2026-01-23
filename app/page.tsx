'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductGrid from './components/ProductGrid';
import HeroSlider from './components/Heroslider';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch active categories
      const res = await fetch('/api/categories?includeProducts=false&onlyActive=true');
      const data = await res.json();

      if (!data.success) return;

      setCategories(data.data.categories);

      // Fetch limited products for each category
      const productMap = {};

      await Promise.all(
        data.data.categories.map(async (category) => {
          const pRes = await fetch(
            `/api/products?category=${category._id}&limit=4&isPublished=true`
          );
          const pData = await pRes.json();

          if (pData.success) {
            productMap[category._id] = pData.data.products;
          }
        })
      );

      setProductsByCategory(productMap);
    } catch (err) {
      console.error('Home page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <HeroSlider/>
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-10">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-64 bg-gray-200 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 space-y-16">

        {categories.map((category, index) => {
          const products = productsByCategory[category._id] || [];

          if (products.length === 0) return null;

          return (
            <motion.section
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {category.name}
                </h2>

                <Link
                  href={`/categories/${category._id}`}
                  className="text-indigo-600 font-medium hover:text-indigo-500"
                >
                  More →
                </Link>
              </div>

              {/* Products Row (NO SCROLL) */}
              <ProductGrid
                products={products}
                loading={false}
                viewMode="grid"
                limitColumns={4}   // important: fixed row layout
              />
            </motion.section>
          );
        })}

      </div>
    </div>
  );
}

import ProductVariants from "../../components/ProductVariants";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Share2, Heart } from "lucide-react";

// 1. Notice we still use async
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>; // 2. Define params as a Promise
}) {
  // 3. UNWRAP the params using await
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Mobile Navigation */}
      <div className="flex justify-between items-center p-4 md:hidden">
        <Link href="/">
          <ChevronLeft className="text-gray-900" />
        </Link>
        <div className="flex gap-4">
          <Share2 size={20} />
          <Heart size={20} />
        </div>
      </div>
      <div className="border-t border-gray-100 pt-8">
        <ProductVariants productId={productId} />
      </div>
    </div>
  );
}

export interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  salePrice?: number;
  isOnSale: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
  discountPercent: number;
  category: string | { _id: string; name: string };
  brand?: string;
  stock: number;
  sizes: string[];
  colors: string[];
  features: string[];
  tags: string[];
  sku: string;
  images: string[];
  isPublished: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdBy: string;
  viewCount: number;
  purchaseCount: number;
  wishlistCount: number;
  rating: {
    average: number;
    count: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductFilters {
  search: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  inStock: string;
  isPublished: string;
  color: string;
  tag: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
}
export interface SalesOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
}

export interface RecentOrder {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface TopProduct {
  name: string;
  totalSold: number;
  totalRevenue: number;
  image?: string;
}

export interface RevenueTrend {
  _id: string;
  revenue: number;
  orders: number;
}

export interface CustomerLTV {
  customerId: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  customerSince: string;
}

export interface CustomerMetrics {
  totalCustomers: number;
  repeatCustomers: number;
  repeatCustomerRate: number;
  averageOrdersPerCustomer: number;
}

export interface SalesByRegion {
  country: string;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  customerCount: number;
}

export interface ProductPerformance {
  productId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
  orderCount: number;
  conversionRate: number;
}

export interface CategoryPerformance {
  category: string;
  totalRevenue: number;
  totalSold: number;
  productCount: number;
}

export interface SalesTrend {
  _id: string;
  total: number;
}

export interface SalesTrendMetrics {
  currentTotal: number;
  previousTotal: number;
  growth: number;
  period: string;
  type: string;
}
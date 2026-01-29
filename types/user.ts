export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'vendor';
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserFilters {
  search: string;
  role: string;
  isActive: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}
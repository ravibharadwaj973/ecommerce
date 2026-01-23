// components/AdminSidebar.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CogIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CubeIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },

  { name: "Attributes", href: "/admin/attributes", icon: HomeIcon, children: [
      { name: "Attributes", href: "/admin/attributes" },
      { name: "Attributes-Value", href: "/admin/attributes/values" },
     
    ], },

  { name: "Categories", icon: RectangleGroupIcon,  children: [
      { name: "get all Category", href: "/admin/categories" },
      { name: "create categories", href: "/admin/categories/create" },
     
    ], },

  {
    name: "Products",
    icon: ShoppingBagIcon,
    children: [
      { name: "Create Product", href: "/admin/products" },
      { name: "All product", href: "/admin/products/getallProduct" },
      { name: "Variants", href: "/admin/variants" },
    ],
  },

  { name: "Orders", href: "/admin/orders", icon: ShoppingCartIcon },

  { name: "Users", href: "/admin/users", icon: UsersIcon },

  {
    name: "Analytics",
    icon: ChartBarIcon,
    children: [
      { name: "Sales Dashboard", href: "/admin/analytics" },
      { name: "Customer Analytics", href: "/admin/analytics/customers" },
      { name: "Product Analytics", href: "/admin/analytics/products" },
    ],
  },

  { name: "Settings", href: "/admin/settings", icon: CogIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.children &&
                item.children.some((child) => pathname === child.href));

            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu(openMenu === item.name ? null : item.name)
                  }
                  className={`flex w-full items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive || openMenu === item.name
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="flex-1 text-left">{item.name}</span>
                  <span className="text-xs">
                    {openMenu === item.name ? "▾" : "▸"}
                  </span>
                </button>

                {/* Analytics Submenu */}
                {item.children && (openMenu === item.name || isActive) && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          pathname === child.href
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

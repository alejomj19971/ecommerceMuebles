import type {
  AdminClosureRecord,
  AdminInventoryItem,
  AdminSaleRecord,
} from "@/mocks/admin-data";
import {
  adminClosuresMock,
  adminInventoryMock,
  adminSalesMock,
} from "@/mocks/admin-data";

const INVENTORY_KEY = "admin_inventory_v1";
const SALES_KEY = "admin_sales_v1";
const CLOSURES_KEY = "admin_closures_v1";

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function loadAdminInventory(): AdminInventoryItem[] {
  if (typeof window === "undefined") return adminInventoryMock;
  return safeParse<AdminInventoryItem[]>(window.localStorage.getItem(INVENTORY_KEY)) ??
    adminInventoryMock;
}

export function saveAdminInventory(items: AdminInventoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

export function loadAdminSales(): AdminSaleRecord[] {
  if (typeof window === "undefined") return adminSalesMock;
  return safeParse<AdminSaleRecord[]>(window.localStorage.getItem(SALES_KEY)) ??
    adminSalesMock;
}

export function saveAdminSales(sales: AdminSaleRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

export function loadAdminClosures(): AdminClosureRecord[] {
  if (typeof window === "undefined") return adminClosuresMock;
  return (
    safeParse<AdminClosureRecord[]>(window.localStorage.getItem(CLOSURES_KEY)) ??
    adminClosuresMock
  );
}

export function saveAdminClosures(closures: AdminClosureRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLOSURES_KEY, JSON.stringify(closures));
}


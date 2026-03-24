export type InventoryCategory = "Sala" | "Dormitorio" | "Comedor" | "Oficina";

export type AdminInventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  stockQty: number;
  minStockQty: number;
  price: number; // precio venta (COP)
  cost: number; // costo (COP) para utilidades
};

export type AdminSaleLine = {
  productId: string;
  qty: number;
  unitPrice: number;
};

export type AdminSaleRecord = {
  id: string;
  invoiceNo: string;
  createdAt: string; // ISO
  customerName: string;
  method: "Efectivo" | "Tarjeta" | "Transferencia";
  status: "Pagada" | "Pendiente";
  lines: AdminSaleLine[];
  subtotal: number;
  total: number;
  itemsCount: number;
};

export type AdminClosureRecord = {
  id: string;
  createdAt: string; // ISO
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  salesCount: number;
  itemsCount: number;
  subtotal: number;
  tax: number;
  total: number;
};

const now = () => new Date().toISOString();

export const adminInventoryMock: AdminInventoryItem[] = [
  {
    id: "inv-sofa-avondale",
    sku: "AVD-001",
    name: "Sofa Avondale",
    category: "Sala",
    stockQty: 12,
    minStockQty: 5,
    price: 1800000,
    cost: 980000,
  },
  {
    id: "inv-sofa-zuma",
    sku: "ZMA-014",
    name: "Sofa Zuma",
    category: "Dormitorio",
    stockQty: 8,
    minStockQty: 4,
    price: 2800000,
    cost: 1500000,
  },
  {
    id: "inv-silla-pershing",
    sku: "PER-220",
    name: "Silla Pershing",
    category: "Comedor",
    stockQty: 6,
    minStockQty: 3,
    price: 2900000,
    cost: 1650000,
  },
  {
    id: "inv-silla-powell",
    sku: "POW-099",
    name: "Silla Powell",
    category: "Oficina",
    stockQty: 10,
    minStockQty: 4,
    price: 2000000,
    cost: 1100000,
  },
  {
    id: "inv-butaca-infini",
    sku: "INF-777",
    name: "Butaca Infini",
    category: "Sala",
    stockQty: 4,
    minStockQty: 4,
    price: 2500000,
    cost: 1350000,
  },
  {
    id: "inv-sofa-cerse",
    sku: "CER-202",
    name: "Sofa Cerse",
    category: "Comedor",
    stockQty: 7,
    minStockQty: 3,
    price: 2200000,
    cost: 1200000,
  },
];

export const adminSalesMock: AdminSaleRecord[] = [
  {
    id: "sale-1001",
    invoiceNo: "FS-1001",
    createdAt: now(),
    customerName: "Laura M.",
    method: "Tarjeta",
    status: "Pagada",
    lines: [
      {
        productId: "inv-sofa-avondale",
        qty: 1,
        unitPrice: 1800000,
      },
    ],
    subtotal: 1800000,
    total: 1800000,
    itemsCount: 1,
  },
  {
    id: "sale-1002",
    invoiceNo: "FS-1002",
    createdAt: now(),
    customerName: "Carlos R.",
    method: "Transferencia",
    status: "Pagada",
    lines: [
      {
        productId: "inv-silla-pershing",
        qty: 2,
        unitPrice: 2900000,
      },
    ],
    subtotal: 5800000,
    total: 5800000,
    itemsCount: 2,
  },
];

export const adminClosuresMock: AdminClosureRecord[] = [];


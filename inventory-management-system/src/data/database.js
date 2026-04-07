// Mock Database - Inventory Items
export const inventoryItems = [
  {
    id: 1,
    name: 'Laptop Pro Max',
    sku: 'SKU-001',
    category: 'Electronics',
    quantity: 45,
    reorderLevel: 20,
    unitPrice: 1299.99,
    supplier: 'TechSupply Inc',
    lastRestockDate: '2024-03-15',
    status: 'In Stock',
    salesLast30Days: 12,
    turnoverRate: 0.267,
    trend: 'up'
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    sku: 'SKU-002',
    category: 'Accessories',
    quantity: 150,
    reorderLevel: 50,
    unitPrice: 29.99,
    supplier: 'PeriTech',
    lastRestockDate: '2024-03-10',
    status: 'In Stock',
    salesLast30Days: 45,
    turnoverRate: 0.3,
    trend: 'down'
  },
  {
    id: 3,
    name: 'USB-C Cable',
    sku: 'SKU-003',
    category: 'Cables',
    quantity: 8,
    reorderLevel: 50,
    unitPrice: 12.99,
    supplier: 'CableWorld',
    lastRestockDate: '2024-02-28',
    status: 'Low Stock',
    salesLast30Days: 78,
    turnoverRate: 9.75,
    trend: 'up'
  },
  {
    id: 4,
    name: '4K Monitor',
    sku: 'SKU-004',
    category: 'Electronics',
    quantity: 22,
    reorderLevel: 10,
    unitPrice: 599.99,
    supplier: 'DisplayMax',
    lastRestockDate: '2024-03-05',
    status: 'In Stock',
    salesLast30Days: 5,
    turnoverRate: 0.227,
    trend: 'up'
  },
  {
    id: 5,
    name: 'Mechanical Keyboard',
    sku: 'SKU-005',
    category: 'Accessories',
    quantity: 3,
    reorderLevel: 25,
    unitPrice: 149.99,
    supplier: 'KeyMaster',
    lastRestockDate: '2024-02-20',
    status: 'Critical',
    salesLast30Days: 34,
    turnoverRate: 11.33,
    trend: 'down'
  },
  {
    id: 6,
    name: 'Laptop Stand',
    sku: 'SKU-006',
    category: 'Accessories',
    quantity: 67,
    reorderLevel: 30,
    unitPrice: 49.99,
    supplier: 'StandPro',
    lastRestockDate: '2024-03-12',
    status: 'In Stock',
    salesLast30Days: 18,
    turnoverRate: 0.269,
    trend: 'stable'
  },
  {
    id: 7,
    name: 'Webcam HD',
    sku: 'SKU-007',
    category: 'Accessories',
    quantity: 35,
    reorderLevel: 15,
    unitPrice: 79.99,
    supplier: 'CamTech',
    lastRestockDate: '2024-03-18',
    status: 'In Stock',
    salesLast30Days: 22,
    turnoverRate: 0.629,
    trend: 'up'
  },
  {
    id: 8,
    name: 'External SSD 1TB',
    sku: 'SKU-008',
    category: 'Electronics',
    quantity: 12,
    reorderLevel: 20,
    unitPrice: 129.99,
    supplier: 'StorageElite',
    lastRestockDate: '2024-02-25',
    status: 'Low Stock',
    salesLast30Days: 28,
    turnoverRate: 2.333,
    trend: 'up'
  },
];

// Monthly sales data for performance analysis
export const monthlySalesData = [
  { month: 'January', sales: 12500, revenue: 285000, units: 85 },
  { month: 'February', sales: 15200, revenue: 312000, units: 95 },
  { month: 'March', sales: 18900, revenue: 425000, units: 125 },
  { month: 'April', sales: 22100, revenue: 520000, units: 156 },
  { month: 'May', sales: 21500, revenue: 480000, units: 142 },
  { month: 'June', sales: 25800, revenue: 580000, units: 185 },
];

// Daily sales trend for last 30 days
export const dailySalesData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  sales: Math.floor(Math.random() * 1500 + 500),
  returns: Math.floor(Math.random() * 100 + 20),
}));

// Category-wise inventory distribution
export const categoryData = [
  { category: 'Electronics', count: 4, value: 43000.95 },
  { category: 'Accessories', count: 4, value: 18570.94 },
  { category: 'Cables', count: 1, value: 103.92 },
];

// Supplier performance
export const supplierPerformance = [
  { name: 'TechSupply Inc', deliveryTime: 5, qualityScore: 4.8, orders: 12 },
  { name: 'PeriTech', deliveryTime: 3, qualityScore: 4.6, orders: 15 },
  { name: 'CableWorld', deliveryTime: 2, qualityScore: 4.9, orders: 8 },
  { name: 'DisplayMax', deliveryTime: 7, qualityScore: 4.5, orders: 6 },
  { name: 'KeyMaster', deliveryTime: 4, qualityScore: 4.7, orders: 10 },
  { name: 'StandPro', deliveryTime: 3, qualityScore: 4.8, orders: 14 },
  { name: 'CamTech', deliveryTime: 5, qualityScore: 4.4, orders: 9 },
  { name: 'StorageElite', deliveryTime: 4, qualityScore: 4.9, orders: 11 },
];

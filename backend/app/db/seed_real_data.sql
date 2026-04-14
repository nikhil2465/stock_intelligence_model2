-- ============================================================
-- StockSense AI — Rich Real-World Seed Data
-- Plywood & Building Materials Dealer, Bangalore
-- Run: USE stocksense_inventory; then execute this file
-- ============================================================

USE stocksense_inventory;

-- ============================================================
-- 1. CLEAR EXISTING SEED DATA (safe — won't touch schema)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE demand_forecast;
TRUNCATE TABLE finance_monthly;
TRUNCATE TABLE freight_trips;
TRUNCATE TABLE freight_lanes;
TRUNCATE TABLE grn;
TRUNCATE TABLE po_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE order_items;
TRUNCATE TABLE invoices;
TRUNCATE TABLE customer_orders;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE stock_levels;
TRUNCATE TABLE customers;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE godowns;
TRUNCATE TABLE products;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 2. PRODUCTS (18 SKUs — BWP, MR, Commercial, Laminate, Flexi)
-- ============================================================
INSERT INTO products (product_id, sku_code, sku_name, brand, category, thickness_mm, size_ft, unit, buy_price, sell_price, reorder_level, abc_class) VALUES
(1,  'BWP-CENT-18-84',  '18mm BWP (8x4)',         'Century',  'BWP Plywood',  18.0, '8x4', 'sheet', 1680, 1920, 200, 'A'),
(2,  'BWP-CENT-12-84',  '12mm BWP (8x4)',          'Century',  'BWP Plywood',  12.0, '8x4', 'sheet', 1100, 1280, 300, 'A'),
(3,  'BWP-GRPL-9-84',   '9mm BWP (8x4)',           'Greenply', 'BWP Plywood',   9.0, '8x4', 'sheet',  820,  940, 180, 'A'),
(4,  'MR-GRPL-12-84',   '12mm MR Plain (8x4)',     'Greenply', 'MR Plywood',   12.0, '8x4', 'sheet',  780,  940, 250, 'A'),
(5,  'MR-GRPL-18-84',   '18mm MR Plain (8x4)',     'Greenply', 'MR Plywood',   18.0, '8x4', 'sheet',  920, 1080, 200, 'B'),
(6,  'MR-CENT-6-84',    '6mm MR Plain (8x4)',      'Century',  'MR Plywood',    6.0, '8x4', 'sheet',  480,  580, 150, 'B'),
(7,  'COM-GEN-19-84',   '19mm Commercial (8x4)',   'Generic',  'Commercial',   19.0, '8x4', 'sheet',  720,  920, 120, 'C'),
(8,  'COM-GEN-12-84',   '12mm Commercial (8x4)',   'Generic',  'Commercial',   12.0, '8x4', 'sheet',  560,  720, 100, 'C'),
(9,  'BWP-GRPL-6-84',   '6mm Gurjan BWP (8x4)',    'Greenply', 'BWP Plywood',   6.0, '8x4', 'sheet',  860, 1100, 100, 'B'),
(10, 'FLEX-GAUR-8-84',  '8mm Flexi BWP (8x4)',     'Gauri',    'Flexi',         8.0, '8x4', 'sheet',  680,  840,  80, 'C'),
(11, 'FLEX-GAUR-10-84', '10mm Flexi BWP (8x4)',    'Gauri',    'Flexi',        10.0, '8x4', 'sheet',  820,  980,  60, 'C'),
(12, 'LAM-GLAM-TEAK',   'Laminates Teak (8x4)',    'Greenlam', 'Laminate',      1.0, '8x4', 'sheet',  620,  760,  80, 'B'),
(13, 'LAM-GLAM-WLNT',   'Laminates Walnut (8x4)',  'Greenlam', 'Laminate',      1.0, '8x4', 'sheet',  640,  780,  60, 'B'),
(14, 'BWP-CENT-8-84',   '8mm BWP (8x4)',           'Century',  'BWP Plywood',   8.0, '8x4', 'sheet',  980, 1140, 120, 'A'),
(15, 'MR-GRPL-6-84',    '6mm MR Plywood (8x4)',    'Greenply', 'MR Plywood',    6.0, '8x4', 'sheet',  460,  560, 120, 'B'),
(16, 'BWP-CENT-25-84',  '25mm BWP (8x4)',           'Century', 'BWP Plywood',  25.0, '8x4', 'sheet', 2100, 2400, 100, 'B'),
(17, 'COM-GEN-6-84',    '6mm Commercial (8x4)',    'Generic',  'Commercial',    6.0, '8x4', 'sheet',  380,  480,  80, 'C'),
(18, 'LAM-GLAM-WHT',    'Laminates White (8x4)',   'Greenlam', 'Laminate',      1.0, '8x4', 'sheet',  580,  720,  60, 'B');

-- ============================================================
-- 3. GODOWNS (3 locations)
-- ============================================================
INSERT INTO godowns (godown_id, godown_name, location, capacity_sheets) VALUES
(1, 'Main WH (HSR Layout)',   'HSR Layout, Bangalore',      2000),
(2, 'North Hub (Yeshwantpur)','Yeshwantpur, Bangalore',     1200),
(3, 'South Yard (Bommanahalli)', 'Bommanahalli, Bangalore', 800);

-- ============================================================
-- 4. STOCK LEVELS (realistic — some critically low, some overstocked)
-- ============================================================
INSERT INTO stock_levels (product_id, godown_id, quantity) VALUES
-- Main WH
(1,  1, 85),   -- 18mm BWP CENTURY — CRITICAL LOW (reorder=200)
(2,  1, 120),  -- 12mm BWP CENTURY — CRITICAL LOW (reorder=300)
(3,  1, 310),  -- 9mm BWP Greenply — OK
(4,  1, 210),  -- 12mm MR Greenply — LOW (reorder=250)
(5,  1, 380),  -- 18mm MR Greenply — HEALTHY
(6,  1, 195),  -- 6mm MR Century — HEALTHY
(7,  1, 28),   -- 19mm Commercial — DEAD STOCK (low qty, no movement)
(8,  1, 42),   -- 12mm Commercial — DEAD STOCK
(9,  1, 186),  -- 6mm Gurjan BWP — DEAD STOCK (186 sheets no movement)
(10, 1, 110),  -- 8mm Flexi — OVERSTOCK
(11, 1, 88),   -- 10mm Flexi — OVERSTOCK
(12, 1, 240),  -- Laminates Teak — HEALTHY
(13, 1, 180),  -- Laminates Walnut — HEALTHY
(14, 1, 45),   -- 8mm BWP Century — LOW (reorder=120)
(15, 1, 220),  -- 6mm MR Greenply — HEALTHY
(16, 1, 140),  -- 25mm BWP Century — HEALTHY
(17, 1, 18),   -- 6mm Commercial — LOW
(18, 1, 160),  -- Laminates White — HEALTHY
-- North Hub
(1,  2, 40),   -- 18mm BWP — also low here
(2,  2, 80),   -- 12mm BWP — also low here
(3,  2, 120),  -- 9mm BWP
(4,  2, 60),   -- 12mm MR
(5,  2, 90),   -- 18mm MR
(12, 2, 80),   -- Laminates Teak
-- South Yard
(1,  3, 15),   -- 18mm BWP — critically low
(3,  3, 60),   -- 9mm BWP
(4,  3, 40),   -- 12mm MR
(14, 3, 20);   -- 8mm BWP

-- ============================================================
-- 5. SUPPLIERS (4 real-world suppliers)
-- ============================================================
INSERT INTO suppliers (supplier_id, supplier_name, contact_person, phone, email, city,
    on_time_pct, avg_delay_days, lead_time_days, freight_per_sheet,
    price_vs_market, grn_match_rate, recommendation) VALUES
(1, 'Century Plyboards Ltd',  'Ramesh Kumar',  '9880001234', 'ramesh@centuryply.com',   'Bangalore', 96.2, 0.5, 6,   8.40, '-3% below market', 98.0, 'EXPAND'),
(2, 'Greenply Industries',    'Suresh Sharma', '9880005678', 'suresh@greenply.com',     'Bangalore', 89.5, 1.8, 8,   9.20, 'At market rate',   95.5, 'GOOD'),
(3, 'Gauri Laminates Pvt Ltd','Anjali Singh',  '9880009012', 'anjali@gaurilam.com',     'Mumbai',    68.3, 4.2, 14, 28.00, '+11% above market', 78.0, 'REDUCE'),
(4, 'Greenlam Industries',    'Vijay Nair',    '9880003456', 'vijay@greenlam.com',      'Delhi',     91.0, 1.2, 10,  6.50, '-1% below market', 96.0, 'GOOD');

-- ============================================================
-- 6. PURCHASE ORDERS (mix of open, partial, overdue)
-- ============================================================
INSERT INTO purchase_orders (po_id, po_number, supplier_id, po_date, expected_date, received_date, status, total_value, notes) VALUES
(1, 'PO-2026-0421', 1, DATE_SUB(CURDATE(),INTERVAL 8 DAY),  DATE_SUB(CURDATE(),INTERVAL 2 DAY),  NULL,       'OVERDUE',  672000, 'Urgent — 18mm BWP critically low'),
(2, 'PO-2026-0418', 2, DATE_SUB(CURDATE(),INTERVAL 5 DAY),  DATE_ADD(CURDATE(),INTERVAL 3 DAY),  NULL,       'OPEN',     312000, '12mm MR Greenply restock'),
(3, 'PO-2026-0415', 1, DATE_SUB(CURDATE(),INTERVAL 12 DAY), DATE_SUB(CURDATE(),INTERVAL 4 DAY),  NULL,       'OVERDUE',  384000, '12mm BWP Century — CRITICAL'),
(4, 'PO-2026-0410', 4, DATE_SUB(CURDATE(),INTERVAL 15 DAY), DATE_SUB(CURDATE(),INTERVAL 5 DAY),  CURDATE(),  'RECEIVED', 198000, 'Laminates Teak & Walnut');

INSERT INTO po_items (po_id, product_id, qty_ordered, qty_received, unit_price, freight_per_sheet) VALUES
(1, 1, 300, 0,   1680, 8.40),
(1, 14, 120, 0,   980, 8.40),
(2, 4, 300, 0,    780, 9.20),
(2, 5, 100, 0,    920, 9.20),
(3, 2, 300, 0,   1100, 8.40),
(4, 12, 150, 150,  620, 6.50),
(4, 13, 120, 120,  640, 6.50);

-- ============================================================
-- 7. CUSTOMERS (10 active dealers, contractors, interior firms)
-- ============================================================
INSERT INTO customers (customer_id, customer_name, segment, phone, email, credit_limit, credit_days, avg_discount_pct, avg_monthly_value, last_order_date, risk_status) VALUES
(1,  'Mehta Constructions',    'Contractor',     '9901112233', 'mehta@constr.com',    500000, 30,  2.0, 380000, DATE_SUB(CURDATE(),INTERVAL 2 DAY),  'LOW'),
(2,  'Sharma Constructions',   'Contractor',     '9902223344', 'sharma@constr.com',   400000, 45,  3.5, 320000, DATE_SUB(CURDATE(),INTERVAL 82 DAY), 'HIGH'),
(3,  'City Interiors Pvt Ltd', 'Interior Firm',  '9903334455', 'city@interiors.com',  300000, 30,  5.0, 280000, DATE_SUB(CURDATE(),INTERVAL 5 DAY),  'LOW'),
(4,  'Patel Hardware Store',   'Retailer',       '9904445566', 'patel@hardware.com',  200000, 21,  1.5, 180000, DATE_SUB(CURDATE(),INTERVAL 15 DAY), 'MEDIUM'),
(5,  'Kumar Furniture Works',  'Carpenter',      '9905556677', 'kumar@furn.com',      100000, 15,  4.0, 120000, DATE_SUB(CURDATE(),INTERVAL 3 DAY),  'LOW'),
(6,  'Nair Builders',          'Contractor',     '9906667788', 'nair@build.com',      350000, 30,  2.5, 250000, DATE_SUB(CURDATE(),INTERVAL 48 DAY), 'MEDIUM'),
(7,  'Sri Ram Traders',        'Retailer',       '9907778899', 'sriram@trade.com',    150000, 21,  1.0, 110000, DATE_SUB(CURDATE(),INTERVAL 10 DAY), 'LOW'),
(8,  'Decor Plus Interiors',   'Interior Firm',  '9908889900', 'decor@plus.com',      250000, 30,  6.0, 200000, DATE_SUB(CURDATE(),INTERVAL 20 DAY), 'LOW'),
(9,  'Excel Plywoods Retail',  'Retailer',       '9909990011', 'excel@ply.com',       120000, 14,  1.5, 90000,  DATE_SUB(CURDATE(),INTERVAL 60 DAY), 'HIGH'),
(10, 'Royal Furniture Makers', 'Carpenter',      '9900001122', 'royal@furn.com',      80000,  15,  3.0, 70000,  DATE_SUB(CURDATE(),INTERVAL 7 DAY),  'LOW');

-- ============================================================
-- 8. CUSTOMER ORDERS (mix of pending, dispatched, delayed)
-- ============================================================
INSERT INTO customer_orders (order_id, order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
(1, 'ORD-2026-0892', 1, CURDATE(), NULL, 'PENDING', 384000, 2.0, 30, '18mm BWP out of stock — awaiting PO-2026-0421'),
(2, 'ORD-2026-0891', 5, CURDATE(), NULL, 'PENDING', 86400,  4.0, 0,  NULL),
(3, 'ORD-2026-0890', 3, DATE_SUB(CURDATE(),INTERVAL 1 DAY), CURDATE(), 'DISPATCHED', 192000, 5.0, 0, NULL),
(4, 'ORD-2026-0889', 7, DATE_SUB(CURDATE(),INTERVAL 1 DAY), CURDATE(), 'DISPATCHED', 94600,  1.0, 0, NULL),
(5, 'ORD-2026-0888', 2, DATE_SUB(CURDATE(),INTERVAL 5 DAY), DATE_SUB(CURDATE(),INTERVAL 4 DAY), 'DELIVERED', 320000, 3.5, 0, NULL),
(6, 'ORD-2026-0887', 4, DATE_SUB(CURDATE(),INTERVAL 3 DAY), NULL, 'PENDING', 141200, 1.5, 12, 'Driver unavailable — rescheduled');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount_pct) VALUES
(1, 1, 200, 1920, 2.0),
(2, 4, 60,  940,  4.0),
(2, 12, 50, 760,  4.0),
(3, 5, 100, 1080, 5.0),
(3, 3, 80,  940,  5.0),
(4, 12, 70, 760,  1.0),
(4, 15, 60, 560,  1.0),
(5, 1, 100, 1920, 3.5),
(5, 2, 100, 1280, 3.5),
(6, 4, 80,  940,  1.5),
(6, 5, 60,  1080, 1.5);

-- ============================================================
-- 9. INVOICES (overdue receivables)
-- ============================================================
INSERT INTO invoices (invoice_number, customer_id, order_id, invoice_date, due_date, amount, paid_amount, status) VALUES
('INV-2026-1201', 2, 5, DATE_SUB(CURDATE(),INTERVAL 78 DAY), DATE_SUB(CURDATE(),INTERVAL 48 DAY), 320000, 0,      'OVERDUE'),
('INV-2026-1180', 6, NULL, DATE_SUB(CURDATE(),INTERVAL 52 DAY), DATE_SUB(CURDATE(),INTERVAL 22 DAY), 220000, 100000, 'PARTIAL'),
('INV-2026-1155', 9, NULL, DATE_SUB(CURDATE(),INTERVAL 65 DAY), DATE_SUB(CURDATE(),INTERVAL 44 DAY), 82000,  0,      'OVERDUE'),
('INV-2026-1290', 1, 1,   DATE_SUB(CURDATE(),INTERVAL 2 DAY),  DATE_ADD(CURDATE(),INTERVAL 28 DAY),  384000, 0,      'UNPAID'),
('INV-2026-1288', 3, 3,   DATE_SUB(CURDATE(),INTERVAL 1 DAY),  DATE_ADD(CURDATE(),INTERVAL 29 DAY),  192000, 192000, 'PAID'),
('INV-2026-1265', 4, 6,   DATE_SUB(CURDATE(),INTERVAL 3 DAY),  DATE_ADD(CURDATE(),INTERVAL 18 DAY),  141200, 0,      'UNPAID');

-- ============================================================
-- 10. STOCK MOVEMENTS (some OUT movements for dead stock detection)
-- ============================================================
INSERT INTO stock_movements (product_id, godown_id, movement_type, quantity, reference_no, note, moved_at) VALUES
-- Normal outbound movements (recent)
(1,  1, 'OUT', 50,  'ORD-2026-0888', 'Mehta Constructions dispatch', DATE_SUB(CURDATE(),INTERVAL 4 DAY)),
(2,  1, 'OUT', 60,  'ORD-2026-0888', 'Mehta Constructions dispatch', DATE_SUB(CURDATE(),INTERVAL 4 DAY)),
(3,  1, 'OUT', 80,  'ORD-2026-0890', 'City Interiors dispatch',       DATE_SUB(CURDATE(),INTERVAL 1 DAY)),
(4,  1, 'OUT', 60,  'ORD-2026-0891', 'Kumar Furniture',               CURDATE()),
(12, 1, 'OUT', 70,  'ORD-2026-0889', 'Sri Ram Traders',               DATE_SUB(CURDATE(),INTERVAL 1 DAY)),
-- Dead stock (last movement was 90+ days ago)
(7,  1, 'OUT', 4,   'ORD-2025-0344', 'Last sale 19mm Commercial',     DATE_SUB(CURDATE(),INTERVAL 95 DAY)),
(9,  1, 'OUT', 10,  'ORD-2025-0298', 'Last sale 6mm Gurjan BWP',      DATE_SUB(CURDATE(),INTERVAL 120 DAY)),
(8,  1, 'OUT', 6,   'ORD-2025-0312', 'Last sale 12mm Commercial',     DATE_SUB(CURDATE(),INTERVAL 100 DAY)),
-- Inbound (IN movements from PO receipts)
(12, 1, 'IN',  150, 'PO-2026-0410',  'Greenlam Laminates Teak',      DATE_SUB(CURDATE(),INTERVAL 2 DAY)),
(13, 1, 'IN',  120, 'PO-2026-0410',  'Greenlam Laminates Walnut',    DATE_SUB(CURDATE(),INTERVAL 2 DAY));

-- ============================================================
-- 11. GRN (Goods Receipt Notes)
-- ============================================================
INSERT INTO grn (grn_number, po_id, supplier_id, received_date, invoice_value, grn_value, match_status, discrepancy_amt, notes) VALUES
('GRN-2026-0088', 4, 4, DATE_SUB(CURDATE(),INTERVAL 2 DAY), 198000, 198000, 'MATCH',    0,     'Greenlam laminates — perfect match'),
('GRN-2026-0074', NULL, 3, DATE_SUB(CURDATE(),INTERVAL 25 DAY), 112000, 98000, 'MISMATCH', 14000, 'Gauri — 50 sheets short delivered');

-- ============================================================
-- 12. FREIGHT LANES (outbound delivery zones)
-- ============================================================
INSERT INTO freight_lanes (lane_id, lane_name, zone, distance_km, cost_per_sheet, avg_fill_pct, status) VALUES
(1, 'HSR-Whitefield',    'East Bangalore',   18, 14.50, 82.0, 'BEST'),
(2, 'HSR-Koramangala',   'Central Bangalore',  8,  8.40, 91.0, 'BEST'),
(3, 'HSR-Yeshwantpur',   'North Bangalore',  22, 17.00, 65.0, 'OK'),
(4, 'HSR-BTM',           'South Bangalore',  10, 19.00, 58.0, 'HIGH'),
(5, 'HSR-Electronic City','Far South',       34, 24.00, 54.0, 'WORST');

INSERT INTO freight_trips (lane_id, trip_date, vehicle_no, sheets_loaded, capacity_sheets, cost) VALUES
(1, DATE_SUB(CURDATE(),INTERVAL 1 DAY), 'KA01AB1234', 164, 200, 2378),
(2, DATE_SUB(CURDATE(),INTERVAL 1 DAY), 'KA01CD5678', 182, 200, 1529),
(3, DATE_SUB(CURDATE(),INTERVAL 2 DAY), 'KA01EF9012', 130, 200, 2210),
(4, CURDATE(),                           'KA01GH3456', 116, 200, 2204),
(5, DATE_SUB(CURDATE(),INTERVAL 3 DAY), 'KA01IJ7890', 108, 200, 2592);

-- ============================================================
-- 13. FINANCE SNAPSHOT (current month)
-- ============================================================
INSERT INTO finance_monthly (month_year, revenue, gross_profit, gross_margin_pct,
    gst_output, gst_itc, gst_net_payable,
    working_capital_days, dso_days, dio_days, dpo_days,
    outstanding_receivables, dead_stock_value, returns_value, notes) VALUES
(DATE_FORMAT(CURDATE(), '%Y-%m-01'),
 2840000, 636000, 22.4,
 511200, 428000, 83200,
 48, 34, 22, 8,
 1280000, 780000, 82000,
 'GSTR-3B due 20th. Hidden margin kill: Gauri Flexi freight Rs.28/sheet vs Century Rs.8.4/sheet');

-- ============================================================
-- 14. DEMAND FORECAST (next month predictions)
-- ============================================================
INSERT INTO demand_forecast (product_id, forecast_month, forecast_qty, actual_qty, demand_signal, notes) VALUES
(1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 596, NULL, 'SURGE +24%',    'Festival season uplift — Diwali construction peak'),
(2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 432, NULL, 'GROWING +13.7%','New housing project in Whitefield driving demand'),
(3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 448, NULL, 'STABLE +6.7%',  'Consistent demand from interior contractors'),
(4, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 298, NULL, 'DECLINING -6.9%','Shift to BWP grades, MR demand softening'),
(5, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 220, NULL, 'STABLE +2.1%',  'Steady contractor demand'),
(12, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 380, NULL, 'GROWING +18.2%','Interior design season boosting laminates'),
(14, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 180, NULL, 'SURGE +31.2%', 'New bulk order from Mehta Constructions confirmed');

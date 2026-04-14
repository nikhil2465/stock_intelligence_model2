-- =============================================================================
-- StockSense AI — MySQL Schema for Inventory Management
-- Run this script in your MySQL instance to set up the database.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS stocksense_inventory
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE stocksense_inventory;

-- ── CREATE USER (run as root) ─────────────────────────────────────────────────
-- CREATE USER IF NOT EXISTS 'stocksense'@'localhost' IDENTIFIED BY 'YourPassword123!';
-- GRANT ALL PRIVILEGES ON stocksense_inventory.* TO 'stocksense'@'localhost';
-- FLUSH PRIVILEGES;

-- =============================================================================
-- CORE MASTER TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS products (
    product_id      INT AUTO_INCREMENT PRIMARY KEY,
    sku_code        VARCHAR(60)  NOT NULL UNIQUE,
    sku_name        VARCHAR(120) NOT NULL,
    brand           VARCHAR(80)  NOT NULL DEFAULT 'Generic',
    category        ENUM('BWP Plywood','MR Plywood','Commercial','Laminate','Flexi') NOT NULL,
    thickness_mm    DECIMAL(4,1),
    size_ft         VARCHAR(20)  DEFAULT '8x4',
    unit            VARCHAR(20)  DEFAULT 'sheet',
    buy_price       DECIMAL(10,2) NOT NULL,
    sell_price      DECIMAL(10,2) NOT NULL,
    reorder_level   INT          DEFAULT 100,
    abc_class       ENUM('A','B','C') DEFAULT 'B',
    is_active       TINYINT(1)   DEFAULT 1,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS godowns (
    godown_id       INT AUTO_INCREMENT PRIMARY KEY,
    godown_name     VARCHAR(100) NOT NULL,
    location        VARCHAR(100),
    capacity_sheets INT         DEFAULT 2000,
    is_active       TINYINT(1)  DEFAULT 1
);

CREATE TABLE IF NOT EXISTS stock_levels (
    stock_id        INT AUTO_INCREMENT PRIMARY KEY,
    product_id      INT          NOT NULL,
    godown_id       INT          NOT NULL,
    quantity        INT          NOT NULL DEFAULT 0,
    last_updated    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (godown_id)  REFERENCES godowns(godown_id),
    UNIQUE KEY uq_product_godown (product_id, godown_id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id     INT AUTO_INCREMENT PRIMARY KEY,
    product_id      INT          NOT NULL,
    godown_id       INT          NOT NULL,
    movement_type   ENUM('IN','OUT','TRANSFER','ADJUSTMENT') NOT NULL,
    quantity        INT          NOT NULL,
    reference_no    VARCHAR(50),
    note            VARCHAR(255),
    moved_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (godown_id)  REFERENCES godowns(godown_id)
);

-- =============================================================================
-- SUPPLIERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id     INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name   VARCHAR(120) NOT NULL,
    contact_person  VARCHAR(80),
    phone           VARCHAR(20),
    email           VARCHAR(100),
    city            VARCHAR(60),
    on_time_pct     DECIMAL(5,2) DEFAULT 90.00,
    avg_delay_days  DECIMAL(4,1) DEFAULT 1.0,
    lead_time_days  INT          DEFAULT 7,
    freight_per_sheet DECIMAL(8,2),
    price_vs_market VARCHAR(50),
    grn_match_rate  DECIMAL(5,2) DEFAULT 95.00,
    recommendation  VARCHAR(50)  DEFAULT 'GOOD',
    is_active       TINYINT(1)   DEFAULT 1,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    po_id           INT AUTO_INCREMENT PRIMARY KEY,
    po_number       VARCHAR(30)  NOT NULL UNIQUE,
    supplier_id     INT          NOT NULL,
    po_date         DATE         NOT NULL,
    expected_date   DATE,
    received_date   DATE,
    status          ENUM('OPEN','PARTIAL','RECEIVED','OVERDUE','CANCELLED') DEFAULT 'OPEN',
    total_value     DECIMAL(12,2),
    notes           VARCHAR(255),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

CREATE TABLE IF NOT EXISTS po_items (
    po_item_id      INT AUTO_INCREMENT PRIMARY KEY,
    po_id           INT          NOT NULL,
    product_id      INT          NOT NULL,
    qty_ordered     INT          NOT NULL,
    qty_received    INT          DEFAULT 0,
    unit_price      DECIMAL(10,2),
    freight_per_sheet DECIMAL(8,2),
    FOREIGN KEY (po_id)        REFERENCES purchase_orders(po_id),
    FOREIGN KEY (product_id)   REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS grn (
    grn_id          INT AUTO_INCREMENT PRIMARY KEY,
    grn_number      VARCHAR(30)  NOT NULL UNIQUE,
    po_id           INT,
    supplier_id     INT          NOT NULL,
    received_date   DATE         NOT NULL,
    invoice_value   DECIMAL(12,2),
    grn_value       DECIMAL(12,2),
    match_status    ENUM('MATCH','MISMATCH','PENDING') DEFAULT 'PENDING',
    discrepancy_amt DECIMAL(10,2) DEFAULT 0,
    notes           VARCHAR(255),
    FOREIGN KEY (po_id)        REFERENCES purchase_orders(po_id),
    FOREIGN KEY (supplier_id)  REFERENCES suppliers(supplier_id)
);

-- =============================================================================
-- CUSTOMERS & SALES
-- =============================================================================

CREATE TABLE IF NOT EXISTS customers (
    customer_id     INT AUTO_INCREMENT PRIMARY KEY,
    customer_name   VARCHAR(120) NOT NULL,
    segment         ENUM('Contractor','Interior Firm','Retailer','Carpenter','Other') DEFAULT 'Other',
    phone           VARCHAR(20),
    email           VARCHAR(100),
    credit_limit    DECIMAL(12,2) DEFAULT 0,
    credit_days     INT           DEFAULT 30,
    avg_discount_pct DECIMAL(5,2) DEFAULT 0,
    avg_monthly_value DECIMAL(12,2) DEFAULT 0,
    last_order_date DATE,
    risk_status     ENUM('LOW','MEDIUM','HIGH','CHURNED') DEFAULT 'LOW',
    is_active       TINYINT(1)    DEFAULT 1,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_orders (
    order_id        INT AUTO_INCREMENT PRIMARY KEY,
    order_number    VARCHAR(30)  NOT NULL UNIQUE,
    customer_id     INT          NOT NULL,
    order_date      DATE         NOT NULL,
    dispatch_date   DATE,
    status          ENUM('PENDING','DISPATCHED','DELIVERED','CANCELLED') DEFAULT 'PENDING',
    total_value     DECIMAL(12,2),
    discount_pct    DECIMAL(5,2) DEFAULT 0,
    delayed_hrs     INT          DEFAULT 0,
    delay_reason    VARCHAR(255),
    FOREIGN KEY (customer_id)  REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id   INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT          NOT NULL,
    product_id      INT          NOT NULL,
    quantity        INT          NOT NULL,
    unit_price      DECIMAL(10,2),
    discount_pct    DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (order_id)     REFERENCES customer_orders(order_id),
    FOREIGN KEY (product_id)   REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS invoices (
    invoice_id      INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number  VARCHAR(30)  NOT NULL UNIQUE,
    customer_id     INT          NOT NULL,
    order_id        INT,
    invoice_date    DATE         NOT NULL,
    due_date        DATE,
    amount          DECIMAL(12,2) NOT NULL,
    paid_amount     DECIMAL(12,2) DEFAULT 0,
    outstanding     DECIMAL(12,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
    -- days_overdue is computed in the view (CURDATE() not allowed in stored generated columns)
    status          ENUM('UNPAID','PARTIAL','PAID','OVERDUE') DEFAULT 'UNPAID',
    FOREIGN KEY (customer_id)  REFERENCES customers(customer_id),
    FOREIGN KEY (order_id)     REFERENCES customer_orders(order_id)
);

-- =============================================================================
-- FREIGHT & LOGISTICS
-- =============================================================================

CREATE TABLE IF NOT EXISTS freight_lanes (
    lane_id         INT AUTO_INCREMENT PRIMARY KEY,
    lane_name       VARCHAR(100) NOT NULL,
    zone            VARCHAR(60),
    distance_km     INT,
    cost_per_sheet  DECIMAL(8,2),
    avg_fill_pct    DECIMAL(5,2),
    status          ENUM('BEST','OK','HIGH','WORST') DEFAULT 'OK'
);

CREATE TABLE IF NOT EXISTS freight_trips (
    trip_id         INT AUTO_INCREMENT PRIMARY KEY,
    lane_id         INT,
    trip_date       DATE         NOT NULL,
    vehicle_no      VARCHAR(20),
    sheets_loaded   INT,
    capacity_sheets INT          DEFAULT 200,
    fill_pct        DECIMAL(5,2) GENERATED ALWAYS AS (sheets_loaded * 100.0 / capacity_sheets) STORED,
    cost            DECIMAL(10,2),
    cost_per_sheet  DECIMAL(8,2) GENERATED ALWAYS AS (cost / NULLIF(sheets_loaded,0)) STORED,
    FOREIGN KEY (lane_id) REFERENCES freight_lanes(lane_id)
);

-- =============================================================================
-- DEMAND FORECASTING
-- =============================================================================

CREATE TABLE IF NOT EXISTS demand_forecast (
    forecast_id     INT AUTO_INCREMENT PRIMARY KEY,
    product_id      INT          NOT NULL,
    forecast_month  DATE         NOT NULL,
    forecast_qty    INT,
    actual_qty      INT,
    signal          VARCHAR(30),
    notes           VARCHAR(255),
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    UNIQUE KEY uq_product_month (product_id, forecast_month)
);

-- =============================================================================
-- FINANCE SNAPSHOTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS finance_monthly (
    snapshot_id     INT AUTO_INCREMENT PRIMARY KEY,
    month_year      DATE         NOT NULL UNIQUE,
    revenue         DECIMAL(14,2),
    gross_profit    DECIMAL(14,2),
    gross_margin_pct DECIMAL(5,2),
    gst_output      DECIMAL(12,2),
    gst_itc         DECIMAL(12,2),
    gst_net_payable DECIMAL(12,2),
    working_capital_days INT,
    dso_days        INT,
    dio_days        INT,
    dpo_days        INT,
    outstanding_receivables DECIMAL(14,2),
    dead_stock_value DECIMAL(14,2),
    returns_value   DECIMAL(12,2),
    notes           VARCHAR(255)
);

-- =============================================================================
-- USEFUL VIEWS
-- =============================================================================

CREATE OR REPLACE VIEW v_stock_summary AS
SELECT
    p.sku_code, p.sku_name, p.brand, p.category, p.thickness_mm,
    p.buy_price, p.sell_price, p.reorder_level, p.abc_class,
    COALESCE(SUM(sl.quantity), 0)                             AS total_qty,
    COALESCE(SUM(sl.quantity), 0) * p.buy_price               AS stock_value,
    CASE
        WHEN COALESCE(SUM(sl.quantity), 0) <= p.reorder_level THEN 'CRITICAL'
        WHEN COALESCE(SUM(sl.quantity), 0) <= p.reorder_level * 1.5 THEN 'LOW'
        WHEN COALESCE(SUM(sl.quantity), 0) >= p.reorder_level * 4 THEN 'OVERSTOCK'
        ELSE 'HEALTHY'
    END                                                        AS stock_status,
    p.sell_price - p.buy_price                                 AS gross_margin_per_unit,
    ROUND((p.sell_price - p.buy_price) / p.sell_price * 100, 1) AS margin_pct
FROM products p
LEFT JOIN stock_levels sl ON p.product_id = sl.product_id
WHERE p.is_active = 1
GROUP BY p.product_id;

CREATE OR REPLACE VIEW v_overdue_invoices AS
SELECT
    c.customer_name, c.segment, c.phone,
    i.invoice_number, i.invoice_date, i.due_date,
    i.amount, i.paid_amount, i.outstanding,
    CASE WHEN i.due_date < CURDATE() AND i.outstanding > 0
         THEN DATEDIFF(CURDATE(), i.due_date) ELSE 0
    END AS days_overdue,
    CASE
        WHEN DATEDIFF(CURDATE(), i.due_date) > 60 THEN 'HIGH'
        WHEN DATEDIFF(CURDATE(), i.due_date) > 30 THEN 'MEDIUM'
        ELSE 'LOW'
    END AS risk_level
FROM invoices i
JOIN customers c ON i.customer_id = c.customer_id
WHERE i.outstanding > 0 AND i.due_date < CURDATE()
ORDER BY days_overdue DESC;

CREATE OR REPLACE VIEW v_supplier_scorecard AS
SELECT
    s.supplier_name, s.on_time_pct, s.avg_delay_days,
    s.lead_time_days, s.freight_per_sheet, s.price_vs_market,
    s.grn_match_rate, s.recommendation,
    COUNT(po.po_id)                         AS total_pos,
    SUM(CASE WHEN po.status='OPEN' THEN 1 ELSE 0 END) AS open_pos,
    SUM(CASE WHEN po.status='OVERDUE' THEN 1 ELSE 0 END) AS overdue_pos,
    COALESCE(SUM(CASE WHEN po.status IN ('OPEN','OVERDUE') THEN po.total_value END), 0) AS open_value
FROM suppliers s
LEFT JOIN purchase_orders po ON s.supplier_id = po.supplier_id
WHERE s.is_active = 1
GROUP BY s.supplier_id;

CREATE OR REPLACE VIEW v_order_pipeline AS
SELECT
    co.order_number, c.customer_name, c.segment,
    co.order_date, co.dispatch_date, co.status,
    co.total_value, co.delayed_hrs, co.delay_reason,
    CASE WHEN co.delayed_hrs > 0 THEN 'DELAYED' ELSE 'ON_TIME' END AS sla_status
FROM customer_orders co
JOIN customers c ON co.customer_id = c.customer_id
WHERE co.order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
ORDER BY co.order_date DESC;

-- =============================================================================
-- SEED DATA (mirrors mock data in mcp_tools.py)
-- =============================================================================

INSERT IGNORE INTO godowns (godown_id, godown_name, location, capacity_sheets) VALUES
(1, 'Main WH (HSR Layout)',     'HSR Layout, Bangalore',   1800),
(2, 'Showroom (Koramangala)',   'Koramangala, Bangalore',  620),
(3, 'Overflow (Whitefield)',    'Whitefield, Bangalore',   540);

INSERT IGNORE INTO products (product_id, sku_code, sku_name, brand, category, thickness_mm, buy_price, sell_price, reorder_level, abc_class) VALUES
(1,  '18BWP-C-8x4',   '18mm BWP (8x4)',      'Century',     'BWP Plywood',  18.0, 1420, 1920, 120, 'A'),
(2,  '12BWP-C-8x4',   '12mm BWP (8x4)',      'Century',     'BWP Plywood',  12.0, 980,  1280, 200, 'A'),
(3,  '12MR-G-8x4',    '12mm MR Plain (8x4)', 'Greenply',    'MR Plywood',   12.0, 720,  940,  150, 'A'),
(4,  'LAM-TK-8x4',    'Laminates Teak',      'Greenlam',    'Laminate',     NULL, 580,  760,  80,  'A'),
(5,  '18MR-G-8x4',    '18mm MR (8x4)',       'Greenply',    'MR Plywood',   18.0, 820,  1060, 100, 'B'),
(6,  '8FX-GAU-8x4',   '8mm Flexi BWP',       'Gauri',       'Flexi',        8.0,  640,  840,  60,  'B'),
(7,  '10FX-GAU-8x4',  '10mm Flexi BWP',      'Gauri',       'Flexi',        10.0, 780,  980,  50,  'B'),
(8,  '6GUR-BWP-8x4',  '6mm Gurjan BWP',      'Greenply',    'BWP Plywood',  6.0,  860,  1100, 80,  'C'),
(9,  '4MR-PL-8x4',    '4mm MR Plain',        'Generic',     'MR Plywood',   4.0,  480,  620,  100, 'C'),
(10, '19COM-GEN-8x4', '19mm Commercial',     'Generic',     'Commercial',   19.0, 720,  920,  60,  'C');

INSERT IGNORE INTO stock_levels (product_id, godown_id, quantity) VALUES
(1,  1, 110), (1, 2, 20),  (1, 3, 10),   -- 18mm BWP: 140 total (critical)
(2,  1, 180), (2, 2, 30),  (2, 3, 10),   -- 12mm BWP: 220 total (critical)
(3,  1, 280), (3, 2, 40),  (3, 3, 20),   -- 12mm MR: 340 total (healthy)
(4,  1, 200), (4, 2, 60),  (4, 3, 20),   -- Laminates: 280 total
(5,  1, 240), (5, 2, 50),                 -- 18mm MR: 290 total
(6,  1, 90),  (6, 2, 20),                 -- 8mm Flexi: 110 (overstock at 74d)
(7,  1, 70),  (7, 2, 18),                 -- 10mm Flexi: 88 (overstock)
(8,  1, 160), (8, 2, 26),                 -- 6mm Gurjan: 186 (dead stock)
(9,  1, 200), (9, 2, 40),                 -- 4mm MR: 240 (dead stock)
(10, 1, 82),  (10, 2, 20);                -- 19mm Commercial: 102 (dead stock)

INSERT IGNORE INTO suppliers (supplier_id, supplier_name, contact_person, phone, on_time_pct, avg_delay_days, lead_time_days, freight_per_sheet, price_vs_market, grn_match_rate, recommendation) VALUES
(1, 'Century Plyboards',  'Rajesh Kumar',  '9845012345', 96.0, 0.4, 6,  8.40,  '-3% (below market)', 100.0, 'PREFERRED'),
(2, 'Gauri Laminates',    'Priya Sharma',  '9980123456', 68.0, 3.2, 11, 22.00, '+6% (above market)', 82.0,  'REVIEW'),
(3, 'Greenply Industries','Amit Patel',    '9741234567', 88.0, 1.2, 7,  12.60, '+1% (slightly above)', 94.0, 'GOOD');

INSERT IGNORE INTO purchase_orders (po_id, po_number, supplier_id, po_date, expected_date, status, total_value) VALUES
(1, 'PO-7730', 1, DATE_SUB(CURDATE(), INTERVAL 4 DAY),  CURDATE(),                        'OPEN',    420000),
(2, 'PO-7731', 2, DATE_SUB(CURDATE(), INTERVAL 14 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'OVERDUE', 280000),
(3, 'PO-7732', 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY),  DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'OPEN',    260000),
(4, 'PO-7734', 3, DATE_SUB(CURDATE(), INTERVAL 9 DAY),  DATE_SUB(CURDATE(), INTERVAL 2 DAY),  'OVERDUE', 280000);

INSERT IGNORE INTO customers (customer_id, customer_name, segment, phone, credit_days, avg_discount_pct, avg_monthly_value, last_order_date, risk_status) VALUES
(1,  'Mehta Constructions',     'Contractor',     '9880112233', 60, 4.0, 380000, CURDATE(),                              'LOW'),
(2,  'Sharma Constructions',    'Contractor',     '9741223344', 60, 9.2, 180000, DATE_SUB(CURDATE(), INTERVAL 78 DAY),   'HIGH'),
(3,  'Patel Contractors',       'Contractor',     '9845334455', 45, 3.5, 140000, DATE_SUB(CURDATE(), INTERVAL 2 DAY),    'MEDIUM'),
(4,  'Design Studio Patel',     'Interior Firm',  '9980445566', 30, 2.0, 160000, DATE_SUB(CURDATE(), INTERVAL 3 DAY),    'LOW'),
(5,  'City Interiors',          'Interior Firm',  '9741556677', 30, 3.2, 240000, DATE_SUB(CURDATE(), INTERVAL 47 DAY),   'MEDIUM'),
(6,  'Kumar & Sons',            'Retailer',       '9880667788', 30, 2.5, 210000, DATE_SUB(CURDATE(), INTERVAL 5 DAY),    'LOW'),
(7,  'Mehta Brothers',          'Retailer',       '9845778899', 45, 3.0, 120000, DATE_SUB(CURDATE(), INTERVAL 52 DAY),   'MEDIUM'),
(8,  'Rajan Interior',          'Interior Firm',  '9980889900', 30, 1.5, 80000,  DATE_SUB(CURDATE(), INTERVAL 31 DAY),   'LOW'),
(9,  'Raj Carpentry Works',     'Carpenter',      '9741990011', 15, 1.0, 90000,  DATE_SUB(CURDATE(), INTERVAL 1 DAY),    'LOW'),
(10, 'Gupta Materials Retail',  'Retailer',       '9880001122', 30, 2.8, 80000,  DATE_SUB(CURDATE(), INTERVAL 38 DAY),   'MEDIUM');

INSERT IGNORE INTO customer_orders (order_id, order_number, customer_id, order_date, status, total_value, delayed_hrs, delay_reason) VALUES
(1, 'ORD-2847', 1, CURDATE(), 'PENDING',    380000, 30, '18mm BWP stock shortage'),
(2, 'ORD-2848', 6, CURDATE(), 'DISPATCHED', 210000, 0,  NULL),
(3, 'ORD-2849', 4, CURDATE(), 'DISPATCHED', 160000, 0,  NULL),
(4, 'ORD-2850', 9, CURDATE(), 'DISPATCHED',  90000, 0,  NULL),
(5, 'ORD-2851', 3, CURDATE(), 'DISPATCHED', 140000, 0,  NULL),
(6, 'ORD-2852', 3, CURDATE(), 'PENDING',    120000, 4,  'QC pending on MR grade');

INSERT IGNORE INTO invoices (invoice_id, invoice_number, customer_id, order_id, invoice_date, due_date, amount, paid_amount, status) VALUES
(1, 'INV-3301', 2, NULL, DATE_SUB(CURDATE(), INTERVAL 108 DAY), DATE_SUB(CURDATE(), INTERVAL 78 DAY), 340000, 0,      'OVERDUE'),
(2, 'INV-3302', 7, NULL, DATE_SUB(CURDATE(), INTERVAL 82 DAY),  DATE_SUB(CURDATE(), INTERVAL 52 DAY), 210000, 0,      'OVERDUE'),
(3, 'INV-3303', 3, NULL, DATE_SUB(CURDATE(), INTERVAL 74 DAY),  DATE_SUB(CURDATE(), INTERVAL 44 DAY), 180000, 0,      'OVERDUE'),
(4, 'INV-3304', 8, NULL, DATE_SUB(CURDATE(), INTERVAL 61 DAY),  DATE_SUB(CURDATE(), INTERVAL 31 DAY), 120000, 0,      'OVERDUE'),
(5, 'INV-3305', 1, 1,    CURDATE(),                              DATE_ADD(CURDATE(), INTERVAL 60 DAY),  380000, 0,      'UNPAID');

INSERT IGNORE INTO freight_lanes (lane_id, lane_name, zone, distance_km, cost_per_sheet, avg_fill_pct, status) VALUES
(1, 'Whitefield',      'East Bangalore',   28, 14.00, 78.0, 'BEST'),
(2, 'Koramangala',     'South Bangalore',  14, 16.00, 72.0, 'OK'),
(3, 'HSR Layout',      'South Bangalore',  12, 17.00, 65.0, 'OK'),
(4, 'BTM Layout',      'South Bangalore',  10, 19.00, 58.0, 'HIGH'),
(5, 'Electronic City', 'Far South',        34, 24.00, 54.0, 'WORST');

INSERT IGNORE INTO finance_monthly (month_year, revenue, gross_profit, gross_margin_pct, gst_output, gst_itc, gst_net_payable, working_capital_days, dso_days, dio_days, dpo_days, outstanding_receivables, dead_stock_value, returns_value) VALUES
(DATE_FORMAT(CURDATE(), '%Y-%m-01'), 2840000, 636000, 22.4, 511200, 428000, 83200, 48, 34, 22, 8, 1280000, 780000, 82000);

INSERT IGNORE INTO demand_forecast (product_id, forecast_month, forecast_qty, actual_qty, signal) VALUES
(1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 596, NULL, 'SURGE +24%'),
(2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 432, NULL, 'GROWING +13.7%'),
(3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 448, NULL, 'STABLE +6.7%'),
(4, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 298, NULL, 'DECLINING -6.9%');

-- ============================================================
--  StockSense AI  —  MySQL Database Schema
--  Database: stocksense
--  Engine:   InnoDB  |  Charset: utf8mb4
-- ============================================================
--  Run:  mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS stocksense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stocksense;

-- ─────────────────────────────────────────────
--  1. GODOWNS (Warehouses)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS godowns (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    location      VARCHAR(120),
    total_value   DECIMAL(12,2),
    total_sheets  INT,
    capacity_pct  TINYINT,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO godowns (name, location, total_value, total_sheets, capacity_pct) VALUES
('Main WH (HSR Layout)',    'HSR Layout, Bangalore',    2840000, 1420, 82),
('Showroom (Koramangala)', 'Koramangala, Bangalore',   680000,  280,  45),
('Overflow (Whitefield)',  'Whitefield, Bangalore',    340000,  152,  28);


-- ─────────────────────────────────────────────
--  2. SKU INVENTORY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sku_inventory (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    sku_code        VARCHAR(60)  NOT NULL UNIQUE,
    sku_name        VARCHAR(120) NOT NULL,
    brand           VARCHAR(80),
    category        VARCHAR(60),
    abc_class       CHAR(1) DEFAULT 'C',  -- A / B / C
    godown_id       INT,
    current_stock   INT           DEFAULT 0,
    reorder_level   INT           DEFAULT 0,
    daily_sale_avg  DECIMAL(8,2)  DEFAULT 0,
    days_cover      SMALLINT      GENERATED ALWAYS AS
                      (IF(daily_sale_avg > 0, FLOOR(current_stock / daily_sale_avg), 999)) STORED,
    status          ENUM('CRITICAL','DEAD','OVERSTOCK','HEALTHY') DEFAULT 'HEALTHY',
    last_sale_date  DATE,
    days_no_movement SMALLINT DEFAULT 0,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (godown_id) REFERENCES godowns(id)
);

INSERT INTO sku_inventory
    (sku_code, sku_name, brand, category, abc_class, godown_id, current_stock, reorder_level, daily_sale_avg, status, last_sale_date, days_no_movement)
VALUES
('SKU-001', '18mm BWP (8x4)',   'Century',   'BWP',         'A', 1, 140, 120, 17.0, 'CRITICAL',  CURDATE() - INTERVAL 1 DAY,  0),
('SKU-002', '12mm BWP (8x4)',   'Century',   'BWP',         'A', 1, 220, 200, 20.0, 'CRITICAL',  CURDATE() - INTERVAL 1 DAY,  0),
('SKU-003', '12mm MR Plain',    'Greenply',  'MR',          'A', 1, 380, 100,  8.0, 'HEALTHY',   CURDATE() - INTERVAL 1 DAY,  0),
('SKU-004', 'Laminate Teak',    'Merino',    'Laminate',    'A', 2, 190,  60,  5.0, 'HEALTHY',   CURDATE() - INTERVAL 2 DAY,  0),
('SKU-005', '18mm MR (8x4)',    'Greenply',  'MR',          'B', 1, 240,  80,  7.0, 'HEALTHY',   CURDATE() - INTERVAL 1 DAY,  0),
('SKU-006', '8mm Flexi BWP',    'Gauri',     'Flexi',       'B', 3, 110,  30,  4.0, 'OVERSTOCK',  CURDATE() - INTERVAL 2 DAY, 0),
('SKU-007', '10mm Flexi BWP',   'Gauri',     'Flexi',       'B', 3,  88,  20,  1.2, 'OVERSTOCK',  CURDATE() - INTERVAL 5 DAY, 0),
('SKU-008', '6mm Gurjan BWP',   'Kitply',    'BWP',         'C', 1, 186,  40,  0.3, 'DEAD',      CURDATE() - INTERVAL 118 DAY, 118),
('SKU-009', '4mm MR Plain',     'Greenply',  'MR',          'C', 1, 240,  50,  0.1, 'DEAD',      CURDATE() - INTERVAL 97 DAY,  97),
('SKU-010', '19mm Commercial',  'Century',   'Commercial',  'C', 1, 102,  30,  0.07,'DEAD',      CURDATE() - INTERVAL 91 DAY,  91);


-- ─────────────────────────────────────────────
--  3. SKU PRICING  (True Landed Cost)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sku_pricing (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    sku_code        VARCHAR(60) NOT NULL,
    buy_price       DECIMAL(10,2),
    freight_per_sht DECIMAL(8,2),
    loading_cost    DECIMAL(8,2),
    wastage_cost    DECIMAL(8,2),
    true_cost       DECIMAL(10,2) GENERATED ALWAYS AS
                      (buy_price + freight_per_sht + loading_cost + wastage_cost) STORED,
    sell_price      DECIMAL(10,2),
    real_margin_pct DECIMAL(5,2)  GENERATED ALWAYS AS
                      (ROUND((sell_price - (buy_price + freight_per_sht + loading_cost + wastage_cost))
                       / sell_price * 100, 2)) STORED,
    stated_margin_pct DECIMAL(5,2),
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sku_pricing (sku_code)
);

INSERT INTO sku_pricing (sku_code, buy_price, freight_per_sht, loading_cost, wastage_cost, sell_price, stated_margin_pct) VALUES
('SKU-001', 1420, 42,  18, 14, 1920, 26.0),
('SKU-002', 1140, 42,  18, 12, 1580, 27.8),
('SKU-003',  720, 56,  12,  7,  940, 23.4),
('SKU-006',  640, 110, 15, 19,  840, 23.8),
('SKU-008',  840, 52,  16, 11, 1040, 19.2),
('SKU-009',  490, 56,  12,  7,  620, 21.0);


-- ─────────────────────────────────────────────
--  4. SKU DEMAND FORECASTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sku_forecasts (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    sku_code     VARCHAR(60) NOT NULL,
    curr_month   INT,
    f30_days     INT,
    f60_days     INT,
    f90_days     INT,
    signal       VARCHAR(60),   -- SURGE / GROWING / STABLE / DECLINING
    action       VARCHAR(255),
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sku_forecast (sku_code)
);

INSERT INTO sku_forecasts (sku_code, curr_month, f30_days, f60_days, f90_days, signal, action) VALUES
('SKU-001', 480, 596, 680, 712, 'SURGE +24%',     'Pre-order 300 extra sheets NOW'),
('SKU-003', 420, 448, 436, 380, 'STABLE +6.7%',   'Normal ordering cycle'),
('SKU-002', 380, 432, 498, 524, 'GROWING +13.7%', 'Increase stock by 25%'),
('SKU-004', 320, 298, 274, 250, 'DECLINING -6.9%','Reduce next order quantity');


-- ─────────────────────────────────────────────
--  5. SUPPLIERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    name                 VARCHAR(120) NOT NULL,
    on_time_pct          TINYINT,
    avg_delay_days       DECIMAL(4,1),
    price_vs_market_pct  DECIMAL(5,2),   -- negative = below market (good)
    lead_time_days_min   TINYINT,
    lead_time_days_max   TINYINT,
    freight_cost_per_sht DECIMAL(8,2),
    grn_match_rate_pct   TINYINT,
    delivery_fails_month TINYINT DEFAULT 0,
    open_pos             TINYINT DEFAULT 0,
    pending_po_value     DECIMAL(12,2),
    recommendation       VARCHAR(120),
    notes                TEXT,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO suppliers
    (name, on_time_pct, avg_delay_days, price_vs_market_pct, lead_time_days_min, lead_time_days_max,
     freight_cost_per_sht, grn_match_rate_pct, delivery_fails_month, open_pos, pending_po_value, recommendation, notes)
VALUES
('Century Plyboards', 96, 0.4, -3.0, 5, 6,  8.4,  100, 0, 2, 680000, 'PREFERRED - expand orders',
 'Best supplier. Full truck loads, lowest freight, 100% GRN match rate.'),
('Gauri Laminates',   68, 3.2, +6.0, 10, 11, 22.0, 82,  3, 1, 280000, 'REVIEW - consider alternate',
 'High delay, high freight (42% truck fill 240km), 18% GRN failure. True landed +11% above market.'),
('Greenply Industries',88, 1.2, +1.0, 7, 7, 12.6,  94,  1, 1, 280000, 'GOOD - second preferred',
 'Reliable second supplier. Slight price premium. Acceptable GRN match rate.');


-- ─────────────────────────────────────────────
--  6. PURCHASE ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    po_number     VARCHAR(20) NOT NULL UNIQUE,
    supplier_id   INT,
    sku_code      VARCHAR(60),
    qty_ordered   INT,
    rate          DECIMAL(10,2),
    po_value      DECIMAL(12,2) GENERATED ALWAYS AS (qty_ordered * rate) STORED,
    po_date       DATE,
    expected_date DATE,
    received_date DATE,
    status        ENUM('OPEN','RECEIVED','OVERDUE','CANCELLED') DEFAULT 'OPEN',
    grn_match     ENUM('MATCHED','MISMATCH','PENDING') DEFAULT 'PENDING',
    notes         TEXT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

INSERT INTO purchase_orders (po_number, supplier_id, sku_code, qty_ordered, rate, po_date, expected_date, status, grn_match) VALUES
('PO-7729', 1, 'SKU-001', 300, 1420, CURDATE()-INTERVAL 5 DAY, CURDATE()-INTERVAL 1 DAY, 'RECEIVED', 'MATCHED'),
('PO-7730', 1, 'SKU-002', 200, 1140, CURDATE()-INTERVAL 5 DAY, CURDATE()-INTERVAL 1 DAY, 'RECEIVED', 'MATCHED'),
('PO-7731', 2, 'SKU-006', 100, 640,  CURDATE()-INTERVAL 8 DAY, CURDATE()-INTERVAL 4 DAY, 'OVERDUE',  'PENDING'),
('PO-7732', 1, 'SKU-001', 300, 1420, CURDATE()-INTERVAL 2 DAY, CURDATE()+INTERVAL 4 DAY, 'OPEN',     'PENDING'),
('PO-7733', 1, 'SKU-002', 200, 1140, CURDATE()-INTERVAL 2 DAY, CURDATE()+INTERVAL 4 DAY, 'OPEN',     'PENDING'),
('PO-7734', 3, 'SKU-003', 150, 720,  CURDATE()-INTERVAL 9 DAY, CURDATE()-INTERVAL 2 DAY, 'OVERDUE',  'PENDING');


-- ─────────────────────────────────────────────
--  7. CUSTOMERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(120) NOT NULL,
    segment          ENUM('Contractor','Interior Firm','Retailer','Carpenter','Other') DEFAULT 'Other',
    phone            VARCHAR(20),
    email            VARCHAR(120),
    credit_days      TINYINT DEFAULT 30,
    avg_monthly_value DECIMAL(12,2),
    avg_margin_pct   DECIMAL(5,2),
    avg_dso          TINYINT,
    discount_given_pct DECIMAL(5,2) DEFAULT 0,
    standard_discount_pct DECIMAL(5,2) DEFAULT 4.8,
    days_since_last_order SMALLINT DEFAULT 0,
    risk_level       ENUM('LOW','MEDIUM','HIGH') DEFAULT 'LOW',
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers
    (name, segment, credit_days, avg_monthly_value, avg_margin_pct, avg_dso, discount_given_pct, days_since_last_order, risk_level, notes)
VALUES
('Mehta Constructions',  'Contractor',    45, 380000, 19.0, 28, 4.8,  1,  'LOW',    'Top contractor. 18mm BWP primary. Delayed order ORD-2847.'),
('Design Studio Patel',  'Interior Firm', 30, 160000, 31.0, 18, 3.2,  3,  'LOW',    'High-margin interior firm. Regular Laminate buyer.'),
('Kumar & Sons',         'Retailer',      30, 210000, 21.0, 22, 5.1,  2,  'LOW',    'Reliable retailer. Multi-SKU buyer.'),
('Raj Carpentry Works',  'Carpenter',     15,  90000, 22.0, 12, 2.1,  4,  'LOW',    'Cash buyer mostly. Good payment record.'),
('Sharma Constructions', 'Contractor',    60, 200000, 17.0, 78, 9.2,  12, 'HIGH',   'HIGH RISK: 78 days overdue. Rs 3.4L outstanding. Over-discounted.'),
('Mehta Brothers',       'Contractor',    45, 150000, 18.5, 52, 5.0,  8,  'MEDIUM', 'Rs 2.1L overdue 52 days. Follow up needed.'),
('Patel Contractors',    'Contractor',    45, 120000, 19.2, 44, 4.8,  6,  'MEDIUM', 'Rs 1.8L overdue 44 days.'),
('Rajan Interior',       'Interior Firm', 30,  80000, 28.0, 31, 3.5,  5,  'LOW',    'Rs 1.2L overdue 31 days. First late payment.'),
('City Interiors',       'Interior Firm', 30, 240000, 28.4, 18, 3.0, 47,  'HIGH',   'SILENT 47 days. Rs 2.4L/mo account. Possibly switched to competitor.'),
('Gupta Materials Retail','Retailer',     30,  80000, 20.0, 22, 4.5, 38,  'MEDIUM', 'Silent 38 days. Price complaint logged last month.'),
('SK Traders',           'Retailer',      30, 100000, 19.5, 25, 6.5,  5,  'LOW',    'Over-discounted. Costs Rs 8,400/month extra.');


-- ─────────────────────────────────────────────
--  8. RECEIVABLES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS receivables (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    customer_id   INT,
    invoice_no    VARCHAR(30) NOT NULL,
    invoice_date  DATE,
    due_date      DATE,
    amount        DECIMAL(12,2),
    paid_amount   DECIMAL(12,2) DEFAULT 0,
    outstanding   DECIMAL(12,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
    days_overdue  SMALLINT DEFAULT 0,
    risk_level    ENUM('LOW','MEDIUM','HIGH') DEFAULT 'LOW',
    status        ENUM('OPEN','PARTIAL','PAID','BAD_DEBT') DEFAULT 'OPEN',
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

INSERT INTO receivables (customer_id, invoice_no, invoice_date, due_date, amount, paid_amount, days_overdue, risk_level, status) VALUES
(5,  'INV-4421', CURDATE()-INTERVAL 108 DAY, CURDATE()-INTERVAL 78 DAY, 340000, 0,      78, 'HIGH',   'OPEN'),
(6,  'INV-4398', CURDATE()-INTERVAL 82 DAY,  CURDATE()-INTERVAL 52 DAY, 210000, 0,      52, 'MEDIUM', 'OPEN'),
(7,  'INV-4402', CURDATE()-INTERVAL 74 DAY,  CURDATE()-INTERVAL 44 DAY, 180000, 0,      44, 'MEDIUM', 'OPEN'),
(8,  'INV-4418', CURDATE()-INTERVAL 61 DAY,  CURDATE()-INTERVAL 31 DAY, 120000, 0,      31, 'LOW',    'OPEN'),
(1,  'INV-4430', CURDATE()-INTERVAL 20 DAY,  CURDATE()+INTERVAL 10 DAY, 280000, 150000,  0, 'LOW',    'PARTIAL');


-- ─────────────────────────────────────────────
--  9. SALES ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_orders (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    order_no       VARCHAR(20) NOT NULL UNIQUE,
    customer_id    INT,
    sku_code       VARCHAR(60),
    qty            INT,
    rate           DECIMAL(10,2),
    order_value    DECIMAL(12,2) GENERATED ALWAYS AS (qty * rate) STORED,
    order_date     DATETIME DEFAULT CURRENT_TIMESTAMP,
    dispatch_date  DATETIME,
    delay_hours    SMALLINT DEFAULT 0,
    status         ENUM('PENDING','DISPATCHED','DELIVERED','CANCELLED') DEFAULT 'PENDING',
    delay_reason   VARCHAR(255),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

INSERT INTO sales_orders (order_no, customer_id, sku_code, qty, rate, order_date, delay_hours, status, delay_reason) VALUES
('ORD-2847', 1, 'SKU-001', 200, 1920, NOW()-INTERVAL 30 HOUR, 30, 'PENDING',    '18mm BWP stock shortage'),
('ORD-2848', 2, 'SKU-004',  40, 1200, NOW()-INTERVAL 8 HOUR,   0, 'DISPATCHED', NULL),
('ORD-2849', 3, 'SKU-003',  80,  940, NOW()-INTERVAL 6 HOUR,   0, 'DISPATCHED', NULL),
('ORD-2850', 4, 'SKU-005',  30,  820, NOW()-INTERVAL 5 HOUR,   0, 'DISPATCHED', NULL),
('ORD-2851', 10,'SKU-003',  20,  940, NOW()-INTERVAL 4 HOUR,   0, 'DISPATCHED', NULL),
('ORD-2852', 7, 'SKU-003',  50,  940, NOW()-INTERVAL 3 HOUR,   4, 'PENDING',    'QC pending on MR grade'),
('ORD-2853', 2, 'SKU-004',  25, 1200, NOW()-INTERVAL 2 HOUR,   0, 'DISPATCHED', NULL),
('ORD-2854', 1, 'SKU-005',  60,  820, NOW()-INTERVAL 1 HOUR,   0, 'DISPATCHED', NULL);


-- ─────────────────────────────────────────────
-- 10. FREIGHT LANES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS freight_lanes (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    lane_name        VARCHAR(80) NOT NULL,
    cost_per_sheet   DECIMAL(8,2),
    avg_fill_pct     TINYINT,
    status           ENUM('BEST','OK','HIGH','WORST') DEFAULT 'OK',
    distance_km      SMALLINT,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO freight_lanes (lane_name, cost_per_sheet, avg_fill_pct, status, distance_km) VALUES
('Whitefield',     14, 78, 'BEST',  28),
('Koramangala',    16, 72, 'OK',    12),
('HSR Layout',     17, 65, 'OK',     8),
('BTM Layout',     19, 58, 'HIGH',  15),
('Electronic City',24, 54, 'WORST', 32);


-- ─────────────────────────────────────────────
-- 11. FINANCE SUMMARY  (Daily snapshot)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_summary (
    id                       INT AUTO_INCREMENT PRIMARY KEY,
    snapshot_date            DATE NOT NULL UNIQUE,
    revenue_mtd              DECIMAL(14,2),
    revenue_growth_pct       DECIMAL(5,2),
    gross_profit_mtd         DECIMAL(14,2),
    gross_margin_pct         DECIMAL(5,2),
    working_capital_days     TINYINT,
    dio_days                 TINYINT,
    dso_days                 TINYINT,
    dpo_days                 TINYINT,
    outstanding_receivables  DECIMAL(14,2),
    dead_stock_locked        DECIMAL(14,2),
    net_operating_cash       DECIMAL(14,2),
    gst_output_collected     DECIMAL(12,2),
    gst_itc_available        DECIMAL(12,2),
    gst_net_payable          DECIMAL(12,2),
    gst_unclaimed_itc        DECIMAL(12,2),
    gstr1_status             VARCHAR(20) DEFAULT 'Filed',
    gstr3b_status            VARCHAR(20) DEFAULT 'PENDING',
    returns_mtd              DECIMAL(12,2),
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO finance_summary
    (snapshot_date, revenue_mtd, revenue_growth_pct, gross_profit_mtd, gross_margin_pct,
     working_capital_days, dio_days, dso_days, dpo_days,
     outstanding_receivables, dead_stock_locked, net_operating_cash,
     gst_output_collected, gst_itc_available, gst_net_payable, gst_unclaimed_itc,
     gstr1_status, gstr3b_status, returns_mtd)
VALUES
(CURDATE(), 2840000, 9.2, 636000, 22.4,
 48, 22, 34, 8,
 1280000, 780000, 410000,
 511000, 428000, 83000, 14000,
 'Filed', 'PENDING', 82000);


-- ─────────────────────────────────────────────
-- 12. STOCK ANALYSIS VIEW  (convenience)
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_stock_analysis AS
SELECT
    si.sku_code,
    si.sku_name,
    si.brand,
    si.category,
    si.abc_class,
    si.current_stock,
    si.reorder_level,
    si.daily_sale_avg,
    si.days_cover,
    si.status,
    si.days_no_movement,
    sp.buy_price,
    sp.freight_per_sht,
    sp.true_cost,
    sp.sell_price,
    sp.real_margin_pct,
    sp.stated_margin_pct,
    (sp.stated_margin_pct - sp.real_margin_pct) AS margin_erosion_pct,
    ROUND(si.current_stock * sp.true_cost, 2)    AS stock_value,
    g.name AS godown_name,
    sf.signal AS demand_signal,
    sf.action AS demand_action,
    sf.f30_days
FROM sku_inventory si
LEFT JOIN sku_pricing  sp ON si.sku_code = sp.sku_code
LEFT JOIN godowns       g ON si.godown_id = g.id
LEFT JOIN sku_forecasts sf ON si.sku_code = sf.sku_code;


-- ─────────────────────────────────────────────
-- 13. RECEIVABLES SUMMARY VIEW
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_receivables_summary AS
SELECT
    c.name      AS customer_name,
    c.segment,
    r.invoice_no,
    r.amount,
    r.paid_amount,
    r.outstanding,
    r.days_overdue,
    r.risk_level,
    r.status
FROM receivables r
JOIN customers c ON r.customer_id = c.id
WHERE r.status NOT IN ('PAID')
ORDER BY r.days_overdue DESC;

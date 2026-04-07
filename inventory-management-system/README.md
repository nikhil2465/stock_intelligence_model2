# Inventory Management System - AI-Powered Stock Intelligence

A professional, full-stack inventory management solution with artificial intelligence-powered analytics, demand forecasting, and performance optimization.

## 🌟 Features

### Core Inventory Management
- **Inventory Tracking**: Real-time monitoring of all stock items with SKU management
- **Stock Status Monitoring**: Automatic alerts for low stock, critical items, and overstock situations
- **Category Management**: Organize inventory by categories for better control
- **Supplier Management**: Track supplier performance, delivery times, and quality scores

### AI-Powered Analytics & Intelligence
- **Stock Intelligence Engine**: Advanced AI algorithms for inventory optimization
  - ABC Analysis (Pareto Analysis) - Classify items by value contribution
  - Stockout Risk Assessment - Predict when items will run out
  - Slow-Moving Item Detection - Identify products to promote or discontinue
  - High-Demand Item Analysis - Optimize stock for fast-moving items

### Performance Analytics
- **Sales Trend Analysis**: Month-over-month growth tracking
- **Performance Metrics**: KPIs including inventory health score, turnover rate, revenue analysis
- **Supplier Performance Matrix**: Visualize supplier delivery times vs quality
- **Daily Sales Monitoring**: Track sales and returns patterns

### Demand Forecasting
- **Predictive Analytics**: 6-month demand forecasting using time series analysis
- **Confidence Intervals**: Understand forecast reliability for each prediction
- **Procurement Planning**: AI-generated recommendations for inventory levels
- **Risk Mitigation**: Identify potential stockout risks and optimization opportunities

### Visualization & Reporting
- **Interactive Charts**: Beautiful Recharts visualizations
  - Line charts for trends
  - Bar charts for comparisons
  - Pie charts for categorical distribution
  - Scatter plots for supplier analysis
- **Comprehensive Tables**: Detailed data views with filtering and sorting
- **Real-time Dashboard**: KPI cards with trends and status indicators

## 📁 Project Structure

```
inventory-management-system/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx         # Navigation menu
│   │   └── Navbar.jsx          # Top navigation bar
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main dashboard with KPIs
│   │   ├── InventoryListing.jsx # Inventory management interface
│   │   ├── StockIntelligence.jsx # AI recommendations & analysis
│   │   ├── PerformanceAnalytics.jsx # Performance metrics & trends
│   │   ├── Forecasting.jsx     # Demand forecasting
│   │   └── Settings.jsx        # Configuration & settings
│   ├── utils/
│   │   └── StockIntelligenceAI.js # Core AI analytics engine
│   ├── data/
│   │   └── database.js         # Mock database & sample data
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── index.html                  # HTML template
├── package.json               # Dependencies
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd inventory-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:5174
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📊 Key Components

### StockIntelligenceAI Engine
The core AI system that powers all analytics and recommendations:

```javascript
import StockIntelligenceAI from './utils/StockIntelligenceAI';

const ai = new StockIntelligenceAI(inventoryData);

// ABC Analysis
const classified = ai.abcAnalysis();

// Generate AI Recommendations
const recommendations = ai.generateRecommendations();

// Demand Forecasting
const forecast = ai.forecastDemand(salesData);

// Calculate KPIs
const kpis = ai.calculateKPIs(items, salesData);
```

### Key Features of the AI Engine
- **Inventory Metrics Calculation**: Stock value, days of inventory, profit margin
- **Stock Assessment**: Risk classification (CRITICAL, HIGH, MEDIUM, LOW)
- **Trend Analysis**: Growth rate analysis and performance classification
- **Demand Forecasting**: Time series prediction with confidence levels
- **Health Scoring**: Overall inventory health calculation (0-100)
- **Optimization Detection**: Identify overstocking and inefficiencies

## 📈 Data Models

### Inventory Item
```javascript
{
  id: 1,
  name: "Product Name",
  sku: "SKU-001",
  category: "Category",
  quantity: 45,
  reorderLevel: 20,
  unitPrice: 99.99,
  supplier: "Supplier Name",
  lastRestockDate: "2024-03-15",
  status: "In Stock",
  salesLast30Days: 12,
  turnoverRate: 0.267,
  trend: "up"
}
```

### Sales Data
```javascript
{
  month: "January",
  sales: 12500,
  revenue: 285000,
  units: 85
}
```

## 🎯 AI Algorithms & Methods

### 1. ABC Inventory Classification
Pareto Analysis (80/20 rule) to classify items by value contribution:
- **Class A**: High-value items (top 80% of value)
- **Class B**: Medium-value items (10-15% of value)
- **Class C**: Low-value items (remaining items)

### 2. Stockout Risk Assessment
Calculates days until stockout based on:
- Current inventory quantity
- Daily consumption rate (from sales data)
- Safety stock levels

### 3. Demand Forecasting
Uses time series analysis with:
- Historical sales trend extrapolation
- Average growth rate calculation
- Confidence level degradation over time periods
- Range predictions (low-high bounds)

### 4. Health Scoring
Calculates overall inventory health (0-100) based on:
- Low stock items count
- Slow-moving inventory
- Critical items
- High-performing items

### 5. Inventory Optimization
Identifies opportunities for:
- Overstock reduction
- Working capital optimization
- Storage space efficiency
- Supplier cost optimization

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark-Themed Sidebar**: Professional navigation with active state indicators
- **Card-Based Layout**: Organized information in easy-to-scan cards
- **Interactive Charts**: Hover tooltips, zoom, and legend toggling
- **Data Tables**: Sortable, filterable tables with status badges
- **Alert System**: Color-coded alerts (success, warning, danger, info)
- **Real-time Updates**: Live KPI cards with trend indicators

## 🔄 Workflow Examples

### Generate Stock Recommendations
```javascript
const ai = new StockIntelligenceAI(inventoryItems);
const recommendations = ai.generateRecommendations();
// Returns recommendations for reordering, slow-moving items, etc.
```

### Analyze Performance Trends
```javascript
const trends = ai.analyzeTrends(monthlySalesData);
// Returns month-over-month growth rates and classifications
```

### Get Demand Forecast
```javascript
const forecast = ai.forecastDemand(historicalData, 6);
// Returns 6-month sales predictions with confidence levels
```

### Calculate KPIs
```javascript
const kpis = ai.calculateKPIs(items, salesData);
// Returns key metrics: inventory value, growth rate, health score, etc.
```

## 🛠️ Technologies Used

- **Frontend Framework**: React 18.2
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useEffect)
- **Charting**: Recharts & Chart.js
- **Build Tool**: Vite 5.0
- **Styling**: CSS3 (custom variables, responsive grid)
- **HTTP Client**: Axios (ready for API integration)

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔐 Security Considerations

This is a frontend-only application. For production use:

1. **Backend Integration**: Implement secure API endpoints
2. **Authentication**: Add user authentication and authorization
3. **Data Validation**: Validate all user inputs
4. **API Security**: Use HTTPS, implement rate limiting
5. **Database Security**: Use secure database connections
6. **Audit Logging**: Track all inventory changes

## 🚀 Future Enhancements

- [ ] Real database integration (MySQL, PostgreSQL, MongoDB)
- [ ] User authentication & role-based access control
- [ ] Email & SMS notifications
- [ ] Mobile app (React Native)
- [ ] Advanced reporting & PDF export
- [ ] Machine learning models for demand prediction
- [ ] Barcode/QR code scanning
- [ ] Multi-warehouse support
- [ ] Integration with accounting software
- [ ] Automated reordering system

## 📝 Configuration

Edit your settings in the Settings page to:
- Set inventory thresholds
- Configure notifications
- Adjust display preferences
- Manage API integrations

## 🐛 Troubleshooting

### Port Already in Use
If port 5174 is already in use, Vite will automatically use the next available port.

### Dependency Issues
Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

### Build Errors
Ensure you're using Node.js v16 or higher:
```bash
node --version
```

## 📄 License

MIT License - Feel free to use this project for personal and commercial purposes.

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Built with ❤️ for better inventory management**

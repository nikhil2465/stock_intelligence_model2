/**
 * Stock Intelligence AI Analytics Engine
 * Performs advanced analytics on inventory data for performance analysis,
 * forecasting, and intelligent recommendations
 */

class StockIntelligenceAI {
  constructor(data) {
    this.data = data;
    this.insights = [];
    this.predictions = [];
  }

  /**
   * Calculate inventory metrics for each item
   */
  calculateInventoryMetrics() {
    return this.data.map(item => ({
      ...item,
      stockValue: item.quantity * item.unitPrice,
      daysOfInventory: item.salesLast30Days > 0 ? (item.quantity / item.salesLast30Days) * 30 : 0,
      stockoutRisk: this.calculateStockoutRisk(item),
      profitMargin: Math.random() * 0.5 + 0.2, // Simulated margin
    }));
  }

  /**
   * Calculate stockout risk based on consumption rate and current stock
   */
  calculateStockoutRisk(item) {
    const dailyConsumption = item.salesLast30Days / 30;
    const daysUntilStockout = item.quantity / dailyConsumption;
    
    if (daysUntilStockout <= 7) return 'CRITICAL';
    if (daysUntilStockout <= 14) return 'HIGH';
    if (daysUntilStockout <= 30) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Perform ABC Analysis (Pareto Analysis)
   * Classifies items based on their contribution to total value
   */
  abcAnalysis() {
    const metrics = this.calculateInventoryMetrics();
    const totalValue = metrics.reduce((sum, item) => sum + item.stockValue, 0);

    const sorted = [...metrics].sort((a, b) => b.stockValue - a.stockValue);
    const classified = sorted.map((item, index) => {
      const cumulativePercentage = sorted
        .slice(0, index + 1)
        .reduce((sum, i) => sum + i.stockValue, 0) / totalValue * 100;

      let classification = 'C';
      if (cumulativePercentage <= 80) classification = 'A';
      else if (cumulativePercentage <= 95) classification = 'B';

      return { ...item, classification, cumulativePercentage };
    });

    return classified;
  }

  /**
   * Analyze sales trends and growth patterns
   */
  analyzeTrends(salesData) {
    const trends = [];
    
    for (let i = 1; i < salesData.length; i++) {
      const previousMonth = salesData[i - 1];
      const currentMonth = salesData[i];
      const growth = ((currentMonth.sales - previousMonth.sales) / previousMonth.sales) * 100;
      
      trends.push({
        month: currentMonth.month,
        sales: currentMonth.sales,
        revenue: currentMonth.revenue,
        units: currentMonth.units,
        growthRate: growth.toFixed(2),
        trend: growth > 10 ? 'Strong Growth' : growth > 0 ? 'Growth' : 'Decline'
      });
    }

    return trends;
  }

  /**
   * Generate AI recommendations based on inventory analysis
   */
  generateRecommendations(items) {
    const recommendations = [];
    const metrics = this.calculateInventoryMetrics(items || this.data);

    metrics.forEach(item => {
      // Stock level warnings
      if (item.quantity < item.reorderLevel) {
        recommendations.push({
          id: `rec-${item.id}-1`,
          type: 'REORDER',
          itemId: item.id,
          itemName: item.name,
          severity: item.quantity === 0 ? 'CRITICAL' : 'HIGH',
          message: `Reorder ${item.name} immediately. Current stock: ${item.quantity}, Reorder level: ${item.reorderLevel}`,
          action: `Reorder ${Math.ceil(item.reorderLevel * 2)} units`,
          estimatedImpact: `Prevent potential stockout and lost revenue`
        });
      }

      // Slow-moving items
      if (item.turnoverRate < 0.2 && item.stockValue > 500) {
        recommendations.push({
          id: `rec-${item.id}-2`,
          type: 'SLOW_MOVING',
          itemId: item.id,
          itemName: item.name,
          severity: 'MEDIUM',
          message: `${item.name} is a slow-moving item. Consider promotions or discontinuation.`,
          action: `Launch promotion or consider discontinuing`,
          estimatedImpact: `Free up ${(item.stockValue).toFixed(2)} in capital`
        });
      }

      // High-turnover items - ensure stock
      if (item.turnoverRate > 5) {
        recommendations.push({
          id: `rec-${item.id}-3`,
          type: 'HIGH_DEMAND',
          itemId: item.id,
          itemName: item.name,
          severity: 'INFO',
          message: `${item.name} has high demand. Increase safety stock levels.`,
          action: `Increase safety stock by 20-30%`,
          estimatedImpact: `Reduce stockout risk and capture more sales`
        });
      }
    });

    return recommendations;
  }

  /**
   * Perform demand forecasting using simple predictive models
   */
  forecastDemand(historicalData, forecastPeriods = 6) {
    const forecast = [];
    const lastKnownValue = historicalData[historicalData.length - 1].sales;
    
    // Calculate average growth rate
    let totalGrowth = 0;
    for (let i = 1; i < historicalData.length; i++) {
      const growth = (historicalData[i].sales - historicalData[i - 1].sales) / historicalData[i - 1].sales;
      totalGrowth += growth;
    }
    const avgGrowthRate = totalGrowth / (historicalData.length - 1);

    // Generate forecasts
    let lastValue = lastKnownValue;
    const months = ['July', 'August', 'September', 'October', 'November', 'December'];
    
    for (let i = 0; i < forecastPeriods; i++) {
      const predictedValue = lastValue * (1 + avgGrowthRate);
      const confidence = Math.max(0.7, 0.95 - (i * 0.05)); // Confidence decreases over time

      forecast.push({
        month: months[i],
        predictedSales: Math.round(predictedValue),
        predictedRevenue: Math.round(predictedValue * 22.4), // Average revenue per unit
        confidence: (confidence * 100).toFixed(1),
        range: `${Math.round(predictedValue * 0.8)} - ${Math.round(predictedValue * 1.2)}`
      });

      lastValue = predictedValue;
    }

    return forecast;
  }

  /**
   * Calculate key performance indicators (KPIs)
   */
  calculateKPIs(items, salesData) {
    const metrics = this.calculateInventoryMetrics(items || this.data);
    const totalInventoryValue = metrics.reduce((sum, item) => sum + item.stockValue, 0);
    const totalUnits = items ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    const avgTurnover = metrics.reduce((sum, item) => sum + item.turnoverRate, 0) / metrics.length;
    
    const lastMonth = salesData[salesData.length - 1];
    const prevMonth = salesData[salesData.length - 2];
    const monthlyGrowth = ((lastMonth.sales - prevMonth.sales) / prevMonth.sales * 100).toFixed(2);

    return {
      totalInventoryValue: totalInventoryValue.toFixed(2),
      totalItemsInStock: totalUnits,
      averageTurnoverRate: avgTurnover.toFixed(2),
      lowStockItems: metrics.filter(i => i.quantity < i.reorderLevel).length,
      criticalItems: metrics.filter(i => i.stockoutRisk === 'CRITICAL').length,
      monthlyGrowthRate: monthlyGrowth,
      lastMonthRevenue: lastMonth.revenue.toFixed(2),
      lastMonthUnits: lastMonth.units,
      inventoryHealthScore: this.calculateHealthScore(metrics)
    };
  }

  /**
   * Calculate overall inventory health score (0-100)
   */
  calculateHealthScore(metrics) {
    let score = 100;

    // Deduct for low stock items
    const lowStockCount = metrics.filter(i => i.quantity < i.reorderLevel).length;
    score -= lowStockCount * 5;

    // Deduct for slow-moving items
    const slowMovingCount = metrics.filter(i => i.turnoverRate < 0.2 && i.stockValue > 500).length;
    score -= slowMovingCount * 3;

    // Deduct for critical items
    const criticalCount = metrics.filter(i => i.stockoutRisk === 'CRITICAL').length;
    score -= criticalCount * 10;

    // Add bonus for high-performing items
    const highPerformingCount = metrics.filter(i => i.turnoverRate > 5).length;
    score += highPerformingCount * 2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identify optimization opportunities
   */
  identifyOptimizations(items) {
    const optimizations = [];
    const metrics = this.calculateInventoryMetrics(items || this.data);

    // Overstocking analysis
    metrics.forEach(item => {
      if (item.daysOfInventory > 90 && item.quantity > item.reorderLevel * 3) {
        optimizations.push({
          type: 'OVERSTOCK',
          item: item.name,
          current: item.quantity,
          recommended: Math.ceil(item.reorderLevel * 1.5),
          potentialSavings: ((item.quantity - Math.ceil(item.reorderLevel * 1.5)) * item.unitPrice).toFixed(2),
          risk: 'Potential obsolescence and storage costs'
        });
      }
    });

    return optimizations;
  }
}

export default StockIntelligenceAI;

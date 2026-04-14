import { Chart } from 'chart.js/auto';

export const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export function baseOpts(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    ...extra,
  };
}

export function scaleXY(yCallback) {
  return {
    x: { grid: { color: '#e2e6ec' }, ticks: { color: '#9ca3af', font: { size: 9, family: 'JetBrains Mono' } } },
    y: { grid: { color: '#e2e6ec' }, ticks: { color: '#9ca3af', font: { size: 9, family: 'JetBrains Mono' }, callback: yCallback } },
  };
}

/** Create a Chart.js chart on a canvas ref, returns cleanup function */
export function createChart(canvasRef, config) {
  if (!canvasRef.current) return () => {};
  const chart = new Chart(canvasRef.current, config);
  return () => chart.destroy();
}

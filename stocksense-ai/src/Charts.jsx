import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function Charts() {
  const ref = useRef();

  useEffect(() => {
    const chart = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar"],
        datasets: [
          {
            label: "Sales",
            data: [10, 20, 15]
          }
        ]
      }
    });

    return () => chart.destroy();
  }, []);

  return <canvas ref={ref}></canvas>;
}
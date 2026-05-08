import React, { useMemo, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, getElementsAtEvent } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export const NewsChart = ({ newsData, onCategorySelect }) => {
  const { isDarkMode } = useTheme();
  const chartRef = useRef();

  const chartData = useMemo(() => {
    if (!newsData || newsData.length === 0) return null;

    const sourceCounts = newsData.reduce((acc, article) => {
      const source = article.source?.name || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(sourceCounts);
    const data = Object.values(sourceCounts);

    const bgColors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444',
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: bgColors.slice(0, labels.length),
          borderWidth: isDarkMode ? 2 : 1,
          borderColor: isDarkMode ? '#1e293b' : '#ffffff',
          hoverOffset: 4,
        },
      ],
    };
  }, [newsData, isDarkMode]);

  if (!chartData) {
    return <div className="h-full flex justify-center items-center text-slate-500">No data available</div>;
  }

  const textColor = isDarkMode ? '#f1f5f9' : '#0f172a';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: textColor,
          padding: 20,
          font: { family: "'Inter', sans-serif" }
        }
      }
    },
    cutout: '70%',
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
    }
  };

  const onClick = (event) => {
    const { current: chart } = chartRef;
    if (!chart) return;
    const elements = getElementsAtEvent(chart, event);
    if (elements.length > 0) {
      const dataIndex = elements[0].index;
      const label = chartData.labels[dataIndex];
      if (onCategorySelect) {
        onCategorySelect(label);
      }
    }
  };

  return <Doughnut ref={chartRef} data={chartData} options={options} onClick={onClick} />;
};

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const SpeedChart = ({ history }) => {
  const { isDarkMode } = useTheme();

  if (!history || history.length === 0) {
    return <div className="h-full flex justify-center items-center text-slate-500">Waiting for data...</div>;
  }

  const textColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const data = {
    labels: history.map((p) => {
      const d = new Date(p.timestamp * 1000);
      return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'ISS Speed (km/h)',
        data: history.map((p) => p.speed),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#3b82f6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
    },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'monospace' } },
        min: 27000, // typical lower bound
        max: 29000, // typical upper bound
      },
      x: {
        grid: { display: false },
        ticks: { color: textColor, maxTicksLimit: 10 },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  return <Line data={data} options={options} />;
};
